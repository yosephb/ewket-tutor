import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/ESLCEPrepButton.module.css';

export default function ESLCEPrepButton({ topicData, unitData, courseData, searchQuery }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextType, setContextType] = useState('general'); // 'topic', 'unit', 'course', 'search', or 'general'
  const router = useRouter();
  
  useEffect(() => {
    // Determine the context type based on props
    if (topicData) {
      setContextType('topic');
    } else if (unitData) {
      setContextType('unit');
    } else if (courseData) {
      setContextType('course');
    } else if (searchQuery) {
      setContextType('search');
    } else {
      setContextType('general');
    }
  }, [topicData, unitData, courseData, searchQuery]);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleMenuItemClick = (action) => {
    // Close the menu
    setIsOpen(false);
    
    // Handle different actions based on context
    switch(action) {
      case 'generate-questions':
        if (contextType === 'topic') {
          router.push(`/quiz/eslce-style/${encodeURIComponent(topicData.course)}/${encodeURIComponent(topicData.unit)}/${encodeURIComponent(topicData.topic)}`);
        } else if (contextType === 'unit') {
          router.push(`/eslce-simulator?course=${encodeURIComponent(unitData.course)}&unit=${encodeURIComponent(unitData.unit)}`);
        } else if (contextType === 'course') {
          router.push(`/eslce-simulator?course=${encodeURIComponent(courseData.course)}`);
        } else if (contextType === 'search') {
          router.push(`/eslce-simulator?search=${encodeURIComponent(searchQuery)}`);
        } else {
          router.push('/eslce-simulator');
        }
        break;
      case 'show-mistakes':
        // Navigate to common mistakes page with appropriate context
        if (contextType === 'topic') {
          router.push(`/common-mistakes/${encodeURIComponent(topicData.course)}/${encodeURIComponent(topicData.unit)}/${encodeURIComponent(topicData.topic)}`);
        } else {
          router.push('/common-mistakes');
        }
        break;
      case 'exam-focus':
        // Navigate to exam focus page with appropriate context
        router.push('/exam-focus');
        break;
      case 'past-papers':
        // Navigate to past papers page
        router.push('/past-papers');
        break;
      case 'revision-notes':
        // Navigate to revision notes page with appropriate context
        router.push('/revision-notes');
        break;
      default:
        // Default action
        router.push('/eslce-simulator');
    }
  };
  
  // Get context-specific menu items
  const getMenuItems = () => {
    const baseItems = [
      {
        id: 'generate-questions',
        label: 'Generate ESLCE-style Questions',
        contextLabel: {
          topic: `Generate Questions for "${topicData?.topic}"`,
          unit: `Generate Questions for "${unitData?.unit}" Unit`,
          course: `Generate Questions for ${courseData?.course}`,
          search: `Generate Questions for "${searchQuery}"`,
        }
      },
      {
        id: 'show-mistakes',
        label: 'Show Common Exam Mistakes',
      },
      {
        id: 'exam-focus',
        label: 'Explain with Exam Focus',
      },
      {
        id: 'past-papers',
        label: 'Compare with Past Papers',
      },
      {
        id: 'revision-notes',
        label: 'Create Quick Revision Notes',
      }
    ];
    
    // Return items with context-specific labels where applicable
    return baseItems.map(item => ({
      ...item,
      label: item.contextLabel && item.contextLabel[contextType] 
        ? item.contextLabel[contextType] 
        : item.label
    }));
  };
  
  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.menu}>
          {getMenuItems().map(item => (
            <button 
              key={item.id}
              className={styles.menuItem}
              onClick={() => handleMenuItemClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      
      <button 
        className={`${styles.eslceButton} ${isOpen ? styles.active : ''}`}
        onClick={toggleMenu}
      >
        <span className={styles.eslceIcon}>📝</span>
        <span className={styles.eslceText}>ESLCE Prep</span>
      </button>
    </div>
  );
} 