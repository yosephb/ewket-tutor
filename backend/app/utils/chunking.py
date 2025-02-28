import tiktoken
from typing import List, Dict

def create_chunks(text: str, max_chunk_size: int = 1000, overlap: int = 250) -> List[Dict]:
    """Create overlapping chunks from text with optimized chunk size and overlap."""
    chunks = []
    paragraphs = text.split('\n\n')
    current_chunk = []
    current_length = 0
    enc = tiktoken.get_encoding("cl100k_base")  # Load GPT-4 tokenizer
    
    for i, paragraph in enumerate(paragraphs):
        paragraph = paragraph.strip()
        if not paragraph:
            continue

        paragraph_length = len(paragraph)
        
        # If the current chunk exceeds max size, store it and start a new chunk
        if current_length + paragraph_length > max_chunk_size and current_chunk:
            chunk_text = '\n\n'.join(current_chunk)
            chunk_tokens = len(enc.encode(chunk_text))  # Accurate token count
            chunks.append({'text': chunk_text, 'tokens': chunk_tokens})

            # Handle overlap (retain last few paragraphs)
            overlap_paragraphs = []
            overlap_size = 0
            for p in reversed(current_chunk):
                if overlap_size + len(p) <= overlap:
                    overlap_paragraphs.insert(0, p)
                    overlap_size += len(p)
                else:
                    break

            current_chunk = overlap_paragraphs
            current_length = overlap_size
        
        # Add paragraph to current chunk
        current_chunk.append(paragraph)
        current_length += paragraph_length

    # Add the last chunk
    if current_chunk:
        chunk_text = '\n\n'.join(current_chunk)
        chunk_tokens = len(enc.encode(chunk_text))  # Accurate token count
        chunks.append({'text': chunk_text, 'tokens': chunk_tokens})

    print(f"Total chunks created: {len(chunks)}")
    return chunks
