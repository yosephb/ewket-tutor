import Head from 'next/head';
import BottomNavigation from '../components/BottomNavigation';
import styles from '../styles/Home.module.css';

export default function ChatPage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Chat | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <h1>Chat Page</h1>
        <p>This is where you can chat with the AI tutor about any topic.</p>
      </main>

      <BottomNavigation />
    </div>
  );
} 