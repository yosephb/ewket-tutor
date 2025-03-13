import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import BottomNavigation from '../../../../../components/BottomNavigation';
import styles from '../../../../../styles/Quiz.module.css';

export default function KnowledgeCheckQuiz() {
  const router = useRouter();
  const { course, unit, topic } = router.query;
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!course || !unit || !topic) return;
    
    // In a real implementation, you would fetch questions from your API
    // For now, we'll use mock data
    const mockQuestions = [
      {
        question: "What is the primary function of mitochondria in a cell?",
        options: [
          "Protein synthesis",
          "Energy production",
          "Cell division",
          "Waste removal"
        ],
        correctAnswer: 1,
        explanation: "Mitochondria are often called the powerhouse of the cell because they generate most of the cell's supply of ATP, which is used as a source of chemical energy."
      },
      {
        question: "Which of the following is a characteristic of living organisms?",
        options: [
          "Inability to respond to stimuli",
          "Lack of cellular organization",
          "Ability to reproduce",
          "Absence of metabolism"
        ],
        correctAnswer: 2,
        explanation: "All living organisms have the ability to reproduce, which is essential for the continuation of their species."
      },
      {
        question: "What is the process by which plants make their own food?",
        options: [
          "Respiration",
          "Photosynthesis",
          "Digestion",
          "Excretion"
        ],
        correctAnswer: 1,
        explanation: "Photosynthesis is the process by which green plants use sunlight to synthesize foods from carbon dioxide and water."
      },
      {
        question: "Which of the following is NOT a component of the cell membrane?",
        options: [
          "Phospholipids",
          "Proteins",
          "Chlorophyll",
          "Cholesterol"
        ],
        correctAnswer: 2,
        explanation: "Chlorophyll is found in chloroplasts, not in the cell membrane. The cell membrane is composed primarily of phospholipids, proteins, and in animal cells, cholesterol."
      },
      {
        question: "What is the main function of DNA in a cell?",
        options: [
          "Energy storage",
          "Structural support",
          "Genetic information storage",
          "Waste elimination"
        ],
        correctAnswer: 2,
        explanation: "DNA (deoxyribonucleic acid) contains the genetic instructions used in the development and functioning of all known living organisms."
      }
    ];
    
    setQuestions(mockQuestions);
    setLoading(false);
  }, [course, unit, topic]);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    setShowExplanation(true);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setShowResult(false);
  };

  const formatTopicPath = () => {
    if (!course || !unit || !topic) return '';
    return `/topic/${encodeURIComponent(course)}/${encodeURIComponent(unit)}/${encodeURIComponent(topic)}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Knowledge Check | Student Portal</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        
        <header className={styles.header}>
          <Link href={formatTopicPath()}>
            <span className={styles.backButton}>← Back to Topic</span>
          </Link>
          <h1 className={styles.title}>Knowledge Check</h1>
        </header>
        
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Generating knowledge check questions...</p>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Knowledge Check | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.header}>
        <Link href={formatTopicPath()}>
          <span className={styles.backButton}>← Back to Topic</span>
        </Link>
        <h1 className={styles.title}>Knowledge Check: {decodeURIComponent(topic)}</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Home</Link> &gt; 
          <Link href={`/unit/${encodeURIComponent(course)}/${encodeURIComponent(unit)}`}>
            {decodeURIComponent(unit)}
          </Link> &gt; 
          <Link href={formatTopicPath()}>
            {decodeURIComponent(topic)}
          </Link> &gt; 
          <span>Knowledge Check</span>
        </div>
        
        {!showResult ? (
          <div className={styles.quizContainer}>
            <div className={styles.progress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            
            <div className={styles.questionCount}>
              Question {currentQuestion + 1} of {questions.length}
            </div>
            
            <div className={styles.questionCard}>
              <h2 className={styles.question}>{questions[currentQuestion].question}</h2>
              
              <div className={styles.options}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`${styles.option} 
                      ${selectedAnswer === index ? styles.selected : ''} 
                      ${showExplanation && index === questions[currentQuestion].correctAnswer ? styles.correct : ''}
                      ${showExplanation && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer ? styles.incorrect : ''}`}
                    onClick={() => !showExplanation && handleAnswerSelect(index)}
                    disabled={showExplanation}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {showExplanation && (
                <div className={styles.explanation}>
                  <h3>Explanation:</h3>
                  <p>{questions[currentQuestion].explanation}</p>
                </div>
              )}
              
              {!showExplanation ? (
                <button 
                  className={styles.checkButton}
                  onClick={handleCheckAnswer}
                  disabled={selectedAnswer === null}
                >
                  Check Answer
                </button>
              ) : (
                <button 
                  className={styles.nextButton}
                  onClick={handleNextQuestion}
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.resultCard}>
            <h2 className={styles.resultTitle}>Knowledge Check Results</h2>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreText}>{score}/{questions.length}</span>
            </div>
            <p className={styles.resultMessage}>
              {score === questions.length 
                ? 'Perfect! You have a solid understanding of this topic!' 
                : score >= questions.length / 2 
                  ? 'Good job! You understand the key concepts, but there\'s room for improvement.' 
                  : 'Keep studying! Review the topic material and try again.'}
            </p>
            <div className={styles.actionButtons}>
              <button 
                className={styles.restartButton}
                onClick={handleRestartQuiz}
              >
                Retry Quiz
              </button>
              <Link href={formatTopicPath()}>
                <button className={styles.homeButton}>
                  Back to Topic
                </button>
              </Link>
            </div>
            
            <div className={styles.nextSteps}>
              <h3>Next Steps</h3>
              <div className={styles.nextStepButtons}>
                <Link href={`/quiz/eslce-style/${encodeURIComponent(course)}/${encodeURIComponent(unit)}/${encodeURIComponent(topic)}`}>
                  <button className={styles.nextStepButton}>
                    Try ESLCE Practice Questions
                  </button>
                </Link>
                <Link href={formatTopicPath()}>
                  <button className={styles.nextStepButton}>
                    Review Topic Content
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
} 