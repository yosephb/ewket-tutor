from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

class QuestionBase(BaseModel):
    question_id: str
    question_text: str
    options: Dict[str, str]
    answer: str
    unit_tags: List[str] = []
    topic_tags: List[str] = []
    
class Question(QuestionBase):
    has_embedding: bool = False
    embedding_id: Optional[str] = None
    
class ExamBase(BaseModel):
    exam_name: str
    subject: str
    year: str
    
class ExamCreate(ExamBase):
    questions: List[QuestionBase]
    
class Exam(ExamBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_count: int
    has_embeddings: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
        
class ExamWithQuestions(Exam):
    questions: List[Question]
    
class PaginatedQuestions(BaseModel):
    status: str = "success"
    questions: List[Question]
    pagination: Dict[str, Any]
    
class ExamListResponse(BaseModel):
    status: str = "success"
    exams: List[Exam]
    
class EmbeddingResponse(BaseModel):
    status: str = "success"
    message: str
    processed_count: int 