import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import BottomNavigation from '../../../../../components/BottomNavigation';
import styles from '../../../../../styles/Quiz.module.css';

export default function ESLCEStyleQuiz() {
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
        question: "In a plant cell, which organelle contains chlorophyll and is responsible for photosynthesis?",
        options: [
          "Mitochondria",
          "Chloroplast",
          "Golgi apparatus",
          "Endoplasmic reticulum"
        ],
        correctAnswer: 1,
        explanation: "Chloroplasts are organelles found in plant cells and some protists that conduct photosynthesis. They contain the pigment chlorophyll, which captures light energy for photosynthesis.",
        eslceYear: "2018"
      },
      {
        question: "Which of the following statements about enzymes is NOT correct?",
        options: [
          "Enzymes are biological catalysts",
          "Enzymes are affected by temperature",
          "Enzymes are consumed in the reactions they catalyze",
          "Enzymes are specific to their substrates"
        ],
        correctAnswer: 2,
        explanation: "Enzymes are not consumed in the reactions they catalyze. They remain unchanged at the end of the reaction and can be reused multiple times.",
        eslceYear: "2019"
      },
      {
        question: "A student observed that a plant grew toward a light source placed on one side of the plant. This response is an example of:",
        options: [
          "Geotropism",
          "Hydrotropism",
          "Phototropism",
          "Thigmotropism"
        ],
        correctAnswer: 2,
        explanation: "Phototropism is the growth or movement of an organism in response to light. Plants typically exhibit positive phototropism, meaning they grow toward light sources.",
        eslceYear: "2020"
      },
      {
        question: "Which of the following best describes the process of osmosis?",
        options: [
          "The movement of water molecules from a region of higher concentration to a region of lower concentration through a selectively permeable membrane",
          "The movement of solute particles from a region of higher concentration to a region of lower concentration",
          "The movement of water molecules from a region of lower concentration to a region of higher concentration",
          "The active transport of molecules against their concentration gradient"
        ],
        correctAnswer: 0,
        explanation: "Osmosis is the movement of water molecules from a region of higher water potential (lower solute concentration) to a region of lower water potential (higher solute concentration) through a selectively permeable membrane.",
        eslceYear: "2021"
      },
      {
        question: "In humans, which of the following structures is NOT part of the respiratory system?",
        options: [
          "Trachea",
          "Bronchi",
          "Pancreas",
          "Alveoli"
        ],
        correctAnswer: 2,
        explanation: "The pancreas is part of the digestive system and the endocrine system, not the respiratory system. It produces digestive enzymes and hormones like insulin and glucagon.",
        eslceYear: "2022"
      },
      {
        question: "Which of the following is a correct statement about DNA replication?",
        options: [
          "It occurs during prophase of mitosis",
          "It results in two identical DNA molecules",
          "It requires the enzyme lipase",
          "It is a conservative process"
        ],
        correctAnswer: 1,
        explanation: "DNA replication results in two identical DNA molecules, each containing one strand from the original DNA and one newly synthesized strand. This is known as semiconservative replication.",
        eslceYear: "2017"
      },
      {
        question: "A food web represents:",
        options: [
          "The flow of energy in one direction only",
          "A single food chain in an ecosystem",
          "Multiple interconnected food chains in an ecosystem",
          "The relationship between producers only"
        ],
        correctAnswer: 2,
        explanation: "A food web represents multiple interconnected food chains in an ecosystem, showing the complex feeding relationships between different organisms.",
        eslceYear: "2019"
      },
      {
        question: "Which of the following is NOT a function of the liver?",
        options: [
          "Production of bile",
          "Storage of glycogen",
          "Detoxification of harmful substances",
          "Production of insulin"
        ],
        correctAnswer: 3,
        explanation: "The liver does not produce insulin. Insulin is produced by the beta cells of the pancreas. The liver is responsible for bile production, glycogen storage, and detoxification among other functions.",
        eslceYear: "2020"
      },
      {
        question: "The process by which mature red blood cells are removed from circulation is called:",
        options: [
          "Hemolysis",
          "Phagocytosis",
          "Diapedesis",
          "Erythropoiesis"
        ],
        correctAnswer: 0,
        explanation: "Hemolysis is the process by which red blood cells are broken down at the end of their life cycle (about 120 days). The components are then recycled or eliminated from the body.",
        eslceYear: "2021"
      },
      {
        question: "Which of the following is a correct statement about natural selection?",
        options: [
          "It leads to the development of characteristics that an organism needs",
          "It causes mutations to occur in response to environmental changes",
          "It results in the survival and reproduction of individuals with favorable traits",
          "It ensures that all members of a species adapt to environmental changes"
        ],
        correctAnswer: 2,
        explanation: "Natural selection results in the survival and reproduction of individuals with traits that are favorable in their environment. It does not cause mutations or ensure that all members adapt.",
        eslceYear: "2022"
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
          <title>ESLCE Practice | Student Portal</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        
        <header className={styles.header}>
          <Link href={formatTopicPath()}>
            <span className={styles.backButton}>← Back to Topic</span>
          </Link>
          <h1 className={styles.title}>ESLCE Practice</h1>
        </header>
        
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Generating ESLCE-style practice questions...</p>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>ESLCE Practice | Student Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className={styles.header}>
        <Link href={formatTopicPath()}>
          <span className={styles.backButton}>← Back to Topic</span>
        </Link>
        <h1 className={styles.title}>ESLCE Practice: {decodeURIComponent(topic)}</h1>
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
          <span>ESLCE Practice</span>
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
              {questions[currentQuestion].eslceYear && (
                <div className={styles.eslceYear}>
                  Similar to ESLCE {questions[currentQuestion].eslceYear} question
                </div>
              )}
              
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
            <h2 className={styles.resultTitle}>ESLCE Practice Results</h2>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreText}>{score}/{questions.length}</span>
            </div>
            <p className={styles.resultMessage}>
              {score === questions.length 
                ? 'Excellent! You\'re well prepared for the ESLCE exam on this topic!' 
                : score >= questions.length * 0.7 
                  ? 'Good job! You have a strong understanding of ESLCE-level content.' 
                  : score >= questions.length * 0.5
                    ? 'You\'re on the right track. Keep practicing to improve your ESLCE readiness.'
                    : 'This topic needs more review. Focus on understanding the core concepts.'}
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
            
            <div className={styles.eslceAnalysis}>
              <h3>ESLCE Exam Analysis</h3>
              <p>This topic typically accounts for approximately 5-8% of questions on the ESLCE Biology exam. Focus on understanding the core concepts and their applications.</p>
              <div className={styles.nextStepButtons}>
                <Link href="/eslce-simulator">
                  <button className={styles.nextStepButton}>
                    Try Full ESLCE Simulator
                  </button>
                </Link>
                <button className={styles.nextStepButton}>
                  Generate More Practice Questions
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
} 