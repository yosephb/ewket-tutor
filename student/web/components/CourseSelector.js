import { useState } from 'react';
import styles from '../styles/CourseSelector.module.css';

export default function CourseSelector({ courses, selectedCourse, onCourseChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectCourse = (course) => {
    onCourseChange(course);
    setIsOpen(false);
  };

  return (
    <div className={styles.selectorContainer}>
      <button 
        className={styles.selectorButton} 
        onClick={toggleDropdown}
      >
        {selectedCourse ? selectedCourse.courseName : 'Select a Course'}
        <span className={styles.dropdownIcon}>▼</span>
      </button>
      
      {isOpen && (
        <ul className={styles.courseList}>
          {courses.map((course, index) => (
            <li 
              key={index} 
              className={styles.courseItem}
              onClick={() => selectCourse(course)}
            >
              {course.courseName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 