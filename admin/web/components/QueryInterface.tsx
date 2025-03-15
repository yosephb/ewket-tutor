import React, { useState } from 'react';
import { Tab } from '@headlessui/react';

interface QueryResult {
  chunk_ids: string[];
  documents: string[];
  metadatas: any[];
  distances: number[];
  normalized_scores?: number[];
  textbook_results: any[];
  exam_results: any[];
}

interface QueryResponse {
  status: string;
  query_results: QueryResult;
  llm_response: string;
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function QueryInterface() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [contentTypes, setContentTypes] = useState(['textbook', 'exam_question']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8001/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          subject: subject || null,
          grade: grade || null,
          n_results: 10,
          content_types: contentTypes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Query failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error querying documents:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleContentType = (type) => {
    setContentTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Query Documents</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700">
            Query
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject (optional)
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
              Grade (optional)
            </label>
            <input
              type="text"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Types</label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={contentTypes.includes('textbook')}
                onChange={() => toggleContentType('textbook')}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Textbook Content</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={contentTypes.includes('exam_question')}
                onChange={() => toggleContentType('exam_question')}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Exam Questions</label>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white ${
            loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Searching...' : 'Submit Query'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <Tab.Group>
            <Tab.List className="flex border-b">
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium',
                  selected
                    ? 'border-indigo-500 border-b-2 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }>
                All Results ({results.query_results.documents.length})
              </Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium',
                  selected
                    ? 'border-indigo-500 border-b-2 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }>
                Textbook Content ({results.query_results.textbook_results.length})
              </Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium',
                  selected
                    ? 'border-indigo-500 border-b-2 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }>
                Exam Questions ({results.query_results.exam_results.length})
              </Tab>
              <Tab className={({ selected }) =>
                classNames(
                  'px-4 py-2 text-sm font-medium',
                  selected
                    ? 'border-indigo-500 border-b-2 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )
              }>
                AI Response
              </Tab>
            </Tab.List>
            
            <Tab.Panels>
              {/* All Results Panel */}
              <Tab.Panel className="p-4">
                {results.query_results.documents.map((doc, idx) => (
                  <div key={idx} className="mb-6 p-4 border rounded-lg">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-indigo-600">
                        Match Score: {Math.round(results.query_results.normalized_scores[idx] * 100)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {results.query_results.metadatas[idx].type === 'exam_question' ? 'Exam Question' : 'Textbook'}
                      </span>
                    </div>
                    
                    <div className="mt-1">
                      <pre className="whitespace-pre-wrap text-sm">{doc}</pre>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      {results.query_results.metadatas[idx].type === 'exam_question' ? (
                        <div>
                          <p>Subject: {results.query_results.metadatas[idx].subject}</p>
                          <p>Exam: {results.query_results.metadatas[idx].exam_name}</p>
                          <p>Answer: {results.query_results.metadatas[idx].answer}</p>
                        </div>
                      ) : (
                        <div>
                          <p>Subject: {results.query_results.metadatas[idx].subject}</p>
                          <p>Grade: {results.query_results.metadatas[idx].grade}</p>
                          <p>Chapter: {results.query_results.metadatas[idx].chapter_title}</p>
                          <p>Page: {results.query_results.metadatas[idx].page}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </Tab.Panel>
              
              {/* Textbook Content Panel */}
              <Tab.Panel className="p-4">
                {results.query_results.textbook_results.map((result, idx) => (
                  <div key={idx} className="mb-6 p-4 border rounded-lg">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-indigo-600">
                        Match Score: {Math.round(result.score * 100)}%
                      </span>
                    </div>
                    
                    <div className="mt-1">
                      <pre className="whitespace-pre-wrap text-sm">{result.document}</pre>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Subject: {result.metadata.subject}</p>
                      <p>Grade: {result.metadata.grade}</p>
                      <p>Chapter: {result.metadata.chapter_title}</p>
                      <p>Page: {result.metadata.page}</p>
                    </div>
                  </div>
                ))}
              </Tab.Panel>
              
              {/* Exam Questions Panel */}
              <Tab.Panel className="p-4">
                {results.query_results.exam_results.map((result, idx) => (
                  <div key={idx} className="mb-6 p-4 border rounded-lg">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-indigo-600">
                        Match Score: {Math.round(result.score * 100)}%
                      </span>
                    </div>
                    
                    <div className="mt-1">
                      <div className="mb-2 font-medium">{result.document}</div>
                      
                      {/* Parse and display options if available */}
                      {result.document.includes('Options:') && (
                        <div className="mt-2 ml-4">
                          {result.document.split('Options:')[1].split(/[A-Z]\.\s/).filter(Boolean).map((option, i) => {
                            const optionLetter = String.fromCharCode(65 + i);
                            const isCorrect = result.metadata.answer === optionLetter;
                            
                            return (
                              <div 
                                key={i} 
                                className={`mb-1 ${isCorrect ? 'font-medium text-green-600' : ''}`}
                              >
                                {optionLetter}. {option.trim()}
                                {isCorrect && ' ✓'}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Subject: {result.metadata.subject}</p>
                      <p>Exam: {result.metadata.exam_name}</p>
                      <p>Year: {result.metadata.year}</p>
                      <p>Tags: {[
                        result.metadata.unit_tags,
                        result.metadata.topic_tags
                      ].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                ))}
              </Tab.Panel>
              
              {/* AI Response Panel */}
              <Tab.Panel className="p-4">
                <div className="prose max-w-full">
                  <div dangerouslySetInnerHTML={{ __html: results.llm_response.replace(/\n/g, '<br/>') }} />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  );
} 