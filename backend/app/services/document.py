from typing import List
from ..models.document import DocumentChunk
from ..database import get_db
from sqlalchemy import select

async def get_chunks_by_folder(folder_name: str) -> List[DocumentChunk]:
    """
    Retrieve all chunks for a given folder from the database.
    
    Args:
        folder_name (str): Name of the folder to retrieve chunks from
        
    Returns:
        List[DocumentChunk]: List of document chunks from the specified folder
    """
    async with get_db() as db:
        # Create a select statement to get all chunks for the folder
        query = select(DocumentChunk).where(DocumentChunk.folder_name == folder_name)
        
        # Execute the query
        result = await db.execute(query)
        
        # Fetch all results
        chunks = result.scalars().all()
        
        if not chunks:
            raise ValueError(f"No chunks found for folder: {folder_name}")
            
        return chunks 