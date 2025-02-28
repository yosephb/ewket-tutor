import asyncio
import argparse
import logging
from pathlib import Path
from evaluation.pipeline.rag_evaluator import RAGEvaluator
import json
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description='Run RAG system evaluation')
    parser.add_argument(
        '--config',
        type=str,
        help='Path to custom config file',
        default=None
    )
    parser.add_argument(
        '--log-level',
        type=str,
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        default='INFO',
        help='Set the logging level'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    logging.basicConfig(
        level=args.log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    asyncio.run(run_evaluation(args.config))

async def run_evaluation(config_path: str = None):
    try:
        evaluator = RAGEvaluator(
            config_path=Path(config_path) if config_path else None
        )
        results = await evaluator.evaluate()
        
        # Save results
        try:
            project_root = Path(__file__).parent.parent
            results_dir = project_root / "evaluation" / "results"
            results_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            results_file = results_dir / f"evaluation_results_{timestamp}.json"
            
            with open(results_file, 'w') as f:
                json.dump(results, f, indent=2)
            
            logger.info(f"Results saved to: {results_file}")
        except Exception as e:
            logger.error(f"Failed to save results: {str(e)}")
            raise

        return results
    except Exception as e:
        logger.error(f"Error during evaluation: {str(e)}")
        raise

if __name__ == "__main__":
    main() 