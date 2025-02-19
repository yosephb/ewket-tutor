import { useState } from 'react';
import Layout from '../components/Layout';
import ChunkViewer from '../components/ChunkViewer';
import QueryInterface from '../components/QueryInterface';

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState<'documents' | 'query'>('documents');

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Management
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'query'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Query Interface
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'documents' ? (
          <ChunkViewer />
        ) : (
          <QueryInterface />
        )}
      </div>
    </Layout>
  );
}
  