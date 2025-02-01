import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.client = chromadb.HttpClient(
            host=os.getenv("CHROMADB_HOST", "chromadb"),
            port=int(os.getenv("CHROMADB_PORT", 8000))
        )
        self.collection = self.client.get_or_create_collection("textbook_content")
        self.embedding_model = SentenceTransformer('multi-qa-mpnet-base-dot-v1')

    async def add_documents(self, chunks: List[Dict], metadata: Dict):
        """Add document chunks to the vector store."""
        try:
            texts = []
            metadatas = []
            ids = []

            for i, chunk in enumerate(chunks):
                chunk_id = f"{metadata['subject']}_grade_{metadata['grade']}_{i}"
                
                # Fix metadata access syntax
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

            # Add to collection
            self.collection.add(
                documents=texts,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings
            )

            return len(texts)

        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            raise

    async def query(self, query_text: str, filters: Optional[Dict] = None, 
                   n_results: int = 5) -> Dict:
        """Query the vector store."""
        try:
            query_embedding = self.embedding_model.encode(query_text).tolist()
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=filters if filters else None
            )
            
            return {
                "documents": results["documents"][0],
                "metadatas": results["metadatas"][0],
                "distances": results["distances"][0]
            }
            
        except Exception as e:
            logger.error(f"Error querying vector store: {str(e)}")
            raise