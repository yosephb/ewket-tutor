import asyncio
from pathlib import Path
from .services.vector_store import VectorStore

async def main(action: str, collection_name: str = "textbook_content"):
    vs = VectorStore(collection_name=collection_name)
    
    if action == "export":
        output_path = Path(f"chroma_{collection_name}_backup.json")
        vs.export_collection(output_path)
        print(f"Exported '{collection_name}' to {output_path}")
    elif action == "delete":
        vs.delete_collection()
        print(f"Deleted collection '{collection_name}'")
    else:
        raise ValueError(f"Unknown action: {action}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Manage ChromaDB collections")
    parser.add_argument("action", choices=["export", "delete"])
    parser.add_argument("--collection", default="textbook_content")
    args = parser.parse_args()
    
    asyncio.run(main(args.action, args.collection)) 