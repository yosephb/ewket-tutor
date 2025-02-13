export interface ChunkMetadata {
  page_number: number;
  chapter_number?: string;
  chapter_title?: string;
  section_number?: string;
  section_title?: string;
}

export interface Chunk {
  text: string;
  metadata: ChunkMetadata;
  source_file?: string;
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