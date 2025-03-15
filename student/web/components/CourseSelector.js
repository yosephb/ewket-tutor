import { useState, useEffect, useRef } from 'react';
import styles from '../styles/CourseSelector.module.css';

export default function CourseSelector({ courses, selectedCourse, onCourseSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.courseSelector} ref={dropdownRef}>
      <button 
        className={styles.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCourse ? selectedCourse.courseName : 'Select a course'}</span>
        <span className={styles.dropdownIcon}>{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {courses.map((course, index) => (
            <button
              key={index}
              className={`${styles.courseOption} ${selectedCourse && selectedCourse.courseName === course.courseName ? styles.selected : ''}`}
              onClick={() => {
                onCourseSelect(course);
                setIsOpen(false);
              }}
            >
              {course.courseName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 