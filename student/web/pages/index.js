import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import BottomNavigation from '../components/BottomNavigation';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch courses from the JSON file
    const fetchCourses = async () => {
      try {
        const response = await fetch('/data/course_catalog_v1.json');
        const data = await response.json();
        setCourses(data.courses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseChange = (e) => {
    const courseName = e.target.value;
    const course = courses.find(c => c.courseName === courseName);
    setSelectedCourse(course);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <div className={styles.courseSelector}>
          <select 
            onChange={handleCourseChange} 
            value={selectedCourse ? selectedCourse.courseName : ''}
            className={styles.courseDropdown}
          >
            <option value="" disabled>Select a course</option>
            {courses.map((course, index) => (
              <option key={index} value={course.courseName}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className={styles.courseContent}>
            <h1 className={styles.courseTitle}>{selectedCourse.courseName}</h1>
            
            <div className={styles.unitsList}>
              {selectedCourse.units && selectedCourse.units.map((unit, index) => {
                // Extract the unit name and count topics
                const unitName = unit.unit;
                const topicCount = unit.topics ? unit.topics.length : 0;
                
                return (
                  <div key={index} className={styles.unitCard}>
                    <Link href={`/unit/${encodeURIComponent(selectedCourse.courseName)}/${encodeURIComponent(unitName)}`}>
                      <h3 className={styles.unitTitle}>{unitName}</h3>
                    </Link>
                    
                    <div className={styles.unitFooter}>
                      <span className={styles.topicCount}>{topicCount} topics</span>
                      
                      <div className={styles.actionButtons}>
                        <Link href={`/quiz/knowledge-check/${encodeURIComponent(selectedCourse.courseName)}/${encodeURIComponent(unitName)}`}>
                          <button className={styles.knowledgeCheckButton} title="Knowledge Check">
                            ✓
                          </button>
                        </Link>
                        
                        <Link href={`/quiz/eslce-style/${encodeURIComponent(selectedCourse.courseName)}/${encodeURIComponent(unitName)}`}>
                          <button className={styles.eslceStyleButton} title="ESLCE Practice">
                            📝
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
} 