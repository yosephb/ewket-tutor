import pytest
from app.services.vector_store import VectorStore
import chromadb
from unittest.mock import Mock

@pytest.fixture
def mock_chroma_client(mocker):
    mock_client = Mock(spec=chromadb.HttpClient)
    mock_collection = Mock()
    mock_client.get_or_create_collection.return_value = mock_collection
    mocker.patch('chromadb.HttpClient', return_value=mock_client)
    return mock_client

@pytest.mark.unit
async def test_add_documents(mock_chroma_client):
    vector_store = VectorStore()
    
    test_chunks = [{
        "text": "test chunk",
        "metadata": {
            "page_number": "1",
            "chapter_number": "1",
            "chapter_title": "Test Chapter"
        }
    }]
    
    test_metadata = {
        "subject": "Biology",
        "grade": "9"
    }
    
    ids = await vector_store.add_documents(test_chunks, test_metadata)
    assert isinstance(ids, list)
    assert len(ids) == len(test_chunks)
    
    # Verify the collection was called with correct parameters
    collection = mock_chroma_client.get_or_create_collection.return_value
    assert collection.add.called
    call_args = collection.add.call_args[1]
    assert "documents" in call_args
    assert "metadatas" in call_args
    assert "ids" in call_args

@pytest.mark.unit
async def test_query(mock_chroma_client):
    vector_store = VectorStore()
    
    # Setup mock response
    collection = mock_chroma_client.get_or_create_collection.return_value
    collection.query.return_value = {
        "documents": [["test document"]],
        "metadatas": [[{"subject": "Biology", "grade": "9"}]],
        "distances": [[0.5]]
    }
    
    results = await vector_store.query(
        query_text="test query",
        filters={"subject": "Biology"}
    )
    
    assert "documents" in results
    assert "metadatas" in results
    assert "distances" in results
    
    # Verify query was called with correct parameters
    assert collection.query.called
    call_args = collection.query.call_args[1]
    assert "query_embeddings" in call_args
    assert "where" in call_args
