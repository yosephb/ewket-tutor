import { useState, useEffect } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface Exam {
  id: string;
  exam_name: string;
  subject: string;
  year: string;
  question_count: number;
  has_embeddings: boolean;
  created_at: string;
}

interface ExamListProps {
  onExamSelect: (exam: Exam) => void;
}

export default function ExamList({ onExamSelect }: ExamListProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingExam, setProcessingExam] = useState<string | null>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8001/api/admin/exams/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setExams(data.exams);
      } else {
        throw new Error(data.detail || 'Failed to fetch exams');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const createEmbeddings = async (examId: string) => {
    try {
      setProcessingExam(examId);
      setError(null);
      
      const response = await fetch(`http://localhost:8001/api/admin/exams/${examId}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create embeddings');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        alert(data.message || 'Embeddings created successfully');
        fetchExams(); // Refresh the list
      } else {
        throw new Error(data.detail || 'Failed to create embeddings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingExam(null);
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading exams...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-6">
        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900">No exams found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading an exam JSON file.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {exams.map((exam) => (
            <li key={exam.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p 
                      className="text-sm font-medium text-indigo-600 truncate cursor-pointer hover:underline"
                      onClick={() => onExamSelect(exam)}
                    >
                      {exam.exam_name}
                    </p>
                    <p className="mt-1 sm:mt-0 sm:ml-2 text-xs text-gray-500">
                      {exam.subject} • {exam.year}
                    </p>
                  </div>
                  <div className="ml-2 flex flex-shrink-0">
                    {exam.has_embeddings ? (
                      <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Indexed
                      </p>
                    ) : (
                      <p className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                        Not Indexed
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <span className="truncate">Questions: {exam.question_count}</span>
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p className="text-xs">
                      Added: {new Date(exam.created_at).toLocaleDateString()}
                    </p>
                    
                    {!exam.has_embeddings && (
                      <button
                        onClick={() => createEmbeddings(exam.id)}
                        disabled={processingExam === exam.id}
                        className={`ml-4 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                          processingExam === exam.id
                            ? 'bg-gray-300'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {processingExam === exam.id ? 'Processing...' : 'Create Embeddings'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => onExamSelect(exam)}
                      className="ml-4 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Questions
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 