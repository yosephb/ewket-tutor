import React, { useEffect, useState } from 'react';
import { Chunk, ExtractionFolder, PaginationData } from '../types';
import { FolderIcon, DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ChunkViewerProps {
  onChunkSelect?: (chunk: Chunk) => void;
}

export default function ChunkViewer({ onChunkSelect }: ChunkViewerProps) {
  const [folders, setFolders] = useState<ExtractionFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    page_size: 12,
    total_pages: 1,
    total_items: 0
  });

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      fetchChunks(selectedFolder, pagination.page);
    }
  }, [pagination.page, selectedFolder]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/admin/documents/folders');
      const data = await response.json();
      
      if (data.status === 'success') {
        setFolders(data.folders);
      } else {
        setError('Failed to fetch folders');
      }
    } catch (err) {
      setError('Error fetching folders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChunks = async (folderName: string, page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8001/api/admin/documents/chunks/${folderName}?page=${page}&page_size=${pagination.page_size}`
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setChunks(data.chunks);
        setPagination(data.pagination);
        setSelectedFolder(folderName);
      } else {
        setError('Failed to fetch chunks');
      }
    } catch (err) {
      setError('Error fetching chunks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setChunks([]);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (!selectedFolder) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Select a Document</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.name}
              className="p-4 border rounded-lg hover:shadow-lg cursor-pointer transition-shadow"
              onClick={() => fetchChunks(folder.name, 1)}
            >
              <div className="flex items-center space-x-3">                
                <div>
                  <div className="font-medium">{folder.name}</div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(folder.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredChunks = chunks.filter(chunk => 
    chunk.text.toLowerCase().includes(filter.toLowerCase()) ||
    chunk.metadata.chapter_title?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={handleBackToFolders}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Documents
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter chunks..."
          className="w-full p-2 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChunks.map((chunk, index) => (
          <div
            key={index}
            className="p-4 border rounded hover:shadow-lg cursor-pointer"
            onClick={() => onChunkSelect?.(chunk)}
          >
            <div className="flex items-center space-x-2 mb-2">             
              <div className="text-sm text-gray-500">
                Page {chunk.metadata.page_number}
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <div>Chapter: {chunk.metadata.chapter_number}</div>
              <div>Title: {chunk.metadata.chapter_title}</div>
            </div>
            <div className="text-sm">
              {chunk.text}
            </div>
          </div>
        ))}
      </div>

      {filteredChunks.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          No chunks found matching your filter.
        </div>
      )}

      {/* Pagination Controls */}
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
    </div>
  );
} 