import Link from 'next/link';
import styles from '../styles/UnitListItemCompact.module.css';

export default function UnitListItemCompact({ course, unit, topicCount }) {
  const courseSlug = encodeURIComponent(course);
  const unitSlug = encodeURIComponent(unit);
  
  return (
    <div className={styles.unitItem}>
      <div className={styles.unitInfo}>
        <Link href={`/unit/${courseSlug}/${unitSlug}`}>
          <h3 className={styles.unitTitle}>{unit}</h3>
        </Link>
        <span className={styles.topicCount}>{topicCount} topics</span>
      </div>
      
      <div className={styles.actionButtons}>
        <Link href={`/quiz/knowledge-check/${courseSlug}/${unitSlug}`}>
          <button className={`${styles.actionButton} ${styles.knowledgeCheck}`}>
            <span className={styles.buttonIcon}>✓</span>
          </button>
        </Link>
        
        <Link href={`/quiz/eslce-style/${courseSlug}/${unitSlug}`}>
          <button className={`${styles.actionButton} ${styles.eslceStyle}`}>
            <span className={styles.buttonIcon}>📝</span>
          </button>
        </Link>
      </div>
    </div>
  );
} 