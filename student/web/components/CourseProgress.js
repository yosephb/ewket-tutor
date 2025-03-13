import { useState, useEffect } from 'react';
import styles from '../styles/CourseProgress.module.css';

export default function CourseProgress({ course, units }) {
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
    unitProgress: []
  });
  
  useEffect(() => {
    // In a real app, fetch this from your API or localStorage
    // For now, we'll simulate progress data
    const totalTopics = units.reduce((sum, unit) => sum + unit.topicCount, 0);
    const completedTopics = Math.floor(Math.random() * totalTopics); // Simulate random progress
    
    const unitProgress = units.map(unit => {
      const unitCompletedTopics = Math.floor(Math.random() * unit.topicCount);
      return {
        unit: unit.title,
        completed: unitCompletedTopics,
        total: unit.topicCount,
        percentage: Math.round((unitCompletedTopics / unit.topicCount) * 100)
      };
    });
    
    setProgress({
      completed: completedTopics,
      total: totalTopics,
      percentage: Math.round((completedTopics / totalTopics) * 100),
      unitProgress
    });
  }, [units]);
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressHeader}>
        <h3 className={styles.progressTitle}>Your Progress</h3>
        <span className={styles.progressPercentage}>{progress.percentage}%</span>
      </div>
      
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progress.percentage}%` }}
        ></div>
      </div>
      
      <div className={styles.progressStats}>
        <span>{progress.completed} of {progress.total} topics completed</span>
        <span className={styles.eslceReadiness}>
          ESLCE Readiness: {progress.percentage >= 75 ? 'High' : progress.percentage >= 50 ? 'Medium' : 'Low'}
        </span>
      </div>
    </div>
  );
} 