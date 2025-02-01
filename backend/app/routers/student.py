from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional, Dict
from pathlib import Path

# Import your services here
from ..services.pdf_service import PDFService
from ..services.vector_store import VectorStore
from ..services.llm_service import LLMService

router = APIRouter()

# Instantiate services as needed
pdf_service = PDFService()
vector_store = VectorStore()
llm_service = LLMService()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    subject: str = "biology",
    grade: int = 9
):
    try:
        upload_path = Path("/app/data/uploads") / file.filename
        with upload_path.open("wb") as buffer:
            content = await file.read()
            buffer.write(content)

        processed_pages = await pdf_service.process_pdf(str(upload_path), subject, grade)
        chunks_added = await vector_store.add_documents(
            processed_pages,
            {"subject": subject, "grade": grade}
        )

        return {
            "message": "File processed successfully",
            "pages_processed": len(processed_pages),
            "chunks_added": chunks_added
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
async def query_document(
    query: str,
    temperature: Optional[float] = 0.7,
    filters: Optional[Dict] = None
):
    """
    Example student endpoint that queries documents and generates a response.
    """
    try:
        results = await vector_store.query(query, filters)
        response = await llm_service.generate_response(
            query,
            results["documents"],
            temperature=temperature
        )

        return {
            "response": response["response"],
            "sources": [
                {"text": doc, "metadata": meta}
                for doc, meta in zip(results["documents"], results["metadatas"])
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
