import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import BottomNavigation from '../components/BottomNavigation';
import styles from '../styles/ESLCESimulator.module.css';

export default function ESLCESimulator() {
  const [examMode, setExamMode] = useState('practice'); // 'practice' or 'timed'
  const [subject, setSubject] = useState('biology');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 hours in minutes
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  useEffect(() => {
    // Load mock questions
    const mockQuestions = Array(50).fill().map((_, i) => ({
      id: i + 1,
      question: `This is a sample ESLCE ${subject} question ${i + 1}. What is the correct answer?`,
      options: [
        `Option A for question ${i + 1}`,
        `Option B for question ${i + 1}`,
        `Option C for question ${i + 1}`,
        `Option D for question ${i + 1}`
      ],
      correctAnswer: Math.floor(Math.random() * 4)
    }));
    
    setQuestions(mockQuestions);
  }, [subject]);

  useEffect(() => {
    let timer;
    if (examStarted && examMode === 'timed' && timeRemaining > 0 && !examFinished) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setExamFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    }
    
    return () => clearInterval(timer);
  }, [examStarted, examMode, timeRemaining, examFinished]);

  const startExam = () => {
    setExamStarted(true);
    setAnswers({});
    setCurrentQuestion(0);
    setExamFinished(false);
    if (examMode === 'timed') {
      setTimeRemaining(180); // Reset to 3 hours
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const finishExam = () => {
    setExamFinished(true);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
  };

  const calculateScore = () => {
    let correct = 0;
    Object.entries(answers).forEach(([questionId, answerIndex]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question && question.correctAnswer === answerIndex) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ESLCE Exam Simulator | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.header}>
        <Link href="/">
          <span className={styles.backButton}>← Home</span>
        </Link>
        <h1 className={styles.title}>ESLCE Exam Simulator</h1>
      </header>

      <main className={styles.main}>
        {!examStarted ? (
          <div className={styles.setupCard}>
            <h2>Prepare for your ESLCE Exam</h2>
            <div className={styles.setupOptions}>
              <div className={styles.optionGroup}>
                <label>Exam Mode:</label>
                <div className={styles.radioGroup}>
                  <label>
                    <input 
                      type="radio" 
                      name="examMode" 
                      value="practice" 
                      checked={examMode === 'practice'}
                      onChange={() => setExamMode('practice')}
                    />
                    Practice Mode (No time limit)
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="examMode" 
                      value="timed" 
                      checked={examMode === 'timed'}
                      onChange={() => setExamMode('timed')}
                    />
                    Timed Exam (3 hours)
                  </label>
                </div>
              </div>
              
              <div className={styles.optionGroup}>
                <label>Subject:</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={styles.subjectSelect}
                >
                  <option value="biology">Biology</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="physics">Physics</option>
                  <option value="mathematics">Mathematics</option>
                </select>
              </div>
            </div>
            
            <button 
              className={styles.startButton}
              onClick={startExam}
            >
              Start ESLCE {examMode === 'timed' ? 'Timed' : 'Practice'} Exam
            </button>
            
            <p className={styles.examInfo}>
              This simulator generates AI-powered questions in the style of real ESLCE exams.
              {examMode === 'timed' ? ' You will have 3 hours to complete the exam.' : ' Take your time to practice and learn.'}
            </p>
          </div>
        ) : examFinished ? (
          <div className={styles.resultsCard}>
            <h2>Exam Results</h2>
            
            <div className={styles.scoreCircle}>
              <div className={styles.score}>
                <span className={styles.scoreNumber}>{calculateScore()}</span>
                <span className={styles.scoreTotal}>/ {questions.length}</span>
              </div>
              <div className={styles.scorePercent}>
                {Math.round((calculateScore() / questions.length) * 100)}%
              </div>
            </div>
            
            <div className={styles.resultsSummary}>
              <p>
                You answered {calculateScore()} out of {questions.length} questions correctly.
                {calculateScore() >= questions.length * 0.8 
                  ? ' Excellent work! You\'re well prepared for the ESLCE exam.' 
                  : calculateScore() >= questions.length * 0.6
                    ? ' Good job! With a bit more practice, you\'ll be ready for the exam.'
                    : ' Keep studying and practicing. Focus on the topics you missed.'}
              </p>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.reviewButton}
                onClick={() => {
                  setExamFinished(false);
                  setCurrentQuestion(0);
                }}
              >
                Review Answers
              </button>
              <button 
                className={styles.newExamButton}
                onClick={() => {
                  setExamStarted(false);
                }}
              >
                Start New Exam
              </button>
            </div>
            
            <div className={styles.aiAnalysis}>
              <h3>AI Analysis of Your Performance</h3>
              <div className={styles.analysisContent}>
                <p><strong>Strengths:</strong> You performed well on questions related to cell biology and genetics.</p>
                <p><strong>Areas to Improve:</strong> Focus more on ecology and plant physiology.</p>
                <p><strong>Study Recommendation:</strong> Review Chapter 4 on photosynthesis and Chapter 7 on ecosystems.</p>
              </div>
              <button className={styles.generateButton}>
                Generate Personalized Study Plan
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.examContainer}>
            {examMode === 'timed' && (
              <div className={styles.timerBar}>
                <div className={styles.timer}>
                  Time Remaining: {formatTime(timeRemaining)}
                </div>
                <button 
                  className={styles.finishButton}
                  onClick={finishExam}
                >
                  Finish Exam
                </button>
              </div>
            )}
            
            <div className={styles.questionNavigation}>
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.navButton} ${currentQuestion === index ? styles.currentNav : ''} ${answers[index+1] !== undefined ? styles.answeredNav : ''}`}
                  onClick={() => navigateToQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>Question {currentQuestion + 1} of {questions.length}</span>
              </div>
              
              <p className={styles.questionText}>{questions[currentQuestion]?.question}</p>
              
              <div className={styles.options}>
                {questions[currentQuestion]?.options.map((option, index) => (
                  <label 
                    key={index}
                    className={`${styles.option} ${answers[questions[currentQuestion]?.id] === index ? styles.selectedOption : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question${questions[currentQuestion]?.id}`}
                      checked={answers[questions[currentQuestion]?.id] === index}
                      onChange={() => handleAnswerSelect(questions[currentQuestion]?.id, index)}
                    />
                    <span className={styles.optionText}>{option}</span>
                  </label>
                ))}
              </div>
              
              <div className={styles.navigationButtons}>
                <button
                  className={styles.navButton}
                  disabled={currentQuestion === 0}
                  onClick={() => navigateToQuestion(currentQuestion - 1)}
                >
                  Previous
                </button>
                
                {examMode === 'practice' && (
                  <button
                    className={styles.explainButton}
                  >
                    Explain This Question
                  </button>
                )}
                
                {currentQuestion < questions.length - 1 ? (
                  <button
                    className={styles.navButton}
                    onClick={() => navigateToQuestion(currentQuestion + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className={styles.finishButton}
                    onClick={finishExam}
                  >
                    Finish Exam
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}