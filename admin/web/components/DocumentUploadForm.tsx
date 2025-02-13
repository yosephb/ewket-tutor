import { useState } from 'react';
import axios from 'axios';

interface UploadFormProps {
  onSuccess?: () => void;
}

export default function DocumentUploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    subject: '',
    grade: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', metadata.subject);
      formData.append('grade', metadata.grade);

      const response = await axios.post('http://localhost:8001/api/admin/documents/chunk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful:', response.data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          PDF Document
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subject
        </label>
        <input
          type="text"
          value={metadata.subject}
          onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Grade
        </label>
        <input
          type="text"
          value={metadata.grade}
          onChange={(e) => setMetadata({ ...metadata, grade: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
          loading ? 'opacity-50' : 'hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Upload and Process'}
      </button>
    </form>
  );
} 