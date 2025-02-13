import fitz
import pdfplumber
from pathlib import Path
from typing import List, Dict
import logging
import json
from datetime import datetime

from app.utils.text_cleaner import clean_text_dict, clean_raw_text
from ..utils.chunking import create_chunks
from ..models.document import PageMetadata, TextChunk, ProcessedPage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        self.upload_dir = Path("data/uploads")
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _create_output_dirs(self, pdf_name: str) -> Path:
        """Create output directories for storing chunks and other data."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_root = Path("/mnt/c/CursTest/Production/Extract")
        output_dir = output_root / f"pdf_extraction_{pdf_name}_{timestamp}"
        output_dir.mkdir(parents=True, exist_ok=True)

        # Create chunks directory
        chunks_dir = output_dir / "chunks"
        chunks_dir.mkdir(exist_ok=True)

        return output_dir, chunks_dir

    async def process_pdf(self, file_path: str, subject: str, grade: int) -> List[ProcessedPage]:
        """Process PDF and return chunks with metadata."""
        try:
            print("process pdf" + file_path)
            doc = fitz.open(file_path)
            processed_pages = []
            
            # Create output directories
            pdf_name = Path(file_path).stem
            output_dir, chunks_dir = self._create_output_dirs(pdf_name)
            all_chunks = []

            for page_num in range(len(doc)):
                logger.info(f"Processing page {page_num + 1}/{len(doc)}")
                
                try:
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
                    
                    # Add debug logging
                    logger.debug(f"Number of blocks on page {page_num + 1}: {len(blocks)}")
                    
                    for i, block in enumerate(blocks):
                        try:
                            if isinstance(block, tuple):
                                logger.debug(f"Block {i} length: {len(block)}")
                                if len(block) > 4:
                                    text_content.append(str(block[4]))
                        except Exception as block_error:
                            logger.warning(f"Error processing block {i} on page {page_num + 1}: {block_error}")
                            continue
                    
                    raw_text = " ".join(text_content)
                    cleaned_text, page_metadata = clean_raw_text(raw_text)
                    
                    if cleaned_text.strip():
                        # Create chunks
                        chunks = create_chunks(cleaned_text)
                        logger.debug(f"Created {len(chunks)} chunks for page {page_num + 1}")
                        
                        # Add page metadata to chunks
                        for chunk in chunks:
                            chunk['metadata'] = {
                                'page_number': page_num + 1,
                                'chapter_number': page_metadata.get('unit_number'),
                                'chapter_title': page_metadata.get('unit_title')
                            }
                        
                        # Save page-specific chunks
                        page_chunks_file = chunks_dir / f"page_{page_num}_chunks.json"
                        with open(page_chunks_file, "w", encoding="utf-8") as f:
                            json.dump(chunks, f, ensure_ascii=False, indent=2)
                        
                        all_chunks.extend(chunks)
                        
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
                
                except Exception as page_error:
                    logger.error(f"Error processing page {page_num + 1}: {page_error}")
                    logger.error(f"Stack trace: ", exc_info=True)
                    continue  # Continue with next page instead of failing completely
            
            # Save all chunks to a single file
            all_chunks_file = output_dir / "all_chunks.json"
            with open(all_chunks_file, "w", encoding="utf-8") as f:
                json.dump(all_chunks, f, ensure_ascii=False, indent=2)

            # Create and save metadata summary
            metadata_summary = {
                'total_pages': len(doc),
                'total_chunks': len(all_chunks),
                'subject': subject,
                'grade': grade,
                'chapters': sorted(list(set(
                    chunk['metadata']['chapter_number'] 
                    for chunk in all_chunks 
                    if chunk['metadata']['chapter_number'] is not None
                ))),
                'processing_timestamp': datetime.now().strftime("%Y%m%d_%H%M%S")
            }
            
            metadata_file = output_dir / "metadata_summary.json"
            with open(metadata_file, "w", encoding="utf-8") as f:
                json.dump(metadata_summary, f, ensure_ascii=False, indent=2)
            
            doc.close()
            return processed_pages
            
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            logger.error("Stack trace: ", exc_info=True)
            raise