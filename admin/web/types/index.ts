export interface ChunkMetadata {
  page_number: number;
  chapter_number?: string;
  chapter_title?: string;
  section_number?: string;
  section_title?: string;
}

export interface VectorStoreStatus {
  indexed: boolean;
  indexed_at: string;
  embedding_id: string;
}

export interface VectorStoreInfo {
  embedding: number[];
  id: string;
  indexed_at: string;
}

export interface Chunk {
  text: string;
  metadata: ChunkMetadata;
  vector_store_status?: VectorStoreStatus;
  vector_store?: VectorStoreInfo;
  source_file?: string;
  chunk_id?: string;
}

export interface ExtractionFolder {
  name: string;
  created_at: string;
  path: string;
}

export interface PaginationData {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
} 