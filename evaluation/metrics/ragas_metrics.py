from typing import List, Dict
from ragas import evaluate
from ragas.metrics import (
    ContextPrecision,
    AnswerRelevancy,
    Faithfulness,
    ContextRecall
)
from datasets import Dataset
import logging

logger = logging.getLogger(__name__)

class RagasEvaluator:
    def __init__(self):
        # Instantiate the metric objects
        self.metrics = [
            ContextPrecision(),
            AnswerRelevancy(),
            Faithfulness(),
            ContextRecall()
        ]
    
    def evaluate_rag(
        self,
        questions: List[str],
        contexts: List[List[str]],
        answers: List[str],
        ground_truth: List[str],
    ) -> Dict[str, float]:
        """
        Evaluate RAG system using RAGAS metrics.
        This version instantiates the metric objects and then
        extracts their results without assuming the returned object is a dict.
        """
        try:
            # Convert data to HuggingFace Dataset format.
            # RAGAS requires a "retrieved_contexts" field that is a list of strings.
            eval_data = Dataset.from_dict({
                "question": questions,
                "retrieved_contexts": contexts,  # Pass the list as-is.
                "response": answers,
                "ground_truth": ground_truth
            })
            
            results = evaluate(
                eval_data,
                metrics=self.metrics
            )
            
            logger.info(f"RAGAS raw results: {results}")
            
            # Try converting results to a dictionary if possible,
            # otherwise use attribute access.
            if hasattr(results, "to_dict"):
                results_dict = results.to_dict()
            else:
                results_dict = {}
                for metric in self.metrics:
                    key = metric.__class__.__name__.lower()
                    results_dict[key] = getattr(results, key, 0.0)
            
            # Build the output dict.
            output = {}
            for metric in self.metrics:
                key = metric.__class__.__name__.lower()
                try:
                    value = results_dict.get(key, 0.0)
                    output[key] = float(value)
                except Exception as e:
                    logger.error(f"Error extracting metric '{key}': {e}")
                    output[key] = 0.0
            return output
            
        except Exception as e:
            logger.error(f"Error in RAGAS evaluation: {str(e)}")
            return {
                "context_precision": 0.0,
                "answer_relevancy": 0.0,
                "faithfulness": 0.0,
                "context_recall": 0.0,
                "error": str(e)
            }