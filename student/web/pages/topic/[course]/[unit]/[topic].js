import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import BottomNavigation from '../../../../components/BottomNavigation';
import ChatInterface from '../../../../components/ChatInterface';
import ESLCEAITools from '../../../../components/ESLCEAITools';
import ESLCEPrepButton from '../../../../components/ESLCEPrepButton';
import FollowUpQuestions from '../../../../components/FollowUpQuestions';
import TopicActionButtons from '../../../../components/TopicActionButtons';
import styles from '../../../../styles/Topic.module.css';

export default function TopicPage() {
  const router = useRouter();
  const { course, unit, topic } = router.query;
  
  const [topicData, setTopicData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [quizProgress, setQuizProgress] = useState(null);

  useEffect(() => {
    if (!course || !unit || !topic) return;

    const loadTopicData = async () => {
      try {
        const response = await fetch('/data/course_catalog_v2.json');
        const data = await response.json();
        
        const selectedCourse = data.courses.find(c => c.courseName === decodeURIComponent(course));
        if (selectedCourse) {
          const selectedUnit = selectedCourse.units.find(u => u.unit === decodeURIComponent(unit));
          if (selectedUnit) {
            const selectedTopic = selectedUnit.topics.find(t => t.topic === decodeURIComponent(topic));
            if (selectedTopic) {
              setTopicData(selectedTopic);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading topic data:', error);
        setLoading(false);
      }
    };

    loadTopicData();
  }, [course, unit, topic]);

  useEffect(() => {
    if (!course || !unit || !topicData) return;
    
    // In a real app, this would come from an API or localStorage
    // For now, we'll simulate it
    const mockProgress = {
      knowledgeCheck: Math.random() > 0.5, // Randomly show as completed or not
      eslceStyle: Math.random() > 0.7,     // Randomly show as completed or not
    };
    
    setQuizProgress(mockProgress);
  }, [course, unit, topicData]);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading topic content...</div>;
  }

  if (!topicData) {
    return <div className={styles.errorContainer}>Topic not found</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{topicData.topic} | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.header}>
        <Link href={`/unit/${encodeURIComponent(course)}/${encodeURIComponent(unit)}`}>
          <span className={styles.backButton}>← Back</span>
        </Link>
        <h1 className={styles.topicTitle}>{topicData.topic}</h1>
      </header>

      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'keyConcepts' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('keyConcepts')}
        >
          Key Concepts
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'details' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'examples' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          Examples
        </button>
      </div>

      <main className={styles.main}>
        {activeTab === 'overview' && (
          <div className={styles.contentSection}>
            <p>{topicData.refresherNotes?.overview}</p>
            {topicData.examTips && (
              <div className={styles.examTips}>
                <h3>Exam Tips</h3>
                <p>{topicData.examTips}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'keyConcepts' && (
          <div className={styles.contentSection}>
            <h3>Key Concepts</h3>
            {topicData.refresherNotes?.keyConcepts && (
              <ul className={styles.conceptsList}>
                {Object.entries(topicData.refresherNotes.keyConcepts).map(([key, value], index) => (
                  <li key={index} className={styles.conceptItem}>
                    <h4>{key}</h4>
                    <p>{value}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className={styles.contentSection}>
            <h3>Detailed Explanation</h3>
            <p>{topicData.refresherNotes?.detailedExplanation}</p>
            
            {topicData.diagrams && topicData.diagrams.length > 0 && (
              <div className={styles.diagramsSection}>
                <h3>Diagrams</h3>
                {topicData.diagrams.map((diagram, index) => (
                  <div key={index} className={styles.diagram}>
                    <p>{diagram.description}</p>
                    {diagram.imageUrl && (
                      <img 
                        src={diagram.imageUrl} 
                        alt={diagram.description}
                        className={styles.diagramImage}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'examples' && (
          <div className={styles.contentSection}>
            <h3>Examples</h3>
            <p>{topicData.refresherNotes?.examples}</p>
          </div>
        )}
      </main>

      <TopicActionButtons 
        topicData={{
          course: course,
          unit: unit,
          topic: topicData.title
        }} 
        quizProgress={quizProgress}
      />

      <FollowUpQuestions topicData={topicData} />
      <ESLCEAITools topicData={topicData} />
      <ESLCEPrepButton topicData={topicData} />

      <button 
        className={styles.chatButton}
        onClick={toggleChat}
      >
        {showChat ? 'Close Chat' : 'Ask AI Tutor'}
      </button>

      {showChat && (
        <ChatInterface 
          topicData={topicData}
          onClose={toggleChat}
        />
      )}

      <BottomNavigation />
    </div>
  );
} 