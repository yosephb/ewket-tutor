from typing import List, Dict
import re

def create_chunks(text: str, max_chunk_size: int = 3500, overlap: int = 350) -> List[Dict]:
    """Create overlapping chunks from text."""
    chunks = []
    paragraphs = text.split('\n\n')
    current_chunk = []
    current_length = 0
    
    
    
    for i, paragraph in enumerate(paragraphs):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        paragraph_length = len(paragraph)
        
        
        if current_length + paragraph_length > max_chunk_size and current_chunk:
            # Create chunk
            chunk_text = '\n\n'.join(current_chunk)
            chunk_length = len(chunk_text)
            approx_tokens = chunk_length // 4  # Rough approximation for GPT-4 tokens       
            chunks.append({'text': chunk_text})
            
            # Handle overlap
            overlap_size = 0
            overlap_paragraphs = []
            for p in reversed(current_chunk):
                if overlap_size + len(p) <= overlap:
                    overlap_paragraphs.insert(0, p)
                    overlap_size += len(p)
                else:
                    break
                    
            current_chunk = overlap_paragraphs
            current_length = overlap_size
            
            
        current_chunk.append(paragraph)
        current_length += paragraph_length
    
    # Add the last chunk
    if current_chunk:
        chunk_text = '\n\n'.join(current_chunk)
        chunk_length = len(chunk_text)
        approx_tokens = chunk_length // 4  # Rough approximation for GPT-4 tokens
        print(f"Creating final chunk with length: {chunk_length} chars, ~{approx_tokens} tokens")
        chunks.append({'text': chunk_text})
    
    print(f"Total chunks created: {len(chunks)}")
    return chunks