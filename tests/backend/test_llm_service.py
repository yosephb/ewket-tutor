import pytest
from app.services.llm_service import LLMService
from unittest.mock import Mock

@pytest.fixture
def mock_openai(mocker):
    mock_chat = Mock()
    mock_chat.invoke.return_value = "This is a test response"
    mocker.patch('langchain_openai.ChatOpenAI', return_value=mock_chat)
    return mock_chat

@pytest.mark.unit
async def test_generate_response(mock_openai, mocker):
    # Mock environment variable
    mocker.patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'})
    
    llm_service = LLMService()
    
    test_question = "What is photosynthesis?"
    test_contexts = [
        "Photosynthesis is the process by which plants convert sunlight into energy.",
        "This process produces oxygen as a byproduct."
    ]
    
    response = await llm_service.generate_response(
        question=test_question,
        contexts=test_contexts
    )
    
    assert isinstance(response, dict)
    assert "response" in response
    assert "model" in response
    assert response["model"] == "gpt-4-turbo-preview"

@pytest.mark.unit
async def test_generate_response_with_temperature(mock_openai, mocker):
    mocker.patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'})
    
    llm_service = LLMService()
    
    response = await llm_service.generate_response(
        question="test question",
        contexts=["test context"],
        temperature=0.5
    )
    
    assert isinstance(response, dict)
    assert "response" in response

@pytest.mark.unit
async def test_missing_api_key(mocker):
    mocker.patch.dict('os.environ', {}, clear=True)
    
    with pytest.raises(ValueError) as exc_info:
        LLMService()
    
    assert "OPENAI_API_KEY not found" in str(exc_info.value)
