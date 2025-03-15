export interface Exam {
  id: string;
  exam_name: string;
  subject: string;
  year: string;
  question_count: number;
  has_embeddings: boolean;
  created_at: string;
}

export interface Question {
  question_id: string;
  question_text: string;
  options: Record<string, string>;
  answer: string;
  unit_tags: string[];
  topic_tags: string[];
  has_embedding: boolean;
} 