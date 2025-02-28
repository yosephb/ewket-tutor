import asyncio
from backend.app.services.vector_store import VectorStore
from evaluation.benchmarks.msmarco import MSMarcoDataset

async def main():
    # Use a dedicated collection for MS MARCO
    vs = VectorStore(collection_name="msmarco")
    
    # Load and index MS MARCO passages
    dataset = MSMarcoDataset()
    passages = dataset.load_corpus()
    
    # Index in batches
    batch_size = 100
    for i in range(0, len(passages), batch_size):
        await vs.index_documents(passages[i:i+batch_size])
        print(f"Indexed {i + batch_size}/{len(passages)}")

if __name__ == "__main__":
    asyncio.run(main()) 