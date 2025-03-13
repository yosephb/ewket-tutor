import styles from '../styles/UnitProgressIndicator.module.css';

export default function UnitProgressIndicator({ completed, total }) {
  const percentage = Math.round((completed / total) * 100) || 0;
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className={styles.progressText}>
        {completed}/{total} completed
      </span>
    </div>
  );
} 