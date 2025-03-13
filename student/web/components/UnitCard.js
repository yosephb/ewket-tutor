import Link from 'next/link';
import styles from '../styles/UnitCard.module.css';

export default function UnitCard({ course, unit, topicCount }) {
  const unitSlug = encodeURIComponent(unit.title);
  const courseSlug = encodeURIComponent(course);
  
  return (
    <div className={styles.unitCard}>
      <div className={styles.unitHeader}>
        <Link href={`/unit/${courseSlug}/${unitSlug}`}>
          <h3 className={styles.unitTitle}>{unit.title}</h3>
        </Link>
        <span className={styles.topicCount}>{topicCount} topics</span>
      </div>
      
      <div className={styles.unitActions}>
        <Link href={`/unit/${courseSlug}/${unitSlug}`}>
          <button className={styles.studyButton}>
            <span className={styles.buttonIcon}>📖</span>
            <span>Study Unit</span>
          </button>
        </Link>
        
        <Link href={`/quiz/unit-check/${courseSlug}/${unitSlug}`}>
          <button className={styles.quizButton}>
            <span className={styles.buttonIcon}>✓</span>
            <span>Unit Quiz</span>
          </button>
        </Link>
        
        <Link href={`/eslce-simulator?course=${courseSlug}&unit=${unitSlug}`}>
          <button className={styles.eslceButton}>
            <span className={styles.buttonIcon}>📝</span>
            <span>ESLCE Practice</span>
          </button>
        </Link>
      </div>
    </div>
  );
} 