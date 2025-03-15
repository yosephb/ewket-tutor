from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Path as PathParam, Body
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime
import os
from pathlib import Path as FilePath
import logging

from ..models.exam import Exam, ExamWithQuestions, Question, ExamListResponse, PaginatedQuestions, EmbeddingResponse
from ..services.vector_store import VectorStore

# Initialize the vector store service
vector_store = VectorStore()

router = APIRouter()

# In-memory storage (in a real app, this would be a database)
exams_db = {}
questions_db = {}

# Storage paths
EXAMS_DIR = FilePath("app/data/exams")
EXAMS_DIR.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger(__name__)

@router.post("/upload", status_code=201)
async def upload_exam(file: UploadFile = File(...)):
    """
    Upload a new exam JSON file and process it
    """
    try:
        # Read the file content
        content = await file.read()
        exam_data = json.loads(content)
        
        # Basic validation
        if "exam" not in exam_data:
            raise HTTPException(status_code=400, detail="Invalid exam format: missing 'exam' field")
        
        exam_info = exam_data["exam"]
        if "questions" not in exam_info:
            raise HTTPException(status_code=400, detail="Invalid exam format: missing 'questions' field")
        
        # Create a unique ID for the exam
        exam_id = str(uuid.uuid4())
        
        # Extract exam metadata
        exam_obj = Exam(
            id=exam_id,
            exam_name=exam_info.get("exam_name", "Unnamed Exam"),
            subject=exam_info.get("subject", "Unknown"),
            year=exam_info.get("year", str(datetime.now().year)),
            question_count=len(exam_info["questions"]),
            has_embeddings=False,
            created_at=datetime.now()
        )
        
        # Process and store questions
        questions = []
        for q_data in exam_info["questions"]:
            question_id = q_data.get("question_id", str(uuid.uuid4()))
            question = Question(
                question_id=question_id,
                question_text=q_data.get("question_text", ""),
                options=q_data.get("options", {}),
                answer=q_data.get("answer", ""),
                unit_tags=q_data.get("unit_tags", []),
                topic_tags=q_data.get("topic_tags", []),
                has_embedding=False
            )
            questions.append(question)
            questions_db[question_id] = question.dict()
        
        # Store exam with questions
        exam_with_questions = ExamWithQuestions(
            **exam_obj.dict(),
            questions=questions
        )
        exams_db[exam_id] = exam_obj.dict()
        
        # Save to disk
        exam_dir = EXAMS_DIR / exam_id
        exam_dir.mkdir(exist_ok=True)
        
        with open(exam_dir / "exam.json", "w") as f:
            json.dump(exam_with_questions.dict(), f, default=str)
            
        with open(exam_dir / "questions.json", "w") as f:
            json.dump([q.dict() for q in questions], f, default=str)
        
        return {"status": "success", "message": "Exam uploaded successfully", "exam_id": exam_id}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing exam: {str(e)}")

