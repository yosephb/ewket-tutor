import fitz
import pdfplumber
from pathlib import Path
from typing import List, Dict
import logging
from ..utils.text_cleaner import clean_text_dict, clean_raw_text
from ..utils.chunking import create_chunks
from ..models.document import PageMetadata, TextChunk, ProcessedPage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self, upload_dir: str = "/app/data/uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def process_pdf(self, file_path: str, subject: str, grade: int) -> List[ProcessedPage]:
        """Process PDF and return chunks with metadata."""
        try:
            doc = fitz.open(file_path)
            processed_pages = []

            for page_num in range(len(doc)):
                logger.info(f"Processing page {page_num + 1}/{len(doc)}")
                
                # Get page
                page = doc[page_num]
                
                # Extract text and metadata
                text_dict = {
                    "text": page.get_text("dict"),
                    "blocks": page.get_text("blocks")
                }
                text_dict = clean_text_dict(text_dict)
                
                # Clean text
                blocks = text_dict.get("blocks", [])
                text_content = []
                for block in blocks:
                    if isinstance(block, tuple) and len(block) > 4:
                        text_content.append(str(block[4]))
                
                raw_text = " ".join(text_content)
                cleaned_text, page_metadata = clean_raw_text(raw_text)
                
                if cleaned_text.strip():
                    # Create chunks
                    chunks = create_chunks(cleaned_text)
                    
                    # Create metadata
                    metadata = PageMetadata(
                        page_number=page_num + 1,
                        chapter_number=page_metadata.get('unit_number'),
                        chapter_title=page_metadata.get('unit_title')
                    )
                    
                    # Create processed page
                    processed_page = ProcessedPage(
                        text=cleaned_text,
                        metadata=metadata,
                        chunks=[TextChunk(text=chunk['text'], metadata=metadata) 
                               for chunk in chunks]
                    )
                    
                    processed_pages.append(processed_page)
            
            doc.close()
            return processed_pages
            
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise