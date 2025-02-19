import pytest
from app.services.pdf_service import PDFService
from pathlib import Path
import PyPDF2
from unittest.mock import Mock, mock_open

@pytest.fixture
def mock_pdf_reader(mocker):
    mock_reader = Mock(spec=PyPDF2.PdfReader)
    mock_reader.pages = [Mock()]
    mock_reader.pages[0].extract_text.return_value = "Test content for page 1"
    mocker.patch('PyPDF2.PdfReader', return_value=mock_reader)
    return mock_reader

@pytest.mark.unit
async def test_process_pdf(mock_pdf_reader, mocker):
    # Mock file operations
    mock_file = mock_open(read_data=b"test pdf content")
    mocker.patch('builtins.open', mock_file)
    
    pdf_service = PDFService()
    
    test_file_path = "test.pdf"
    test_subject = "Biology"
    test_grade = "9"
    
    chunks = await pdf_service.process_pdf(
        file_path=test_file_path,
        subject=test_subject,
        grade=test_grade
    )
    
    assert isinstance(chunks, list)
    assert len(chunks) > 0
    assert all(isinstance(chunk, dict) for chunk in chunks)
    assert all("text" in chunk for chunk in chunks)
    assert all("metadata" in chunk for chunk in chunks)

@pytest.mark.unit
async def test_process_pdf_with_metadata(mock_pdf_reader, mocker):
    mock_file = mock_open(read_data=b"test pdf content")
    mocker.patch('builtins.open', mock_file)
    
    pdf_service = PDFService()
    
    chunks = await pdf_service.process_pdf(
        file_path="test.pdf",
        subject="Biology",
        grade="9"
    )
    
    # Check metadata in chunks
    for chunk in chunks:
        assert "metadata" in chunk
        assert chunk["metadata"]["subject"] == "Biology"
        assert chunk["metadata"]["grade"] == "9"
        assert "page_number" in chunk["metadata"]
        assert "chapter_number" in chunk["metadata"]
        assert "chapter_title" in chunk["metadata"]

@pytest.mark.unit
async def test_invalid_pdf_file(mock_pdf_reader, mocker):
    # Mock PyPDF2.PdfReader to raise an exception
    mocker.patch('PyPDF2.PdfReader', side_effect=Exception("Invalid PDF file"))
    
    pdf_service = PDFService()
    
    with pytest.raises(Exception) as exc_info:
        await pdf_service.process_pdf(
            file_path="invalid.pdf",
            subject="Biology",
            grade="9"
        )
    
    assert "Invalid PDF file" in str(exc_info.value)
