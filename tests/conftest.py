import sys
import os
import pytest
from fastapi.testclient import TestClient
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.append(str(backend_path))

from app.main import app
from app.services.vector_store import VectorStore
from app.services.llm_service import LLMService
from app.services.pdf_service import PDFService

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def mock_vector_store(mocker):
    mock_store = mocker.Mock(spec=VectorStore)
    mock_store.add_documents.return_value = ["test_id_1", "test_id_2"]
    mock_store.query.return_value = {
        "documents": ["test document"],
        "metadatas": [{"subject": "test", "grade": "9"}],
        "distances": [0.5]
    }
    return mock_store

@pytest.fixture
def mock_llm_service(mocker):
    mock_llm = mocker.Mock(spec=LLMService)
    mock_llm.generate_response.return_value = {
        "response": "test response",
        "model": "gpt-4-turbo-preview"
    }
    return mock_llm

@pytest.fixture
def mock_pdf_service(mocker):
    mock_pdf = mocker.Mock(spec=PDFService)
    mock_pdf.process_pdf.return_value = [
        {
            "text": "test chunk",
            "metadata": {
                "page_number": "1",
                "chapter_number": "1",
                "chapter_title": "Test Chapter"
            }
        }
    ]
    return mock_pdf

@pytest.fixture
def test_data_dir(tmp_path):
    """Create a temporary directory with test data."""
    test_dir = tmp_path / "test_data"
    test_dir.mkdir()
    return test_dir
