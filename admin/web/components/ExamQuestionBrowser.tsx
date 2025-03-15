import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, TagIcon, BookOpenIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Question {
  question_id: string;
  question_text: string;
  options: Record<string, string>;
  answer: string;
  unit_tags: string[];
  topic_tags: string[];
  has_embedding: boolean;
}

interface Exam {
  id: string;
  exam_name: string;
  subject: string;
  year: string;
}

interface PaginationData {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
}

interface ExamQuestionBrowserProps {
  exam: Exam;
}

// Add new interface for embedding data
interface QuestionEmbedding {
  id: string;
  document: string;
  metadata: Record<string, any>;
}

export default function ExamQuestionBrowser({ exam }: ExamQuestionBrowserProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_items: 0
  });
  const [filter, setFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [processingQuestion, setProcessingQuestion] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  // Add state for selected embedding
  const [selectedEmbedding, setSelectedEmbedding] = useState<QuestionEmbedding | null>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [updatedMetadata, setUpdatedMetadata] = useState<Record<string, any>>({});

  const fetchQuestions = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:8001/api/admin/exams/${exam.id}/questions?page=${page}&page_size=${pagination.page_size}`;
      
      if (selectedTags.length > 0) {
        url += `&tags=${selectedTags.join(',')}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setQuestions(data.questions);
        setPagination(data.pagination);
        
        // Extract unique tags from questions
        const unitTags = data.questions.flatMap(q => q.unit_tags || []);
        const topicTags = data.questions.flatMap(q => q.topic_tags || []);
        const uniqueTags = [...new Set([...unitTags, ...topicTags])];
        setAllTags(uniqueTags);
      } else {
        throw new Error(data.detail || 'Failed to fetch questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(pagination.page);
  }, [exam.id, pagination.page, selectedTags]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
    // Reset to first page when changing filters
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const createEmbedding = async (questionId: string) => {
    try {
      setProcessingQuestion(questionId);
      setError(null);
      
      const response = await fetch(`http://localhost:8001/api/admin/exams/questions/${questionId}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create embedding');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        // Update the question's embedding status
        setQuestions(questions.map(q => 
          q.question_id === questionId 
            ? { ...q, has_embedding: true }
            : q
        ));
      } else {
        throw new Error(data.detail || 'Failed to create embedding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingQuestion(null);
    }
  };

  // Add function to get question embedding
  const fetchQuestionEmbedding = async (questionId: string) => {
    try {
      setLoading(true);
      console.log(`Fetching embedding for exam ${exam.id}, question ${questionId}`);
      const response = await fetch(`http://localhost:8001/api/admin/exams/${exam.id}/questions/${questionId}/embedding`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${response.status} - ${errorText}`);
        
        if (response.status === 404) {
          setSelectedEmbedding(null);
          alert('No embedding found for this question');
          return;
        }
        throw new Error(`Failed to fetch embedding: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received embedding data:', data);
      setSelectedEmbedding(data);
    } catch (error) {
      console.error('Error fetching embedding:', error);
      setSelectedEmbedding(null);
      alert(`Error fetching embedding: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add function to delete embedding
  const deleteEmbedding = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this embedding? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8001/api/admin/exams/${exam.id}/questions/${questionId}/embedding`, 
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete embedding');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        alert('Embedding deleted successfully');
        setSelectedEmbedding(null);
        
        // Update question in state
        const updatedQuestions = questions.map(q => {
          if (q.question_id === questionId) {
            return { ...q, has_embedding: false };
          }
          return q;
        });
        setQuestions(updatedQuestions);
      }
    } catch (error) {
      console.error('Error deleting embedding:', error);
      alert('Failed to delete embedding');
    } finally {
      setLoading(false);
    }
  };

  // Add function to update metadata
  const updateEmbeddingMetadata = async (questionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8001/api/admin/exams/${exam.id}/questions/${questionId}/embedding/metadata`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedMetadata),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update metadata');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        alert('Metadata updated successfully');
        
        // Refresh embedding data
        await fetchQuestionEmbedding(questionId);
        setIsEditingMetadata(false);
      }
    } catch (error) {
      console.error('Error updating metadata:', error);
      alert('Failed to update metadata');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(filter.toLowerCase()) ||
    (q.unit_tags && q.unit_tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))) ||
    (q.topic_tags && q.topic_tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())))
  );

  // Use this in your question rendering to show embedding details
  const renderEmbeddingDetails = (question) => {
    if (!question.has_embedding) {
      return (
        <div className="mt-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-gray-500">No embedding for this question</p>
          <button
            onClick={() => createEmbedding(question.question_id)}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Embedding
          </button>
        </div>
      );
    }

    return (
      <div className="mt-4 p-3 border border-gray-200 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-medium">Embedding Details</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchQuestionEmbedding(question.question_id)}
              className="text-blue-600 hover:text-blue-800"
            >
              View Details
            </button>
          </div>
        </div>
        
        {selectedEmbedding && selectedEmbedding.id === `${exam.id}_${question.question_id}` && (
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <h5 className="font-medium">Metadata</h5>
              <button
                onClick={() => deleteEmbedding(question.question_id)}
                className="text-red-600 hover:text-red-800 flex items-center"
                title="Delete embedding"
              >
                <TrashIcon className="h-5 w-5" />
                <span className="ml-1">Delete Embedding</span>
              </button>
            </div>

            {isEditingMetadata ? (
              <div className="mt-2">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedEmbedding.metadata).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">{key}</label>
                      <input
                        type="text"
                        value={updatedMetadata[key] || value}
                        onChange={(e) => setUpdatedMetadata({
                          ...updatedMetadata,
                          [key]: e.target.value
                        })}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsEditingMetadata(false);
                      setUpdatedMetadata({});
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateEmbeddingMetadata(question.question_id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedEmbedding.metadata, null, 2)}
                </pre>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setIsEditingMetadata(true);
                      setUpdatedMetadata({});
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit Metadata
                  </button>
                </div>
              </div>
            )}
            
            <h5 className="font-medium mt-4">Document Text</h5>
            <div className="mt-2 bg-gray-50 p-2 rounded text-sm overflow-auto max-h-40">
              {selectedEmbedding.document}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white px-4 py-5 sm:px-6 rounded-t-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">{exam.exam_name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{exam.subject} • {exam.year}</p>
          </div>
          <div>
            <button
              onClick={() => fetchQuestions(pagination.page)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          {/* Filters */}
          <div className="mb-6">
            <div className="mb-3">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700">Search Questions</label>
              <div className="mt-1">
                <input
                  type="text"
                  id="filter"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by question text or tags..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
            
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        selectedTags.includes(tag)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-6">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-6">
              <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuestions.map((question) => (
                <div key={question.question_id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">ID: {question.question_id}</span>
                      {question.has_embedding ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Indexed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Not Indexed
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">{question.question_text}</p>
                    </div>
                    
                    {question.options && Object.keys(question.options).length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">Options:</div>
                        <div className="space-y-1">
                          {Object.entries(question.options).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs ${
                                key === question.answer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              } mr-2`}>
                                {key}
                              </span>
                              <span className="text-sm text-gray-700">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.unit_tags && question.unit_tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                      
                      {question.topic_tags && question.topic_tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {!question.has_embedding && (
                      <div className="mt-4">
                        <button
                          onClick={() => createEmbedding(question.question_id)}
                          disabled={processingQuestion === question.question_id}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                            processingQuestion === question.question_id
                              ? 'bg-gray-300'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {processingQuestion === question.question_id ? 'Processing...' : 'Create Embedding'}
                        </button>
                      </div>
                    )}
                  </div>
                  {renderEmbeddingDetails(question)}
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    pagination.page <= 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                    pagination.page >= pagination.total_pages 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((pagination.page - 1) * pagination.page_size) + 1}
                    </span>
                    {' '}-{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.page_size, pagination.total_items)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{pagination.total_items}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        pagination.page <= 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(pagination.total_pages)].map((_, idx) => {
                      const pageNumber = idx + 1;
                      // Only show a window of pages around current page
                      if (
                        pageNumber === 1 || 
                        pageNumber === pagination.total_pages ||
                        (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              pagination.page === pageNumber
                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      
                      // Add ellipsis
                      if (
                        (pageNumber === 2 && pagination.page > 3) ||
                        (pageNumber === pagination.total_pages - 1 && pagination.page < pagination.total_pages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.total_pages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        pagination.page >= pagination.total_pages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 