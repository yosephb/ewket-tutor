import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/TopicActionButtons.module.css';

export default function TopicActionButtons({ topicData, quizProgress }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleQuizStart = (quizType) => {
    setIsLoading(true);
    router.push(`/quiz/${quizType}/${encodeURIComponent(topicData.course)}/${encodeURIComponent(topicData.unit)}/${encodeURIComponent(topicData.topic)}`);
  };
  
  return (
    <div className={styles.actionButtonsContainer}>
      <div className={styles.headerRow}>
        <h3 className={styles.sectionTitle}>Test Your Knowledge</h3>
        {quizProgress && (
          <div className={styles.progressIndicator}>
            {quizProgress.knowledgeCheck && (
              <span className={styles.progressBadge} title="Knowledge Check Completed">
                ✓ Knowledge
              </span>
            )}
            {quizProgress.eslceStyle && (
              <span className={styles.progressBadge} title="ESLCE Practice Completed">
                ✓ ESLCE
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.buttonGroup}>
        <button 
          className={`${styles.actionButton} ${styles.knowledgeCheck}`}
          onClick={() => handleQuizStart('knowledge-check')}
          disabled={isLoading}
        >
          <span className={styles.buttonIcon}>✓</span>
          <div className={styles.buttonContent}>
            <span className={styles.buttonTitle}>Knowledge Check</span>
            <span className={styles.buttonDescription}>Quick 5-question quiz on key concepts</span>
          </div>
          {quizProgress?.knowledgeCheck && (
            <span className={styles.completedIcon} title="Completed">✓</span>
          )}
        </button>
        
        <button 
          className={`${styles.actionButton} ${styles.eslceStyle}`}
          onClick={() => handleQuizStart('eslce-style')}
          disabled={isLoading}
        >
          <span className={styles.buttonIcon}>📝</span>
          <div className={styles.buttonContent}>
            <span className={styles.buttonTitle}>ESLCE Practice</span>
            <span className={styles.buttonDescription}>Exam-style questions for this topic</span>
          </div>
          {quizProgress?.eslceStyle && (
            <span className={styles.completedIcon} title="Completed">✓</span>
          )}
        </button>
      </div>
    </div>
  );
} 