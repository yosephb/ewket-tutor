import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../../../styles/Quiz.module.css';

export default function KnowledgeCheck() {
  const router = useRouter();
  const { course, unit } = router.query;
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    if (!course || !unit) return;

    // In a real app, you would fetch quiz data based on course and unit
    // For now, we'll use placeholder data
    const placeholderQuiz = {
      title: `Knowledge Check: ${decodeURIComponent(unit)}`,
      course: decodeURIComponent(course),
      questions: [
        {
          id: 1,
          text: "What is the primary function of mitochondria in a cell?",
          options: [
            "Protein synthesis",
            "Energy production",
            "Cell division",
            "Waste removal"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          text: "Which of the following is NOT a part of the cell theory?",
          options: [
            "All living things are composed of cells",
            "Cells are the basic unit of structure and function in living things",
            "All cells arise from pre-existing cells",
            "Cells can transform into different types of organisms"
          ],
          correctAnswer: 3
        }
      ]
    };

    setQuizData(placeholderQuiz);
    setLoading(false);
  }, [course, unit]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading quiz...</div>;
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
          Test your knowledge of key concepts from this unit. Select the best answer for each question.
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