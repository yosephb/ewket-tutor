import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/UnitListItem.module.css';

export default function UnitListItem({ course, unit, topicCount }) {
  const [showActions, setShowActions] = useState(false);
  const courseSlug = encodeURIComponent(course);
  const unitSlug = encodeURIComponent(unit);
  
  return (
    <div className={styles.unitItem}>
      <div className={styles.unitHeader} onClick={() => setShowActions(!showActions)}>
        <Link href={`/unit/${courseSlug}/${unitSlug}`}>
          <h3 className={styles.unitTitle}>{unit}</h3>
        </Link>
        <div className={styles.unitMeta}>
          <span className={styles.topicCount}>{topicCount} topics</span>
          <button 
            className={styles.actionToggle}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            {showActions ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {showActions && (
        <div className={styles.actionButtons}>
          <Link href={`/quiz/knowledge-check/${courseSlug}/${unitSlug}`}>
            <button className={`${styles.actionButton} ${styles.knowledgeCheck}`}>
              <span className={styles.buttonIcon}>✓</span>
              <span className={styles.buttonText}>Knowledge Check</span>
            </button>
          </Link>
          
          <Link href={`/quiz/eslce-style/${courseSlug}/${unitSlug}`}>
            <button className={`${styles.actionButton} ${styles.eslceStyle}`}>
              <span className={styles.buttonIcon}>📝</span>
              <span className={styles.buttonText}>ESLCE Practice</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
} 