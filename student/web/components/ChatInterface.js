import { useState, useRef, useEffect } from 'react';
import styles from '../styles/ChatInterface.module.css';

export default function ChatInterface({ topicData, onClose }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hi there! I'm your AI tutor. Ask me anything about "${topicData.topic}".`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            topic: topicData.topic,
            overview: topicData.refresherNotes?.overview,
            keyConcepts: topicData.refresherNotes?.keyConcepts
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h3>Chat with AI Tutor</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage} ${styles.loading}`}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className={styles.chatInput}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
} 