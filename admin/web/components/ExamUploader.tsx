import React, { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface ExamUploaderProps {
  onSuccess: () => void;
}

export default function ExamUploader({ onSuccess }: ExamUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }
    
    // Validate file type
    if (selectedFile.type !== 'application/json') {
      setError('Please select a valid JSON file.');
      setFile(null);
      setPreview(null);
      return;
    }
    
    setFile(selectedFile);
    
    // Read file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        setPreview(jsonData);
      } catch (err) {
        setError('Invalid JSON format.');
        setPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const validateExamFormat = (data: any): boolean => {
    // Basic validation - you can expand this as needed
    if (!data || !data.exam || !Array.isArray(data.exam.questions)) {
      setError('Invalid exam format. Missing exam data or questions array.');
      return false;
    }
    
    if (!data.exam.exam_name || !data.exam.subject) {
      setError('Invalid exam format. Missing exam name or subject.');
      return false;
    }
    
    // Check if questions have the required fields
    const hasInvalidQuestions = data.exam.questions.some((q: any) => 
      !q.question_id || !q.question_text || !q.answer
    );
    
    if (hasInvalidQuestions) {
      setError('Some questions are missing required fields (ID, text, or answer).');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !preview) {
      setError('Please select a valid JSON file.');
      return;
    }
    
    if (!validateExamFormat(preview)) {
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8001/api/admin/exams/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload exam');
      }
      
      onSuccess();
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
          <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 mb-2">Upload an exam JSON file</p>
          <label className="block">
            <span className="sr-only">Choose file</span>
            <input 
              type="file" 
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              accept=".json"
              onChange={handleFileChange}
            />
          </label>
        </div>
        
        {preview && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium mb-2">Exam Preview</h3>
            <div className="text-sm space-y-2">
              <p><span className="font-medium">Exam Name:</span> {preview.exam.exam_name}</p>
              <p><span className="font-medium">Subject:</span> {preview.exam.subject}</p>
              <p><span className="font-medium">Questions:</span> {preview.exam.questions.length}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || uploading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              !file || uploading ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Exam'}
          </button>
        </div>
      </form>
    </div>
  );
}