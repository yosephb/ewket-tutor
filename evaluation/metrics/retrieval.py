from typing import List, Dict
import numpy as np

def compute_mrr(predictions: List[str], ground_truth: str) -> float:
    """Compute Mean Reciprocal Rank."""
    for i, pred in enumerate(predictions, 1):
        if pred == ground_truth:
            return 1.0 / i
    return 0.0

def compute_recall_at_k(predictions: List[str], ground_truth: str, k: int = 5) -> float:
    """Compute Recall@K."""
    return 1.0 if ground_truth in predictions[:k] else 0.0

class RetrievalMetrics:
    @staticmethod
    def evaluate_retrieval(
        queries: List[str],
        retrieved_docs: List[List[str]],
        ground_truth: List[str]
    ) -> Dict[str, float]:
        """Evaluate retrieval performance using multiple metrics."""
        mrr_scores = []
        recall_scores = []
        
        for query, docs, truth in zip(queries, retrieved_docs, ground_truth):
            mrr_scores.append(compute_mrr(docs, truth))
            recall_scores.append(compute_recall_at_k(docs, truth))
            
        return {
            "mrr": np.mean(mrr_scores),
            "recall@5": np.mean(recall_scores)
        }
