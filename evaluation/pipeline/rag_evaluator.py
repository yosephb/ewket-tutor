from typing import List, Dict, Optional
import logging
from pathlib import Path
import yaml
import asyncio
import json
from datetime import datetime
import sys

# Add backend to Python path
backend_path = Path(__file__).parent.parent.parent / 'backend'
sys.path.append(str(backend_path))

from app.services.vector_store import VectorStore
from app.services.llm_service import LLMService
from ..benchmarks.msmarco import MSMarcoDataset
from ..metrics.retrieval import RetrievalMetrics
from ..metrics.ragas_metrics import RagasEvaluator

logger = logging.getLogger(__name__)

class RAGEvaluator:
    def __init__(self, config_path: Optional[Path] = None):
        # Use default config path if none provided
        self.config_path = config_path or Path(__file__).parent.parent / "configs" / "default.yaml"
        self.config = self._load_config(self.config_path)
        
        # Initialize services with proper paths
        try:
            self.vector_store = VectorStore(collection_name="msmarco")
            self.llm_service = LLMService()
            self.traditional_metrics = RetrievalMetrics()
            self.ragas_metrics = RagasEvaluator()
            self.dataset = MSMarcoDataset()
        except Exception as e:
            logger.error(f"Error initializing services: {str(e)}")
            raise
    
    def _load_config(self, config_path: Path) -> Dict:
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logger.error(f"Config file not found at {config_path}")
            # Provide default configuration
            return {
                "model": {
                    "llm": "gpt-4-turbo-preview",
                    "embedding": "multi-qa-mpnet-base-dot-v1"
                },
                "chunking": {
                    "max_chunk_size": 3500,
                    "overlap": 350
                },
                "vector_store": {
                    "type": "chromadb",
                    "host": "localhost",
                    "port": 8000
                },
                "evaluation": {
                    "n_samples": 100,
                    "metrics": {
                        "traditional": ["mrr", "recall@k"],
                        "ragas": ["context_precision", "answer_relevancy", "faithfulness"]
                    }
                }
            }
    
    async def evaluate(self) -> Dict:
        """Run evaluation pipeline."""
        # Load evaluation samples
        samples = self.dataset.load_evaluation_samples(
            n_samples=self.config['evaluation']['n_samples']
        )
        
        # Prepare data for evaluation
        queries = [s['query'] for s in samples]
        ground_truth = [s['positive'] for s in samples]
        
        # Get retrievals and generate answers
        retrieved_docs = []
        generated_answers = []
        
        for query in queries:
            # Get retrieved documents
            results = await self.vector_store.query(
                query_text=query,
                n_results=5
            )
            retrieved_docs.append(results['documents'])
            
            # Generate answer using LLM
            llm_response = await self.llm_service.generate_response(
                question=query,
                contexts=results['documents']
            )
            generated_answers.append(llm_response['response'])
        
        # Compute traditional retrieval metrics
        retrieval_metrics = self.traditional_metrics.evaluate_retrieval(
            queries=queries,
            retrieved_docs=retrieved_docs,
            ground_truth=ground_truth
        )
        
        # Compute RAGAS metrics
        ragas_metrics = self.ragas_metrics.evaluate_rag(
            questions=queries,
            contexts=retrieved_docs,
            answers=generated_answers,
            ground_truth=ground_truth
        )
        
        return {
            "traditional_metrics": retrieval_metrics,
            "ragas_metrics": ragas_metrics,
            "config": self.config,
            "evaluation_details": {
                "num_samples": len(queries),
                "timestamp": datetime.now().isoformat()
            }
        }

async def main():
    evaluator = RAGEvaluator()
    results = await evaluator.evaluate()
    
    logger.info("Attempting to save results...")
    try:
        # Get current working directory
        cwd = Path.cwd()
        logger.debug(f"Current working directory: {cwd}")
        
        # Build results path
        results_dir = Path("evaluation/results").resolve()
        logger.debug(f"Resolved results directory: {results_dir}")
        
        # Create directory if needed
        logger.debug(f"Does directory exist? {results_dir.exists()}")
        results_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {results_dir}")
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = results_dir / f"evaluation_results_{timestamp}.json"
        logger.debug(f"Target file path: {results_file}")
        
        # Verify write permissions
        test_file = results_dir / "write_test.txt"
        try:
            with open(test_file, "w") as f:
                f.write("test")
            test_file.unlink()
            logger.debug("Write permissions verified")
        except Exception as e:
            logger.error(f"Write permission test failed: {str(e)}")
            raise
        
        # Save results
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
            logger.debug(f"Results JSON size: {len(json.dumps(results))} bytes")
        
        logger.info(f"Successfully saved results to: {results_file}")
        logger.info(f"File exists? {results_file.exists()}")
        logger.info(f"File size: {results_file.stat().st_size} bytes")
        
    except Exception as e:
        logger.error(f"Failed to save results: {str(e)}", exc_info=True)
        raise

