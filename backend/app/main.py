from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from pathlib import Path
import logging
from .services.pdf_service import PDFService
from .services.vector_store import VectorStore
from .services.llm_service import LLMService


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

pdf_service = PDFService()
vector_store = VectorStore()  # Using the new VectorStore class
llm_service = LLMService()

class QueryRequest(BaseModel):
    query: str
    temperature: Optional[float] = 0.7
    filters: Optional[Dict] = None

@app.post("/upload")
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
        chunks_added = await vector_store.add_documents(processed_pages, {
            "subject": subject, 
            "grade": grade
        })

        return {
            "message": "File processed successfully",
            "pages_processed": len(processed_pages),
            "chunks_added": chunks_added
        }

    except Exception as e:
        logger.error(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_document(request: QueryRequest):
    try:
        results = await vector_store.query(request.query, request.filters)
        response = await llm_service.generate_response(
            request.query,
            results["documents"],
            temperature=request.temperature
        )

        return {
            "response": response["response"],
            "sources": [
                {"text": doc, "metadata": meta}
                for doc, meta in zip(results["documents"], results["metadatas"])
            ]
        }

    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}