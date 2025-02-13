from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pathlib import Path
import json

import logging
from typing import Dict

from .routers import student, admin  

from .services.pdf_service import PDFService

#import pdb
pdf_service = PDFService()


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
