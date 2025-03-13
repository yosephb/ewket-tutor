import ESLCEPrepButton from '../../components/ESLCEPrepButton';
import UnitCard from '../../components/UnitCard';
import CourseProgress from '../../components/CourseProgress';
import styles from '../../styles/Course.module.css';
import Head from 'next/head';
import BottomNavigation from '../../components/BottomNavigation';

<ESLCEPrepButton 
  courseData={{
    course: course
  }} 
/> 

return (
  <div className={styles.container}>
    <Head>
      <title>{course} | Student Portal</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <main className={styles.main}>
      <div className={styles.courseHeader}>
        <h1 className={styles.courseTitle}>{course}</h1>
        <div className={styles.courseActions}>
          <button className={styles.eslceSimulatorButton}>
            <span className={styles.buttonIcon}>📝</span>
            <span>ESLCE Simulator</span>
          </button>
        </div>
      </div>
      
      <CourseProgress course={course} units={units} />
      
      <div className={styles.unitsContainer}>
        {units.map((unit, index) => (
          <UnitCard 
            key={index}
            course={course}
            unit={unit}
            topicCount={unit.topicCount}
          />
        ))}
      </div>
    </main>

    <ESLCEPrepButton 
      courseData={{
        course: course
      }} 
    />
    
    <BottomNavigation />
  </div>
); 