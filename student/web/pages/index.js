import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import BottomNavigation from '../components/BottomNavigation';
import CourseSelector from '../components/CourseSelector';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { course: courseParam } = router.query;

  useEffect(() => {
    // Fetch courses from the JSON file
    const fetchCourses = async () => {
      try {
        const response = await fetch('/data/course_catalog_v2.json');
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

  // Load selected course from localStorage or URL parameter
  useEffect(() => {
    if (courses.length === 0) return;

    // First check URL parameter
    if (courseParam) {
      const decodedCourseName = decodeURIComponent(courseParam);
      const foundCourse = courses.find(c => c.courseName === decodedCourseName);
      if (foundCourse) {
        setSelectedCourse(foundCourse);
        return;
      }
    }

    // Then check localStorage
    const savedCourse = localStorage.getItem('selectedCourse');
    if (savedCourse) {
      try {
        const parsedCourse = JSON.parse(savedCourse);
        const foundCourse = courses.find(c => c.courseName === parsedCourse.courseName);
        if (foundCourse) {
          setSelectedCourse(foundCourse);
        }
      } catch (error) {
        console.error('Error parsing saved course:', error);
      }
    }
  }, [courses, courseParam]);

  const handleCourseChange = (e) => {
    const courseName = e.target.value;
    const course = courses.find(c => c.courseName === courseName);
    setSelectedCourse(course);
    
    // Save to localStorage and update URL
    if (course) {
      localStorage.setItem('selectedCourse', JSON.stringify(course));
      router.push(`/?course=${encodeURIComponent(course.courseName)}`, undefined, { shallow: true });
    }
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    localStorage.setItem('selectedCourse', JSON.stringify(course));
    router.push(`/?course=${encodeURIComponent(course.courseName)}`, undefined, { shallow: true });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <CourseSelector 
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseSelect={(course) => {
            setSelectedCourse(course);
            localStorage.setItem('selectedCourse', JSON.stringify(course));
            router.push(`/?course=${encodeURIComponent(course.courseName)}`, undefined, { shallow: true });
          }}
        />

        {selectedCourse ? (
          <div className={styles.courseContent}>
            <div className={styles.courseHeader}>
              <button 
                className={styles.backToDashboardButton}
                onClick={() => {
                  localStorage.removeItem('selectedCourse');
                  setSelectedCourse(null);
                  router.push('/', undefined, { shallow: true });
                }}
              >
                ← Back to Dashboard
              </button>
              <h1 className={styles.courseTitle}>{selectedCourse.courseName}</h1>
            </div>
            
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
        ) : (
          <div className={styles.dashboard}>
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Welcome to AI-Powered Learning</h1>
              <p className={styles.welcomeSubtitle}>Your personalized study assistant for ESLCE success</p>
            </div>
            
            <div className={styles.dashboardGrid}>
              <div className={styles.recentCoursesCard}>
                <h2 className={styles.cardTitle}>Recent Courses</h2>
                {courses.slice(0, 3).map((course, index) => (
                  <button 
                    key={index} 
                    className={styles.recentCourseButton}
                    onClick={() => selectCourse(course)}
                  >
                    <span className={styles.courseIcon}>📚</span>
                    <span className={styles.courseName}>{course.courseName}</span>
                  </button>
                ))}
              </div>
              
              <div className={styles.aiAssistantCard}>
                <h2 className={styles.cardTitle}>AI Study Assistant</h2>
                <div className={styles.aiChatPreview}>
                  <div className={styles.aiMessage}>
                    <span className={styles.aiIcon}>🤖</span>
                    <p>How can I help with your studies today?</p>
                  </div>
                  <div className={styles.userInputPreview}>
                    <input 
                      type="text" 
                      placeholder="Ask any question..." 
                      className={styles.previewInput}
                      onClick={() => router.push('/chat')}
                      readOnly
                    />
                    <button className={styles.askButton} onClick={() => router.push('/chat')}>
                      Ask
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.eslcePreparationCard}>
                <h2 className={styles.cardTitle}>ESLCE Preparation</h2>
                <div className={styles.eslceOptions}>
                  <button 
                    className={styles.eslceOptionButton}
                    onClick={() => router.push('/eslce-simulator')}
                  >
                    <span className={styles.eslceIcon}>📝</span>
                    <span>Full Exam Simulator</span>
                  </button>
                  <button 
                    className={styles.eslceOptionButton}
                    onClick={() => router.push('/common-mistakes')}
                  >
                    <span className={styles.eslceIcon}>⚠️</span>
                    <span>Common Mistakes</span>
                  </button>
                  <button 
                    className={styles.eslceOptionButton}
                    onClick={() => router.push('/past-papers')}
                  >
                    <span className={styles.eslceIcon}>🔍</span>
                    <span>Past Papers</span>
                  </button>
                </div>
              </div>
              
              <div className={styles.progressCard}>
                <h2 className={styles.cardTitle}>Your Progress</h2>
                <div className={styles.progressStats}>
                  <div className={styles.progressStat}>
                    <span className={styles.statValue}>42%</span>
                    <span className={styles.statLabel}>Overall Completion</span>
                  </div>
                  <div className={styles.progressStat}>
                    <span className={styles.statValue}>7</span>
                    <span className={styles.statLabel}>Days Streak</span>
                  </div>
                  <div className={styles.progressStat}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>Quizzes Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
} 