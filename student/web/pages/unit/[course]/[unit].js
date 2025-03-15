import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import BottomNavigation from '../../../components/BottomNavigation';
import ESLCEPrepButton from '../../../components/ESLCEPrepButton';
import styles from '../../../styles/Unit.module.css';

export default function UnitPage() {
  const router = useRouter();
  const { course, unit } = router.query;
  
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!course || !unit) return;

    const loadUnitData = async () => {
      try {
        const response = await fetch('/data/course_catalog_v2.json');
        const data = await response.json();
        
        const selectedCourse = data.courses.find(c => c.courseName === decodeURIComponent(course));
        if (selectedCourse) {
          const selectedUnit = selectedCourse.units.find(u => u.unit === decodeURIComponent(unit));
          if (selectedUnit) {
            setUnitData(selectedUnit);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading unit data:', error);
        setLoading(false);
      }
    };

    loadUnitData();
  }, [course, unit]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading unit content...</div>;
  }

  if (!unitData) {
    return <div className={styles.errorContainer}>Unit not found</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{unitData.unit} | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.header}>
        <Link href="/">
          <span className={styles.backButton}>← Back</span>
        </Link>
        <h1 className={styles.unitTitle}>{unitData.unit}</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.topicList}>
          {unitData.topics.map((topic, index) => (
            <Link 
              href={`/topic/${encodeURIComponent(course)}/${encodeURIComponent(unit)}/${encodeURIComponent(topic.topic)}`}
              key={index}
            >
              <div className={styles.topicItem}>
                <h3 className={styles.topicTitle}>{topic.topic}</h3>
                <p className={styles.topicOverview}>
                  {topic.refresherNotes?.overview?.substring(0, 100)}...
                </p>
                <span className={styles.viewButton}>View →</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <ESLCEPrepButton 
        unitData={{
          course: course,
          unit: unit
        }} 
      />

      <BottomNavigation />
    </div>
  );
} 