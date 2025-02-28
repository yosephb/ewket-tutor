import React, { useState } from 'react';

interface QueryResult {
  documents: string[];
  metadatas: any[];
  distances: number[];
  normalized_scores?: number[];
}

interface QueryResponse {
  status: string;
  query_results: QueryResult;
  llm_response: string;
}

export default function QueryInterface() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QueryResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('query', query);
      if (subject) formData.append('subject', subject);
      if (grade) formData.append('grade', grade);
      
      const response = await fetch('http://localhost:8001/api/admin/documents/query', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
        
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white ${
            loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Querying...' : 'Submit Query'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">LLM Response</h3>
            <p className="whitespace-pre-wrap">{results.llm_response}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Source Documents</h3>
            <div className="space-y-4">
              {results.query_results.documents.map((doc, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Distance: </span>
                    {(results.query_results.distances[index])}

                    <br/>
                    <span className="font-medium">Normalized Score: </span>
                    {(results.query_results.normalized_scores[index])}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Metadata: </span>
                    {JSON.stringify(results.query_results.metadatas[index])}

                    
                  </div>
                  <p className="text-sm">{doc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 