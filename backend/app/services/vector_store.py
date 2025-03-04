import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
import logging
import numpy as np
from scipy.special import softmax  # Softmax for better ranking
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, collection_name: str = "textbook_content_4"):
        print(os.getenv("CHROMADB_HOST", "localhost"))
        self.client = chromadb.HttpClient(
            #host=os.getenv("CHROMADB_HOST", "chromadb"), -"- when FASTAPI from within docker
            host="localhost",
            port=int(os.getenv("CHROMADB_PORT", 8000))
        )
        self.collection = self.client.get_or_create_collection(collection_name, metadata={"hnsw:space": "cosine"})
        self.embedding_model = SentenceTransformer("BAAI/bge-large-en-v1.5")

    async def add_documents(self, chunks: List[Dict], metadata: Dict):
        """Add document chunks to the vector store."""
        try:
            texts = []
            metadatas = []
            ids = []

            for i, chunk in enumerate(chunks):
                chunk_id = f"{metadata['subject']}_grade_{metadata['grade']}_{i}"
                
                chunk_metadata = {
                    "subject": metadata["subject"],
                    "grade": metadata["grade"],
                    "page": chunk["metadata"]["page_number"],
                    "chapter_number": chunk["metadata"]["chapter_number"],
                    "chapter_title": chunk["metadata"]["chapter_title"]
                }
                
                texts.append(chunk["text"])
                metadatas.append(chunk_metadata)
                ids.append(chunk_id)

            # Generate embeddings
            embeddings = self.embedding_model.encode(texts).tolist()
            embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)  # ✅ Normalize

            # Add to collection
            self.collection.add(
                documents=texts,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings
            )

            return ids  # Return the IDs instead of the length

        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            raise

    def filter_low_score_chunks(self, retrieved_chunks: list, threshold: float = 0.2) -> list:
        """Remove chunks with similarity scores below the threshold."""
        return [chunk for chunk in retrieved_chunks if chunk["retrieved_score"] >= threshold]

    def min_max_normalize(self, scores: np.ndarray) -> np.ndarray:
        """Normalize scores to [0,1] range using min-max scaling"""
        if len(scores) == 0:
            return scores
        
        min_score = np.min(scores)
        max_score = np.max(scores)
        
        if max_score > min_score:
            return (scores - min_score) / (max_score - min_score)
        else:
            return np.zeros_like(scores)  # All scores are equal

    async def query(self, query_text: str, filters: Optional[Dict] = None, 
                   n_results: int = 10) -> Dict:
        """Query the vector store."""
        try:
            query_embedding = self.embedding_model.encode(query_text)
            query_embedding = query_embedding / np.linalg.norm(query_embedding)  # Normalize

           
            
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=n_results,
                where=filters if filters else None
            )   

            # Convert distances to cosine similarities (since ChromaDB returns distances)
            distances = np.array(results["distances"][0])
            similarity_scores = 1 - distances  # Convert distance to similarity  


            normalized_scores = self.min_max_normalize(similarity_scores) 

            
            documents = results["documents"][0]
            metadatas = results["metadatas"][0]
            chunk_ids = results["ids"][0] 

           


            retrieved_chunks = []
            for i in range(len(documents)):
                retrieved_chunks.append({
                    "chunk_id": chunk_ids[i],
                    "text": documents[i],
                    "retrieved_score": normalized_scores[i],
                    "metadata": metadatas[i]})

            filtered_chunks = self.filter_low_score_chunks(retrieved_chunks)

            print('Final Filtered Scores:', [chunk["retrieved_score"] for chunk in filtered_chunks])

        

            return {
                "chunk_ids": [chunk["chunk_id"] for chunk in filtered_chunks],
                "documents": [chunk["text"] for chunk in filtered_chunks],
                "metadatas": [chunk["metadata"] for chunk in filtered_chunks],
                "distances": distances.tolist(),  # Original distances for debugging
                "normalized_scores": [chunk["retrieved_score"] for chunk in filtered_chunks]  # Final similarity scores
            }
            
       
        except Exception as e:
            logger.error(f"Error querying vector store: {str(e)}")
            raise

    def export_collection(self, output_path: Path) -> None:
        """Export collection data to JSON file."""
        data = {
            "ids": self.collection.get()["ids"],
            "documents": self.collection.get()["documents"],
            "metadatas": self.collection.get()["metadatas"],
            "embeddings": self.collection.get()["embeddings"]
        }
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)

    def delete_collection(self) -> None:
        """Delete the current collection."""
        self.client.delete_collection(self.collection.name)


