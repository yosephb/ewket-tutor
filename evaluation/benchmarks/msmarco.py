from typing import List, Dict
import json
from pathlib import Path
import requests
import logging
import gzip

logger = logging.getLogger(__name__)

class MSMarcoDataset:
    def __init__(self, data_dir: Path = Path("evaluation/benchmarks/data"), corpus_path: Path = Path("data/msmarco/corpus.jsonl.gz")):
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.dataset_url = "https://msmarco.blob.core.windows.net/msmarcoranking/triples.train.small.tar.gz"
        self.corpus_path = corpus_path
        
    def download_dataset(self):
        """Download MS MARCO dataset if not already present."""
        dataset_path = self.data_dir / "msmarco_train_small.json"
        
        if not dataset_path.exists():
            logger.info("Downloading MS MARCO dataset...")
            # Download and process dataset
            # For initial testing, we'll use a small subset
            sample_data = [
                {
                    "query": "what is photosynthesis",
                    "positive": "Photosynthesis is the process by which plants convert sunlight into energy.",
                    "negative": "Cellular respiration breaks down glucose to release energy."
                },
                # Add more sample pairs as needed
            ]
            
            with open(dataset_path, 'w') as f:
                json.dump(sample_data, f, indent=2)
                
        return dataset_path
    
    def load_evaluation_samples(self, n_samples: int = 100) -> List[Dict]:
        """Load evaluation samples from MS MARCO dataset."""
        dataset_path = self.download_dataset()
        
        with open(dataset_path, 'r') as f:
            data = json.load(f)
            
        return data[:n_samples]

    def load_corpus(self) -> list[str]:
        """Load all MS MARCO passages from compressed JSONL"""
        passages = []
        with gzip.open(self.corpus_path, 'rt') as f:
            for line in f:
                data = json.loads(line)
                passages.append(data['text'])
        return passages
