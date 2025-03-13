import Head from 'next/head';
import BottomNavigation from '../components/BottomNavigation';
import styles from '../styles/Home.module.css';
import ESLCEPrepButton from '../components/ESLCEPrepButton';

export default function SearchPage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Search | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1>Search Page</h1>
        <p>Search for topics, concepts, and learning materials.</p>
      </main>

      <ESLCEPrepButton 
        searchQuery={searchQuery}
      />

      <BottomNavigation />
    </div>
  );
} 