@router.get("/list", response_model=ExamListResponse)
async def list_exams():
    """
    Get a list of all available exams
    """
    try:
        # In a real app, you would fetch from a database
        exams = []
        
        # Check if any files exist on disk
        if not exams_db:
            for exam_dir in EXAMS_DIR.glob("*"):
                if not exam_dir.is_dir():
                    continue
                    
                exam_file = exam_dir / "exam.json"
                if exam_file.exists():
                    with open(exam_file, "r") as f:
                        exam_data = json.load(f)
                        # Extract just the exam info without questions
                        exam_data.pop("questions", None)
                        exams_db[exam_data["id"]] = exam_data
        
        return {"status": "success", "exams": list(exams_db.values())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing exams: {str(e)}")

@router.get("/{exam_id}", response_model=ExamWithQuestions)
async def get_exam(exam_id: str = PathParam(..., description="The ID of the exam to retrieve")):
    """
    Get details of a specific exam including all questions
    """
    try:
        # Check if exam exists in memory
        if exam_id not in exams_db:
            # Try to load from disk
            exam_file = EXAMS_DIR / exam_id / "exam.json"
            if not exam_file.exists():
                raise HTTPException(status_code=404, detail="Exam not found")
                
            with open(exam_file, "r") as f:
                exam_data = json.load(f)
                exams_db[exam_id] = {k: v for k, v in exam_data.items() if k != "questions"}
                
                # Load questions
                for question in exam_data.get("questions", []):
                    questions_db[question["question_id"]] = question
        
        # Load questions for this exam
        questions_file = EXAMS_DIR / exam_id / "questions.json"
        if questions_file.exists():
            with open(questions_file, "r") as f:
                questions = json.load(f)
        else:
            # Filter questions for this exam (in a real app, this would be a database query)
            questions = [q for q in questions_db.values() if q.get("exam_id") == exam_id]
        
        # Create the full exam with questions
        exam_with_questions = {
            **exams_db[exam_id],
            "questions": questions
        }
        
        return exam_with_questions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving exam: {str(e)}")

@router.get("/{exam_id}/questions", response_model=PaginatedQuestions)
async def get_exam_questions(
    exam_id: str = PathParam(..., description="The ID of the exam"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of questions per page"),
    tags: Optional[str] = Query(None, description="Comma-separated list of tags to filter by")
):
    """
    Get paginated questions for a specific exam
    """
    try:
        # Load questions for this exam
        questions_file = EXAMS_DIR / exam_id / "questions.json"
        if not questions_file.exists():
            raise HTTPException(status_code=404, detail="Exam questions not found")
            
        with open(questions_file, "r") as f:
            all_questions = json.load(f)
        
        # Filter by tags if provided
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            filtered_questions = []
            for question in all_questions:
                question_tags = question.get("unit_tags", []) + question.get("topic_tags", [])
                if any(tag in question_tags for tag in tag_list):
                    filtered_questions.append(question)
            all_questions = filtered_questions
            
        # Apply pagination
        total_questions = len(all_questions)
        total_pages = (total_questions + page_size - 1) // page_size if total_questions > 0 else 1
        
        # Ensure page is valid
        if page > total_pages and total_pages > 0:
            page = total_pages
            
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, total_questions)
        paged_questions = all_questions[start_idx:end_idx]
        
        return {
            "status": "success",
            "questions": paged_questions,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "total_items": total_questions
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving questions: {str(e)}")

@router.post("/{exam_id}/embeddings", response_model=EmbeddingResponse)
async def create_exam_embeddings(exam_id: str = PathParam(...)):
    """
    Create embeddings for all questions in an exam
    """
    try:
        # Load exam data
        exam_file = EXAMS_DIR / exam_id / "exam.json"
        if not exam_file.exists():
            raise HTTPException(status_code=404, detail="Exam not found")
            
        with open(exam_file, "r") as f:
            exam_data = json.load(f)
            
        # If embeddings already exist, don't recreate them
        if exam_data.get("has_embeddings", False):
            return {
                "status": "success",
                "message": "Embeddings already exist for this exam",
                "processed_count": 0
            }
            
        # Format exam data for the vector store
        formatted_exam_data = {
            "exam": {
                "exam_id": exam_id,
                "exam_name": exam_data.get("exam_name", "Unknown Exam"),
                "subject": exam_data.get("subject", "Unknown Subject"),
                "year": exam_data.get("year", "Unknown Year"),
                "questions": exam_data.get("questions", [])
            }
        }
        
        # Process all questions
        ids = await vector_store.add_exam_questions(formatted_exam_data)
        
        # Update questions with embedding info
        for i, question in enumerate(exam_data.get("questions", [])):
            if i < len(ids):
                question["has_embedding"] = True
                question["embedding_id"] = ids[i]
                
        # Update exam status
        exam_data["has_embeddings"] = True
        
        # Save updated data
        with open(exam_file, "w") as f:
            json.dump(exam_data, f, default=str)
            
        # Also update questions.json
        questions_file = EXAMS_DIR / exam_id / "questions.json"
        if questions_file.exists():
            with open(questions_file, "w") as f:
                json.dump(exam_data.get("questions", []), f, default=str)
                
        # Update in-memory storage
        if exam_id in exams_db:
            exams_db[exam_id]["has_embeddings"] = True
                
        return {
            "status": "success",
            "message": f"Created embeddings for {len(ids)} questions",
            "processed_count": len(ids)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating embeddings: {str(e)}")

@router.post("/questions/{question_id}/embeddings", response_model=EmbeddingResponse)
async def create_question_embedding_direct(question_id: str = PathParam(...)):
    """
    Create embedding for a single question (directly by question ID)
    """
    try:
        # We need to find which exam this question belongs to
        # Look through all exam directories
        exams_dir = FilePath("app/data/exams")
        exam_id = None
        question = None
        exam_data = None
        
        # Search through all exam files to find the question
        for exam_dir in exams_dir.iterdir():
            if not exam_dir.is_dir():
                continue
                
            exam_file = exam_dir / "exam.json"
            if not exam_file.exists():
                continue
                
            with open(exam_file, "r") as f:
                current_exam = json.load(f)
                
            # Check if this question exists in this exam
            for q in current_exam.get("questions", []):
                if q.get("question_id") == question_id:
                    exam_id = exam_dir.name
                    question = q
                    exam_data = current_exam
                    break
                    
            if exam_id:
                break
                
        if not exam_id or not question:
            raise HTTPException(status_code=404, detail="Question not found in any exam")
            
        # Skip if embedding already exists
        if question.get("has_embedding", False):
            return {
                "status": "success",
                "message": "Embedding already exists for this question",
                "processed_count": 0
            }
            
        # Get exam metadata for the embedding
        exam_metadata = {
            "exam_name": exam_data.get("exam_name", "Unknown Exam"),
            "subject": exam_data.get("subject", "Unknown Subject"),
            "year": exam_data.get("year", "Unknown Year")
        }
        
        # Create the embedding
        embedding_id = await vector_store.add_single_exam_question(
            exam_id=exam_id,
            exam_metadata=exam_metadata,
            question=question
        )
        
        if embedding_id:
            # Update the question with embedding info
            for i, q in enumerate(exam_data.get("questions", [])):
                if q.get("question_id") == question_id:
                    exam_data["questions"][i]["has_embedding"] = True
                    exam_data["questions"][i]["embedding_id"] = embedding_id
                    
            # Save updated exam data
            exam_file = exams_dir / exam_id / "exam.json"
            with open(exam_file, "w") as f:
                json.dump(exam_data, f, default=str)
                
            # Update questions.json if it exists
            questions_file = exams_dir / exam_id / "questions.json"
            if questions_file.exists():
                with open(questions_file, "w") as f:
                    json.dump(exam_data.get("questions", []), f, default=str)
                    
            return {
                "status": "success",
                "message": "Created embedding for question",
                "processed_count": 1
            }
            
        raise HTTPException(status_code=500, detail="Failed to create embedding")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating embedding: {str(e)}")

@router.get("/{exam_id}/embeddings", response_model=List[Dict])
async def get_exam_embeddings(exam_id: str = PathParam(...)):
    """Get all embeddings for an exam"""
    try:
        embeddings = await vector_store.get_exam_embeddings(exam_id)
        
        if not embeddings:
            return []
            
        return embeddings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving embeddings: {str(e)}")

@router.get("/{exam_id}/questions/{question_id}/embedding")
async def get_question_embedding(exam_id: str = PathParam(...), question_id: str = PathParam(...)):
    """Get embedding for a specific question"""
    try:
        composite_id = f"{exam_id}_{question_id}"
        logger.info(f"Retrieving embedding for ID: {composite_id}")
        
        embedding = await vector_store.get_embedding(composite_id)
        
        if not embedding:
            logger.warning(f"Embedding not found for ID: {composite_id}")
            raise HTTPException(status_code=404, detail="Embedding not found")
            
        return embedding
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving embedding: {str(e)}")

@router.delete("/{exam_id}/questions/{question_id}/embedding", response_model=Dict)
async def delete_question_embedding(exam_id: str = PathParam(...), question_id: str = PathParam(...)):
    """Delete embedding for a specific question"""
    try:
        logger.info(f"Request to delete embedding for exam {exam_id}, question {question_id}")
        
        # Get exam file path
        exam_dir = FilePath("app/data/exams")
        exam_file = exam_dir / exam_id / "exam.json"
        logger.info(f"Looking for exam file at: {exam_file}")
        
        if not exam_file.exists():
            logger.warning(f"Exam file not found: {exam_file}")
            raise HTTPException(status_code=404, detail="Exam not found")
            
        # Load exam data
        with open(exam_file, "r") as f:
            exam_data = json.load(f)
            
        # Construct embedding ID
        embedding_id = f"{exam_id}_{question_id}"
        logger.info(f"Constructed embedding ID: {embedding_id}")
        
        # Delete embedding first, before updating file
        deleted = await vector_store.delete_embedding(embedding_id)
        logger.info(f"Deletion result: {deleted}")
        
        if deleted:
            # Find the question and update it
            question_found = False
            for i, question in enumerate(exam_data.get("questions", [])):
                if question.get("question_id") == question_id:
                    question_found = True
                    logger.info(f"Found question at index {i}, updating embedding status")
                    
                    # Update question data
                    exam_data["questions"][i]["has_embedding"] = False
                    if "embedding_id" in exam_data["questions"][i]:
                        del exam_data["questions"][i]["embedding_id"]
                    
            if not question_found:
                logger.warning(f"Question {question_id} not found in exam {exam_id}")
                # Still return success if embedding was deleted
                return {
                    "status": "success",
                    "message": "Embedding deleted, but question not found in exam data"
                }
                
            # Save updated exam data
            try:
                with open(exam_file, "w") as f:
                    json.dump(exam_data, f, default=str)
                    
                # Update questions.json if it exists
                questions_file = exam_dir / exam_id / "questions.json"
                if questions_file.exists():
                    logger.info(f"Updating questions file: {questions_file}")
                    with open(questions_file, "w") as f:
                        json.dump(exam_data.get("questions", []), f, default=str)
                
                # Check if any questions still have embeddings
                any_embedded = any(q.get("has_embedding", False) for q in exam_data.get("questions", []))
                exam_data["has_embeddings"] = any_embedded
                
                logger.info("Successfully updated exam data files")
            except Exception as file_error:
                logger.error(f"Error updating exam files: {str(file_error)}")
                # Still return success since the embedding was deleted
                return {
                    "status": "success",
                    "message": "Embedding deleted, but could not update exam files"
                }
            
            logger.info("Embedding deletion completed successfully")
            return {
                "status": "success",
                "message": "Embedding deleted successfully"
            }
        else:
            # If deletion failed but didn't throw an exception, return a 404
            logger.warning(f"Embedding {embedding_id} not found or could not be deleted")
            raise HTTPException(status_code=404, detail="Embedding not found or could not be deleted")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_question_embedding: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting embedding: {str(e)}")

@router.put("/{exam_id}/questions/{question_id}/embedding/metadata", response_model=Dict)
async def update_question_embedding_metadata(
    exam_id: str = PathParam(...), 
    question_id: str = PathParam(...),
    metadata: Dict = Body(...)
):
    """Update metadata for a specific question embedding"""
    try:
        composite_id = f"{exam_id}_{question_id}"
        updated = await vector_store.update_embedding_metadata(composite_id, metadata)
        
        if not updated:
            raise HTTPException(status_code=404, detail="Embedding not found")
            
        return {
            "status": "success",
            "message": "Embedding metadata updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating embedding metadata: {str(e)}") 