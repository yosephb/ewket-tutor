import Head from 'next/head';
import BottomNavigation from '../components/BottomNavigation';
import styles from '../styles/Home.module.css';

export default function ProfilePage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Profile | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1>Profile Page</h1>
        <p>View and manage your student profile and learning progress.</p>
      </main>

      <BottomNavigation />
    </div>
  );
} 