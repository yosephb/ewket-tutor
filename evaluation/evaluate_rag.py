import json
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from sklearn.metrics import precision_score, recall_score
from rouge_score import rouge_scorer
import evaluate  # Hugging Face BLEU, BERTScore
import requests  # Add this import at the top

# Load evaluation dataset
with open("custom_evaluation_dataset2.json", "r") as f:
    evaluation_dataset = json.load(f)


# Initialize Hugging Face Metrics
bleu = evaluate.load("bleu")
bertscore = evaluate.load("bertscore")

API_BASE_URL = "http://localhost:8001"  # Add this constant

# Modified retrieve_chunks function to use the chunk_ids from the API
def retrieve_chunks(query, top_k=5):
    try:
        print(f"\n🔍 Sending query to API: {query}")
        
        response = requests.post(
            f"{API_BASE_URL}/api/admin/documents/query",
            data={
                "query": query,
                "n_results": top_k
            }
        )
        response.raise_for_status()
        results = response.json()
        
        # Debug the full API response structure
        print(f"📊 API Response Structure:")
        print(f"  Keys in response: {list(results.keys())}")
        print(f"  Keys in query_results: {list(results['query_results'].keys())}")
        
        # Get the chunk_ids directly from the API response
        chunk_ids = results["query_results"]["chunk_ids"]
        print(f"  Actual chunk_ids from API: {chunk_ids}")
        
        retrieved_chunks = []
        for i, (doc, meta, score, chunk_id) in enumerate(zip(
            results["query_results"]["documents"],
            results["query_results"]["metadatas"],
            results["query_results"]["normalized_scores"],
            chunk_ids
        )):
            print(f"  Chunk {i+1}:")
            print(f"    Metadata: {meta}")
            print(f"    API chunk_id: {chunk_id}")
            print(f"    Score: {score}")
            print(f"    Text snippet: {doc[:100]}...")
            
            retrieved_chunks.append({
                "chunk_id": chunk_id,  # Use the chunk_id from the API
                "text": doc,
                "retrieved_rank": i + 1,
                "retrieved_score": score
            })
            
        return retrieved_chunks, results["llm_response"]
    
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        # Print the full exception traceback for more details
        import traceback
        traceback.print_exc()
        return [], ""

# Function to compute retrieval evaluation metrics
def evaluate_retrieval(dataset, k=5):
    precision, recall, mrr, ndcg = [], [], [], []
    
    for entry in dataset:
        retrieved_ids = [chunk["chunk_id"] for chunk in entry["retrieved_chunks"]]
        gold_ids = entry["gold_chunks"]

        # Compute Precision & Recall
        correct_retrievals = len(set(retrieved_ids) & set(gold_ids))
        precision.append(correct_retrievals / len(retrieved_ids) if retrieved_ids else 0)
        recall.append(correct_retrievals / len(gold_ids) if gold_ids else 0)

        # Compute MRR (first correct chunk in ranked list)
        for rank, chunk in enumerate(entry["retrieved_chunks"]):
            if chunk["chunk_id"] in gold_ids:
                mrr.append(1 / (rank + 1))
                break
        else:
            mrr.append(0)

        # Compute NDCG (normalized discounted cumulative gain)
        relevance = [1 if chunk in gold_ids else 0 for chunk in retrieved_ids]
        gains = np.array(relevance)
        discounts = np.log2(np.arange(len(gains)) + 2)
        dcg = np.sum(gains / discounts)
        idcg = np.sum(sorted(gains, reverse=True) / discounts) if np.sum(gains) > 0 else 1
        ndcg.append(dcg / idcg)

    return {
        "Precision@k": sum(precision) / len(precision),
        "Recall@k": sum(recall) / len(recall),
        "MRR": sum(mrr) / len(mrr),
        "NDCG": sum(ndcg) / len(ndcg)
    }

# Function to evaluate LLM-generated answers
def evaluate_generation(dataset):
    rouge = rouge_scorer.RougeScorer(["rougeL"], use_stemmer=True)
    exact_match, rouge_scores, bleu_scores, bert_scores = [], [], [], []

    for entry in dataset:
        reference = entry["gold_answer"]
        prediction = entry["generated_answer"]

        # Exact Match (EM)
        exact_match.append(1 if reference.lower().strip() == prediction.lower().strip() else 0)

        # ROUGE-L Score
        rouge_scores.append(rouge.score(reference, prediction)["rougeL"].fmeasure)

        # BLEU Score
        bleu_scores.append(bleu.compute(predictions=[prediction], references=[[reference]])["bleu"])

        # BERTScore (add lang parameter)
        bert_scores.append(bertscore.compute(
            predictions=[prediction],
            references=[[reference]],
            lang="en"  # Add language specification
        )["f1"][0])

    return {
        "Exact Match": sum(exact_match) / len(exact_match),
        "ROUGE-L": sum(rouge_scores) / len(rouge_scores),
        "BLEU": sum(bleu_scores) / len(bleu_scores),
        "BERTScore": sum(bert_scores) / len(bert_scores)
    }

# Modified evaluation loop
for entry in evaluation_dataset:
    # Single API call handles both retrieval and generation
    entry["retrieved_chunks"], entry["generated_answer"] = retrieve_chunks(entry["query"])
    
    # Add debugging to see what's happening
    print(f"\nQuery: {entry['query']}")
    print(f"Gold chunks: {entry['gold_chunks']}")
    print(f"Retrieved chunks: {[chunk['chunk_id'] for chunk in entry['retrieved_chunks']]}")

retrieval_results = evaluate_retrieval(evaluation_dataset)
generation_results = evaluate_generation(evaluation_dataset)

# Print Results
print("🔹 Retrieval Evaluation Metrics:")
print(json.dumps(retrieval_results, indent=4))

print("\n🔹 Generation Evaluation Metrics:")
print(json.dumps(generation_results, indent=4))

# Save evaluation results
with open("evaluation_results.json", "w") as f:
    json.dump({"retrieval": retrieval_results, "generation": generation_results}, f, indent=4)

print("\n✅ Evaluation complete! Results saved in 'evaluation_results.json'.")

# Let's also examine the gold standard format more closely
print("\n🔍 Examining evaluation dataset structure:")
sample_entry = evaluation_dataset[0]
print(f"Sample entry keys: {list(sample_entry.keys())}")
print(f"Sample gold chunks: {sample_entry['gold_chunks']}")
print(f"Sample query: {sample_entry['query']}")
if 'gold_answer' in sample_entry:
    print(f"Sample gold answer: {sample_entry['gold_answer'][:100]}...")
