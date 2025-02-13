from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from typing import Dict, List, Optional
import os
import logging
from dotenv import load_dotenv
load_dotenv() 

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        # Initialize the model
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7,
            openai_api_key=self.api_key
        )

        # Create prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an educational assistant. Answer questions based on the provided context. "
                      "If you cannot answer based on the context, say so clearly."),
            ("user", "Context: {context}\n\nQuestion: {question}")
        ])

        # Create chain
        self.chain = self.prompt | self.llm | StrOutputParser()

    async def generate_response(
        self,
        question: str,
        contexts: List[str],
        temperature: Optional[float] = None
    ) -> Dict:
        """Generate response using the LLM."""
        try:
            # Combine contexts
            combined_context = "\n\n".join(contexts)

            # Use custom temperature if provided
            if temperature is not None:
                llm = ChatOpenAI(
                    model="gpt-4-turbo-preview",
                    temperature=temperature,
                    openai_api_key=self.api_key
                )
                chain = self.prompt | llm | StrOutputParser()
            else:
                chain = self.chain

            # Generate response
            response = chain.invoke({
                "context": combined_context,
                "question": question
            })

            return {
                "response": response,
                "model": "gpt-4-turbo-preview"
            }

        except Exception as e:
            logger.error(f"Error generating LLM response: {str(e)}")
            raise