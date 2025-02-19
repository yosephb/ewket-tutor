import pytest
from fastapi.testclient import TestClient
import json
from pathlib import Path

@pytest.mark.unit
def test_health_check(test_client):
    response = test_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.unit
def test_query_documents(test_client, mock_vector_store, mock_llm_service, mocker):
    # Mock the services
    mocker.patch('app.main.vector_store', mock_vector_store)
    mocker.patch('app.main.LLMService', return_value=mock_llm_service)
    
    query_data = {
        "query": "test query",
        "subject": "Biology",
        "grade": "9"
    }
    
    response = test_client.post("/api/admin/documents/query", data=query_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "query_results" in data
    assert "llm_response" in data

@pytest.mark.unit
def test_index_document_chunks(test_client, mock_vector_store, mocker, test_data_dir):
    # Mock the services
    mocker.patch('app.main.vector_store', mock_vector_store)
    
    # Create test folder and chunks file
    folder_name = "test_folder"
    test_folder = test_data_dir / folder_name
    test_folder.mkdir()
    chunks_file = test_folder / "all_chunks.json"
    
    test_chunks = [{
        "text": "test chunk",
        "metadata": {
            "subject": "Biology",
            "grade": "9",
            "page_number": "1",
            "chapter_number": "1",
            "chapter_title": "Test Chapter"
        }
    }]
    
    chunks_file.write_text(json.dumps(test_chunks))
    
    # Mock the Path to return our test path
    mocker.patch('app.main.Path', return_value=test_data_dir)
    
    response = test_client.post(f"/api/admin/documents/index/{folder_name}")
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
