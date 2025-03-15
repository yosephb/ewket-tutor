import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../../../styles/Quiz.module.css';

export default function ESLCEStyleQuiz() {
  const router = useRouter();
  const { course, unit } = router.query;
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    if (!course || !unit) return;

    // In a real app, you would fetch quiz data based on course and unit
    // For now, we'll use placeholder data
    const placeholderQuiz = {
      title: `ESLCE Practice: ${decodeURIComponent(unit)}`,
      course: decodeURIComponent(course),
      questions: [
        {
          id: 1,
          text: "A student observed a cell under a microscope and noticed small, rod-shaped structures that appeared to be producing energy for the cell. These structures are most likely:",
          options: [
            "Ribosomes",
            "Mitochondria",
            "Golgi apparatus",
            "Lysosomes"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          text: "Which of the following best describes the process of osmosis?",
          options: [
            "The movement of water molecules from a region of higher concentration to a region of lower concentration through a selectively permeable membrane",
            "The movement of solute particles from a region of higher concentration to a region of lower concentration",
            "The transport of molecules across a cell membrane using energy",
            "The breakdown of glucose to produce ATP"
          ],
          correctAnswer: 0
        }
      ]
    };

    setQuizData(placeholderQuiz);
    setLoading(false);
  }, [course, unit]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading ESLCE practice questions...</div>;
  }

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <Link href={`/?course=${encodeURIComponent(course)}`}>
          <button className={styles.backButton}>← Back</button>
        </Link>
        <h1 className={styles.quizTitle}>{quizData.title}</h1>
        <p className={styles.quizSubtitle}>{quizData.course}</p>
      </div>

      <div className={styles.quizContent}>
        <p className={styles.quizInstructions}>
          Practice with ESLCE-style questions for this unit. These questions are formatted similar to what you'll see on the actual exam.
        </p>

        {quizData.questions.map((question, index) => (
          <div key={question.id} className={styles.questionCard}>
            <h3 className={styles.questionText}>{index + 1}. {question.text}</h3>
            <div className={styles.optionsContainer}>
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className={styles.optionLabel}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={optionIndex}
                    className={styles.optionInput}
                  />
                  <span className={styles.optionText}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.quizActions}>
          <button className={styles.submitButton}>Submit Answers</button>
        </div>
      </div>
    </div>
  );
} 