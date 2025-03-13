import { useState } from 'react';
import styles from '../styles/FollowUpQuestions.module.css';

export default function FollowUpQuestions({ topicData }) {
  const [questions, setQuestions] = useState([
    "How does this topic appear in ESLCE exams?",
    "What are common mistakes students make on this topic?",
    "Can you explain this with a real-world example?",
    "How does this connect to other biology topics in the ESLCE?",
    "What diagrams should I memorize for the exam?"
  ]);

  const handleQuestionClick = (question) => {
    // In a real implementation, this would trigger the AI to answer
    console.log(`User asked: ${question}`);
    // You could open the chat interface with this question pre-filled
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Follow-up Questions</h3>
      <div className={styles.questionsList}>
        {questions.map((question, index) => (
          <button 
            key={index}
            className={styles.questionButton}
            onClick={() => handleQuestionClick(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
} 