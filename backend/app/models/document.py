from pydantic import BaseModel
from typing import Dict, List, Optional

class PageMetadata(BaseModel):
    page_number: int
    chapter_number: Optional[str] = None
    chapter_title: Optional[str] = None
    section_number: Optional[str] = None
    section_title: Optional[str] = None

class TextChunk(BaseModel):
    text: str
    metadata: PageMetadata

class ProcessedPage(BaseModel):
    text: str
    metadata: PageMetadata
    chunks: List[TextChunk]