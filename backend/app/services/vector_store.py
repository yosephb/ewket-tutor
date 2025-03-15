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
import uuid

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

    async def add_exam_questions(self, exam_data: Dict) -> List[str]:
        """
        Add exam questions to the vector store using composite IDs.
        Each question document is built by concatenating the question text and options.
        A composite ID is created as <exam_id>_<original_question_id> to ensure global uniqueness.
        Exam metadata (unit_tags, topic_tags, answer, source) are stored with each embedding.
        """
        try:
            exam = exam_data.get("exam", {})
            exam_id = exam.get("exam_id", "default_exam")
            questions = exam.get("questions", [])
            if not questions:
                raise ValueError("No exam questions found in exam_data.")

            texts = []
            metadatas = []
            ids = []

            for question in questions:
                original_qid = question.get("question_id")
                if not original_qid:
                    continue  # Skip if no question_id is provided
                composite_qid = f"{exam_id}_{original_qid}"
                
                # Build document string by concatenating question text and options
                question_text = question.get("question_text", "")
                options = question.get("options", {})
                options_text = " ".join([f"{key}. {value}" for key, value in options.items()])
                doc_text = f"Exam Question: {question_text}\nOptions: {options_text}"

                # Convert list values to comma-separated strings
                unit_tags = question.get("unit_tags", [])
                topic_tags = question.get("topic_tags", [])
                
                metadata = {
                    "question_id": composite_qid,
                    "original_question_id": original_qid,
                    "exam_id": exam_id,
                    "exam_name": exam.get("exam_name", "Unknown Exam"),
                    "subject": exam.get("subject", "Unknown Subject"),
                    "year": exam.get("year", "Unknown Year"),
                    "unit_tags": ",".join(unit_tags) if isinstance(unit_tags, list) else str(unit_tags),
                    "topic_tags": ",".join(topic_tags) if isinstance(topic_tags, list) else str(topic_tags),
                    "answer": question.get("answer", ""),
                    "type": "exam_question"
                }

                texts.append(doc_text)
                metadatas.append(metadata)
                ids.append(composite_qid)

            # Generate embeddings for the exam documents
            embeddings = self.embedding_model.encode(texts).tolist()
            embeddings = np.array(embeddings)
            embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
            embeddings = embeddings.tolist()

            # Add exam questions to the collection
            self.collection.add(
                ids=ids,
                documents=texts,
                metadatas=metadatas,
                embeddings=embeddings
            )

            return ids

        except Exception as e:
            logger.error(f"Error adding exam questions: {str(e)}")
            raise

    async def add_single_exam_question(self, exam_id: str, exam_metadata: Dict, question: Dict) -> str:
        """Add a single exam question to the vector store."""
        try:
            logger.info(f"Adding single question embedding for exam {exam_id}")
            
            original_qid = question.get("question_id")
            if not original_qid:
                logger.error("No question_id provided")
                return None
            
            composite_qid = f"{exam_id}_{original_qid}"
            
            # Build document string by concatenating question text and options
            question_text = question.get("question_text", "")
            options = question.get("options", {})
            options_text = " ".join([f"{key}. {value}" for key, value in options.items()])
            doc_text = f"Exam Question: {question_text}\nOptions: {options_text}"
            
            # Convert list values to comma-separated strings
            unit_tags = question.get("unit_tags", [])
            topic_tags = question.get("topic_tags", [])
            
            metadata = {
                "question_id": composite_qid,
                "original_question_id": original_qid,
                "exam_id": exam_id,
                "exam_name": exam_metadata.get("exam_name", "Unknown Exam"),
                "subject": exam_metadata.get("subject", "Unknown Subject"),
                "year": exam_metadata.get("year", "Unknown Year"),
                "unit_tags": ",".join(unit_tags) if isinstance(unit_tags, list) else str(unit_tags),
                "topic_tags": ",".join(topic_tags) if isinstance(topic_tags, list) else str(topic_tags),
                "answer": question.get("answer", ""),
                "type": "exam_question"
            }
            
            # Generate embedding for the document
            embeddings = self.embedding_model.encode([doc_text]).tolist()
            embedding = np.array(embeddings[0])
            embedding = embedding / np.linalg.norm(embedding)
            
            # Add to collection
            self.collection.add(
                ids=[composite_qid],
                documents=[doc_text],
                metadatas=[metadata],
                embeddings=[embedding.tolist()]
            )
            
            logger.info(f"Successfully added embedding for question {original_qid}")
            return composite_qid
            
        except Exception as e:
            logger.error(f"Error adding single question embedding: {str(e)}")
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

    async def query(
        self, 
        query_text: str, 
        filters: Optional[Dict] = None,
        n_results: int = 5,
        content_types: Optional[List[str]] = None
    ) -> Dict:
        """Query the vector store with the given query text and return relevant results."""
        try:
            # Generate embedding for the query
            query_embedding = self.embedding_model.encode([query_text]).tolist()[0]
            
            # Prepare where clause for filtering
            where_clause = {}
            if filters:
                for key, value in filters.items():
                    if value:
                        where_clause[key] = value
                        
            # Add content type filter if specified
            if content_types:
                # We can't use $exists, so we'll try a different approach
                if "textbook" in content_types and "exam_question" in content_types:
                    # If both are selected, don't filter by type
                    # This will include both typed and untyped documents
                    pass  # Don't add type filter
                elif "textbook" in content_types:
                    # For textbook only, we can either:
                    # 1. Filter for type=textbook (might miss legacy entries)
                    # 2. Use $ne to exclude exam_questions
                    where_clause["type"] = {"$ne": "exam_question"}
                elif "exam_question" in content_types:
                    # For exam questions only
                    where_clause["type"] = "exam_question"
            
            logger.info(f"Query filters: {where_clause}")
            
            # Query the collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_clause if where_clause else None,
                include=["documents", "metadatas", "distances"]
            )
            
            # Log the query results
            logger.info(f"Query found {len(results.get('documents', [[]])[0])} documents")
            
            # Process and format results
            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            
            # Compute normalized scores (1.0 = best match, 0.0 = worst match)
            if distances:
                # Adjust distance to create better spread of scores using softmax
                adjusted_distances = [-5 * d for d in distances]  # Scale factor for better separation
                normalized_scores = softmax(adjusted_distances).tolist()
            else:
                normalized_scores = []
                
            # Group results by content type
            textbook_results = []
            exam_results = []
            
            for i, (doc, meta, dist, score) in enumerate(zip(documents, metadatas, distances, normalized_scores)):
                result = {
                    "document": doc,
                    "metadata": meta,
                    "distance": dist,
                    "score": score,
                    "id": results.get("ids", [[]])[0][i] if results.get("ids") else None
                }
                
                # Determine content type - assume textbook if not specified or not exam_question
                content_type = meta.get("type", "textbook")
                if content_type != "exam_question":
                    content_type = "textbook"  # Force to textbook for any non-exam type
                
                # Log content type for debugging
                logger.debug(f"Document {i} type: {content_type}")
                
                if content_type == "exam_question":
                    exam_results.append(result)
                else:
                    textbook_results.append(result)
                
            return {
                "documents": documents,
                "metadatas": metadatas,
                "distances": distances,
                "normalized_scores": normalized_scores,
                "chunk_ids": results.get("ids", [[]])[0] if results.get("ids") else [],
                "textbook_results": textbook_results,
                "exam_results": exam_results
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

    async def get_embedding(self, embedding_id: str) -> Dict:
        """Get a specific embedding by its ID."""
        try:
            result = self.collection.get(ids=[embedding_id])
            
            # Check if result exists and contains expected data
            if not result or not result.get("ids") or len(result.get("ids", [])) == 0:
                logger.warning(f"No embedding found with ID: {embedding_id}")
                return None
            
            # Safely create the response
            return {
                "id": result.get("ids", [])[0],
                "document": result.get("documents", [])[0] if result.get("documents") else "",
                "metadata": result.get("metadatas", [])[0] if result.get("metadatas") else {},
                "embedding": result.get("embeddings", [])[0] if result.get("embeddings") else None
            }
        except Exception as e:
            logger.error(f"Error retrieving embedding: {str(e)}")
            raise

    async def update_embedding_metadata(self, embedding_id: str, metadata: Dict) -> bool:
        """Update metadata for a specific embedding."""
        try:
            # Get current embedding
            embedding = await self.get_embedding(embedding_id)
            if not embedding:
                return False
            
            # Update metadata, preserving existing values not in the update
            updated_metadata = {**embedding["metadata"], **metadata}
            
            # Update in collection
            self.collection.update(
                ids=[embedding_id],
                metadatas=[updated_metadata]
            )
            
            return True
        except Exception as e:
            logger.error(f"Error updating embedding metadata: {str(e)}")
            raise

    async def delete_embedding(self, embedding_id: str) -> bool:
        """Delete a specific embedding by its ID."""
        try:
            logger.info(f"Attempting to delete embedding with ID: {embedding_id}")
            
            # Check if embedding exists
            embedding = await self.get_embedding(embedding_id)
            if not embedding:
                logger.warning(f"Embedding not found for deletion: {embedding_id}")
                return False
            
            # Delete from collection
            logger.info(f"Deleting embedding from collection: {embedding_id}")
            self.collection.delete(ids=[embedding_id])
            
            logger.info(f"Successfully deleted embedding: {embedding_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting embedding: {str(e)}", exc_info=True)
            # Return False instead of raising to prevent 500 errors
            return False

    async def get_exam_embeddings(self, exam_id: str) -> List[Dict]:
        """Get all embeddings for a specific exam."""
        try:
            # Query with filter for exam_id
            results = self.collection.get(
                where={"exam_id": exam_id}
            )
            
            embeddings = []
            for i in range(len(results["ids"])):
                embeddings.append({
                    "id": results["ids"][i],
                    "document": results["documents"][i],
                    "metadata": results["metadatas"][i]
                })
            
            return embeddings
        except Exception as e:
            logger.error(f"Error retrieving exam embeddings: {str(e)}")
            raise
