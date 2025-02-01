from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .routers import student, admin  # Import your new routers

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
