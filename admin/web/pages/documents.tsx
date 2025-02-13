import Layout from '../components/Layout'
import DocumentUploadForm from '../components/DocumentUploadForm'

export default function DocumentsPage() {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Document Management P</h1>
        <div className="max-w-md">
          <DocumentUploadForm 
            onSuccess={() => {
              alert('Document processed successfully!')
            }}
          />
        </div>
      </div>
    </Layout>
  )
} 