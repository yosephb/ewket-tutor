import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/BottomNavigation.module.css';

export default function BottomNavigation() {
  const router = useRouter();
  const [showESLCEOptions, setShowESLCEOptions] = useState(false);
  
  const toggleESLCEOptions = (e) => {
    e.preventDefault();
    setShowESLCEOptions(!showESLCEOptions);
  };
  
  // Function to clear course selection and return to dashboard
  const goToDashboard = () => {
    // Clear the selected course from localStorage to show the dashboard
    localStorage.removeItem('selectedCourse');
    // Navigate to home page without course parameter
    router.push('/', undefined, { shallow: true });
  };
  
  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navItem} onClick={goToDashboard}>
        <div className={styles.navIcon}>🏠</div>
        <div className={styles.navLabel}>Home</div>
      </div>
      
      <Link href="/search">
        <div className={styles.navItem}>
          <div className={styles.navIcon}>🔍</div>
          <div className={styles.navLabel}>Search</div>
        </div>
      </Link>
      
      <div 
        className={`${styles.navItem} ${styles.eslceNavItem} ${showESLCEOptions ? styles.active : ''}`}
        onClick={toggleESLCEOptions}
      >
        <div className={styles.navIcon}>📝</div>
        <div className={styles.navLabel}>ESLCE</div>
        
        {showESLCEOptions && (
          <div className={styles.eslceOptions}>
            <Link href="/eslce-simulator">
              <div className={styles.eslceOption}>Full Exam Simulator</div>
            </Link>
            <Link href="/past-papers">
              <div className={styles.eslceOption}>Past Papers</div>
            </Link>
            <Link href="/common-mistakes">
              <div className={styles.eslceOption}>Common Mistakes</div>
            </Link>
            <Link href="/revision-notes">
              <div className={styles.eslceOption}>Revision Notes</div>
            </Link>
          </div>
        )}
      </div>
      
      <Link href="/chat">
        <div className={styles.navItem}>
          <div className={styles.navIcon}>💬</div>
          <div className={styles.navLabel}>Chat</div>
        </div>
      </Link>
      
      <Link href="/profile">
        <div className={styles.navItem}>
          <div className={styles.navIcon}>👤</div>
          <div className={styles.navLabel}>Profile</div>
        </div>
      </Link>
    </nav>
  );
} 