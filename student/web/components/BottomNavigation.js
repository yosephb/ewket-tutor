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
  
  return (
    <nav className={styles.bottomNav}>
      <Link href="/">
        <div className={`${styles.navItem} ${router.pathname === '/' ? styles.active : ''}`}>
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navLabel}>Home</span>
        </div>
      </Link>
      
      <Link href="/search">
        <div className={`${styles.navItem} ${router.pathname === '/search' ? styles.active : ''}`}>
          <span className={styles.navIcon}>🔍</span>
          <span className={styles.navLabel}>Search</span>
        </div>
      </Link>
      
      <div 
        className={`${styles.navItem} ${styles.eslceNavItem} ${showESLCEOptions ? styles.active : ''}`}
        onClick={toggleESLCEOptions}
      >
        <span className={styles.navIcon}>📝</span>
        <span className={styles.navLabel}>ESLCE</span>
        
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
        <div className={`${styles.navItem} ${router.pathname === '/chat' ? styles.active : ''}`}>
          <span className={styles.navIcon}>💬</span>
          <span className={styles.navLabel}>Chat</span>
        </div>
      </Link>
      
      <Link href="/profile">
        <div className={`${styles.navItem} ${router.pathname === '/profile' ? styles.active : ''}`}>
          <span className={styles.navIcon}>👤</span>
          <span className={styles.navLabel}>Profile</span>
        </div>
      </Link>
    </nav>
  );
} 