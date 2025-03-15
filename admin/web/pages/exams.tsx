import { useState } from 'react';
import Layout from '../components/Layout';
import ExamUploader from '../components/ExamUploader';
import ExamList from '../components/ExamList';
import ExamQuestionBrowser from '../components/ExamQuestionBrowser';

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [selectedExam, setSelectedExam] = useState(null);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Exam Management</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('list');
                setSelectedExam(null);
              }}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Exam List
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                setSelectedExam(null);
              }}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload Exam
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' && !selectedExam && (
          <ExamList onExamSelect={(exam) => setSelectedExam(exam)} />
        )}
        
        {activeTab === 'upload' && (
          <ExamUploader 
            onSuccess={() => {
              alert('Exam uploaded successfully!');
              setActiveTab('list');
            }}
          />
        )}
        
        {selectedExam && (
          <div>
            <button
              onClick={() => setSelectedExam(null)}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Exam List
            </button>
            <ExamQuestionBrowser exam={selectedExam} />
          </div>
        )}
      </div>
    </Layout>
  );
} 