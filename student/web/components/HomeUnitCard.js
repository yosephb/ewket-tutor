import Link from 'next/link';
import styles from '../styles/HomeUnitCard.module.css';

export default function HomeUnitCard({ course, unit, topicCount }) {
  const courseSlug = encodeURIComponent(course);
  const unitSlug = encodeURIComponent(unit);
  
  return (
    <div className={styles.unitCard}>
      <div className={styles.unitHeader}>
        <Link href={`/unit/${courseSlug}/${unitSlug}`}>
          <h3 className={styles.unitTitle}>{unit}</h3>
        </Link>
      </div>
      
      <div className={styles.unitFooter}>
        <span className={styles.topicCount}>{topicCount} topics</span>
        
        <div className={styles.actionButtons}>
          <Link href={`/quiz/knowledge-check/${courseSlug}/${unitSlug}`}>
            <button className={`${styles.actionButton} ${styles.knowledgeCheck}`} title="Knowledge Check">
              <span className={styles.buttonIcon}>✓</span>
            </button>
          </Link>
          
          <Link href={`/quiz/eslce-style/${courseSlug}/${unitSlug}`}>
            <button className={`${styles.actionButton} ${styles.eslceStyle}`} title="ESLCE Practice">
              <span className={styles.buttonIcon}>📝</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 