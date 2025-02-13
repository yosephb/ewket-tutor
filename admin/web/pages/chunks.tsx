import Layout from '../components/Layout'
import ChunkViewer from '../components/ChunkViewer'
import { Chunk } from '../types'

export default function ChunksPage() {
  const handleChunkSelect = (chunk: Chunk) => {
    console.log('Selected chunk:', chunk)
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Chunk Management</h1>
        <ChunkViewer onChunkSelect={handleChunkSelect} />
      </div>
    </Layout>
  )
} 