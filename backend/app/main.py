from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pathlib import Path
import json
from datetime import datetime

import logging
from typing import Dict

from .routers import student, admin, exam  
from .services.pdf_service import PDFService
from .services.vector_store import VectorStore
from .services.llm_service import LLMService

# Initialize services
pdf_service = PDFService()
vector_store = VectorStore()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ewket Tutor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the Student router with prefix /student
app.include_router(student.router, prefix="/student", tags=["student"])

# Include the Admin router with prefix /admin
app.include_router(admin.router, prefix="/admin", tags=["admin"])

# Include the Exam router with prefix /api/admin/exams
app.include_router(exam.router, prefix="/api/admin/exams", tags=["exams"])

@app.get("/health")
async def health_check():
    """
    Generic health endpoint for the entire service
    """
    return {"status": "healthy"}

@app.post("/api/admin/documents/chunk")
async def chunk_document(
    file: UploadFile = File(...),
    subject: Optional[str] = Form(None),
    grade: Optional[str] = Form(None),
):
    try:

        metadata = {
        "subject": subject,
        "grade": grade
        }

        # Use relative path from where the application is running
        upload_dir = Path("app/data/uploads")
        #upload_dir.mkdir(parents=True, exist_ok=True)
        

        upload_path = upload_dir/file.filename
        print(f"Saving file to: {upload_path}")
        
        with upload_path.open("wb") as buffer:
            content = await file.read()
            buffer.write(content)


        #pdf_path = "/mnt/c/CursTest/Production/Books/Biology-Student-Textbook-Grade-9.pdf"
        
       
        # Save the uploaded file
        #file_path = await pdf_service.save_upload(file)

        #print(upload_path)
        
        # Process the PDF into chunks
        chunks = await pdf_service.process_pdf(
            file_path=str(upload_path),
            subject=subject,
            grade = grade
        )

        # print(len(chunks))       
       
        # Store chunks in vector store
        #num_chunks = await vector_store.add_documents(chunks, metadata)
        
        #chunks = 'yello'

        return {
            "status": "success",
            "message": f"Document processed into {len(chunks)} chunks",
            "num_chunks": len(chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/documents/chunks")
async def get_chunks():
    try:
        # Get all chunks from the output directory
        #chunks_dir = Path("app/data/uploads")
        chunks_dir = Path("/mnt/c/CursTest/Production/Extract")
        all_chunks = []
        
        # Look for all JSON files containing chunks
        for json_file in chunks_dir.glob("**/chunks/*.json"):
            with open(json_file, 'r', encoding='utf-8') as f:
                chunks_data = json.load(f)
                # Add source file information
                for chunk in chunks_data:
                    chunk['source_file'] = json_file.parent.parent.name
                all_chunks.extend(chunks_data)

        return {
            "status": "success",
            "chunks": all_chunks
        }
    except Exception as e:
        logger.error(f"Error fetching chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/documents/folders")
async def get_folders():
    try:
        folders = []
        chunks_dir = Path("/mnt/c/CursTest/Production/Extract")
        
        for folder in chunks_dir.glob("pdf_extraction_*"):
            if folder.is_dir():
                folders.append({
                    "name": folder.name,
                    "created_at": folder.stat().st_mtime,
                    "path": str(folder)
                })
        
        # Sort folders by creation time, newest first
        folders.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {
            "status": "success",
            "folders": folders
        }
    except Exception as e:
        logger.error(f"Error fetching folders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/documents/chunks/{folder_name}")
async def get_chunks_for_folder(
    folder_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    try:
        folder_path = Path("/mnt/c/CursTest/Production/Extract") / folder_name
        if not folder_path.exists():
            raise HTTPException(status_code=404, detail="Folder not found")
            
        chunks_file = folder_path / "all_chunks.json"
        if not chunks_file.exists():
            raise HTTPException(status_code=404, detail="Chunks file not found")
            
        with open(chunks_file, 'r', encoding='utf-8') as f:
            all_chunks = json.load(f)
            
        # Calculate pagination
        total_chunks = len(all_chunks)
        total_pages = (total_chunks + page_size - 1) // page_size
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        chunks_page = all_chunks[start_idx:end_idx]
            
        return {
            "status": "success",
            "chunks": chunks_page,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "total_items": total_chunks
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/documents/index/{folder_name}")
async def index_document_chunks(folder_name: str):
    logger.info(f"Received indexing request for folder: {folder_name}")
    try:
        folder_path = Path("/mnt/c/CursTest/Production/Extract") / folder_name
        logger.info(f"Checking folder path: {folder_path}")
        
        if not folder_path.exists():
            logger.error(f"Folder not found: {folder_path}")
            raise HTTPException(status_code=404, detail="Folder not found")
            
        chunks_file = folder_path / "all_chunks.json"
        logger.info(f"Looking for chunks file: {chunks_file}")
        
        if not chunks_file.exists():
            logger.error(f"Chunks file not found: {chunks_file}")
            raise HTTPException(status_code=404, detail="Chunks file not found")
            
        with open(chunks_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
            
        if not chunks:
            raise HTTPException(status_code=400, detail="No chunks found in file")
            
        # Ensure all chunks have proper metadata
        for chunk in chunks:
            if 'metadata' not in chunk:
                chunk['metadata'] = {}
            
            chunk['metadata'] = {
                'subject': str(chunk.get('metadata', {}).get('subject', 'unknown')),
                'grade': str(chunk.get('metadata', {}).get('grade', 'unknown')),
                'chapter_title': str(chunk.get('metadata', {}).get('chapter_title', 'unknown')),
                'chapter_number': str(chunk.get('metadata', {}).get('chapter_number', '0')),
                'page_number': str(chunk.get('metadata', {}).get('page_number', '0')),
                'source': folder_name
            }

        metadata = {
            "subject": str(chunks[0]['metadata']['subject']),
            "grade": str(chunks[0]['metadata']['grade']),
            "source": str(folder_name)
        }
        
        logger.info(f"Using metadata for vector store: {metadata}")

        # Add chunks to vector store and get embedding IDs
        embedding_ids = await vector_store.add_documents(chunks, metadata)
        
        logger.info(f"Generated embedding IDs: {embedding_ids}")

        # Update chunks with indexing status and embedding IDs
        for chunk, embedding_id in zip(chunks, embedding_ids):
            chunk["vector_store_status"] = {
                "indexed": True,
                "indexed_at": datetime.now().isoformat(),
                "embedding_id": embedding_id
            }

        # Save updated chunks back to file
        with open(chunks_file, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, indent=2, ensure_ascii=False)
            
        return {
            "status": "success",
            "message": f"Successfully indexed {len(chunks)} chunks",
            "chunks_indexed": len(chunks),
            "embedding_ids": embedding_ids
        }
        
    except Exception as e:
        logger.error(f"Error indexing document chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_documents(
    query: str = Body(...),
    subject: Optional[str] = Body(None),
    grade: Optional[str] = Body(None),
    n_results: int = Body(10),
    content_types: Optional[List[str]] = Body(None)
):
    """
    Query the vector database for relevant documents
    """
    try:
        # Prepare filters based on subject and grade
        filters = {}
        if subject:
            filters["subject"] = subject
        if grade:
            filters["grade"] = grade

        # Set default content types if not specified
        if not content_types:
            content_types = ["textbook", "exam_question"]

        # Query the vector store
        results = await vector_store.query(
            query_text=query,
            filters=filters if filters else None,
            n_results=n_results,
            content_types=content_types           
        )

        # Initialize LLM service
        llm_service = LLMService()

        # Generate response using LLM
        llm_response = await llm_service.generate_response(
            question=query,
            contexts=results["documents"]
        )

        return {
            "status": "success",
            "query_results": {
                "documents": results["documents"],
                "metadatas": results["metadatas"],
                "distances": results["distances"],
                "normalized_scores": results["normalized_scores"],
                "chunk_ids": results["chunk_ids"],
                "textbook_results": results["textbook_results"],
                "exam_results": results["exam_results"]
            },
            "llm_response": llm_response["response"]
        }

    except Exception as e:
        logger.error(f"Error querying documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/debug/embeddings")
async def debug_embeddings():
    """Debug endpoint to check embeddings in the vector store"""
    try:
        # Get a sample of embeddings
        results = await vector_store.collection.get(
            limit=20,
            include=["metadatas"]
        )
        
        # Count by type
        type_counts = {}
        for metadata in results["metadatas"]:
            doc_type = metadata.get("type", "unknown")
            type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
            
        # Sample of each type
        samples = {}
        for i, metadata in enumerate(results["metadatas"]):
            doc_type = metadata.get("type", "unknown")
            if doc_type not in samples and i < len(results["ids"]):
                samples[doc_type] = {
                    "id": results["ids"][i],
                    "metadata": metadata
                }
                
        return {
            "total_count": len(results["ids"]),
            "type_counts": type_counts,
            "samples": samples
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/textbook/update-type-field")
async def update_textbook_type_field():
    """Update all textbook entries to have a type field"""
    try:
        # Get all embeddings - we'll filter in code for those without type
        results = await vector_store.collection.get(
            limit=1000,  # Adjust as needed
            include=["metadatas", "documents", "embeddings"]
        )
        
        if not results or len(results["ids"]) == 0:
            return {"status": "No documents found"}
            
        # Update each document to add type field
        count = 0
        for i, embedding_id in enumerate(results["ids"]):
            metadata = results["metadatas"][i]
            
            # Skip if already has type field
            if "type" in metadata and metadata["type"]:
                continue
                
            # Add type field
            document = results["documents"][i]
            embedding = results["embeddings"][i]
            
            # Assume it's a textbook if it has page field or no type
            if "page" in metadata:
                metadata["type"] = "textbook"
                
                # Update in collection
                vector_store.collection.update(
                    ids=[embedding_id],
                    metadatas=[metadata],
                    documents=[document],
                    embeddings=[embedding]
                )
                count += 1
        
        return {
            "status": "success",
            "updated_count": count,
            "total_found": len(results["ids"])
        }
    except Exception as e:
        logger.error(f"Error updating type field: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
