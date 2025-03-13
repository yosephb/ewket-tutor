import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/UnitList.module.css';

export default function UnitList({ units, courseName }) {
  return (
    <div className={styles.unitListContainer}>
      <h2 className={styles.courseTitle}>{courseName}</h2>
      <div className={styles.unitGrid}>
        {units.map((unit, index) => (
          <Link 
            href={`/unit/${encodeURIComponent(courseName)}/${encodeURIComponent(unit.unit)}`}
            key={index}
          >
            <div className={styles.unitCard}>
              <h3 className={styles.unitTitle}>{unit.unit}</h3>
              <p className={styles.topicCount}>{unit.topics.length} topics</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 