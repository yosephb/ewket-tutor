import { useState } from 'react';
import styles from '../styles/ESLCEAITools.module.css';

export default function ESLCEAITools({ topicData, onInteract }) {
  const [activeTab, setActiveTab] = useState('practice');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (!content || content.type !== tab) {
      generateContent(tab);
    }
  };

  const generateContent = async (type) => {
    setLoading(true);
    
    try {
      // In a real implementation, call your AI backend
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let mockContent;
      switch(type) {
        case 'practice':
          mockContent = {
            type: 'practice',
            questions: [
              {
                question: "Which of the following best describes the process of photosynthesis?",
                options: [
                  "The breakdown of glucose to release energy",
                  "The conversion of light energy to chemical energy",
                  "The process of cellular division",
                  "The movement of water through a plant"
                ],
                answer: 1,
                explanation: "Photosynthesis is the process by which green plants convert light energy from the sun into chemical energy stored in glucose molecules."
              },
              {
                question: "In the ESLCE exam, which concept related to this topic is most frequently tested?",
                options: [
                  "The chemical equation for photosynthesis",
                  "The structure of chloroplasts",
                  "The factors affecting the rate of photosynthesis",
                  "The differences between C3 and C4 plants"
                ],
                answer: 2,
                explanation: "The factors affecting photosynthesis rate (light intensity, CO2 concentration, temperature) are commonly tested in ESLCE exams."
              }
            ]
          };
          break;
        case 'keypoints':
          mockContent = {
            type: 'keypoints',
            points: [
              "Photosynthesis occurs in chloroplasts, specifically in the thylakoid membranes",
              "The overall equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
              "The process has two main stages: light-dependent reactions and light-independent reactions (Calvin cycle)",
              "ESLCE exams frequently test the factors affecting photosynthesis rate",
              "Understanding the relationship between photosynthesis and cellular respiration is critical for the exam"
            ]
          };
          break;
        case 'examples':
          mockContent = {
            type: 'examples',
            examples: [
              {
                scenario: "A student placed a potted plant in a dark room for 48 hours. Then they covered half of one leaf with black paper and placed the plant in sunlight for several hours. After removing the leaf and testing it with iodine solution, what would they observe?",
                explanation: "The part of the leaf exposed to sunlight would turn blue-black with iodine (indicating presence of starch), while the covered portion would remain brown (no starch). This demonstrates that light is necessary for photosynthesis and starch production."
              },
              {
                scenario: "In an ESLCE exam question, students are shown a graph of photosynthesis rate versus light intensity. The graph shows the rate increasing linearly at first, then leveling off at higher light intensities. What explanation would earn full marks?",
                explanation: "At low light intensities, light is the limiting factor, so increasing light increases the rate proportionally. At higher intensities, another factor (like CO₂ concentration or temperature) becomes limiting, so the rate cannot increase further regardless of additional light."
              }
            ]
          };
          break;
        case 'pastexams':
          mockContent = {
            type: 'pastexams',
            questions: [
              {
                year: "2019 ESLCE",
                question: "Which of the following is NOT a factor that affects the rate of photosynthesis?",
                options: [
                  "Light intensity",
                  "Carbon dioxide concentration",
                  "Oxygen concentration",
                  "Temperature"
                ],
                answer: 2,
                explanation: "Oxygen is a product of photosynthesis and does not directly limit its rate. The other options are all limiting factors."
              },
              {
                year: "2020 ESLCE",
                question: "A student observed that the rate of photosynthesis in an aquatic plant increased when they moved the light source closer to the plant. This observation best demonstrates which principle?",
                options: [
                  "Temperature affects enzyme activity",
                  "Light intensity affects photosynthesis rate",
                  "Carbon dioxide is required for photosynthesis",
                  "Water is a reactant in photosynthesis"
                ],
                answer: 1,
                explanation: "Moving the light source closer increases the light intensity reaching the plant, demonstrating that light intensity affects the rate of photosynthesis."
              }
            ]
          };
          break;
      }
      
      setContent(mockContent);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'practice' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('practice')}
        >
          ESLCE Practice
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'keypoints' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('keypoints')}
        >
          Key Points
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'examples' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('examples')}
        >
          Examples
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'pastexams' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('pastexams')}
        >
          Past Exams
        </button>
      </div>
      
      <div className={styles.contentContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Generating ESLCE-focused content...</p>
          </div>
        ) : content ? (
          <div className={styles.content}>
            {content.type === 'practice' && (
              <div className={styles.practiceQuestions}>
                <h3>ESLCE Practice Questions</h3>
                {content.questions.map((q, i) => (
                  <div key={i} className={styles.questionCard}>
                    <p className={styles.question}>{q.question}</p>
                    <div className={styles.options}>
                      {q.options.map((option, j) => (
                        <div key={j} className={styles.option}>
                          <input 
                            type="radio" 
                            id={`q${i}o${j}`} 
                            name={`question${i}`} 
                          />
                          <label htmlFor={`q${i}o${j}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                    <button className={styles.checkButton}>Check Answer</button>
                  </div>
                ))}
                <button className={styles.moreButton}>Generate More Questions</button>
              </div>
            )}
            
            {content.type === 'keypoints' && (
              <div className={styles.keyPoints}>
                <h3>Key Points for ESLCE</h3>
                <ul className={styles.pointsList}>
                  {content.points.map((point, i) => (
                    <li key={i} className={styles.point}>{point}</li>
                  ))}
                </ul>
                <div className={styles.actionButtons}>
                  <button className={styles.actionButton}>Explain Further</button>
                  <button className={styles.actionButton}>Quiz Me On These</button>
                </div>
              </div>
            )}
            
            {content.type === 'examples' && (
              <div className={styles.examples}>
                <h3>Example Scenarios</h3>
                {content.examples.map((example, i) => (
                  <div key={i} className={styles.exampleCard}>
                    <p className={styles.scenario}><strong>Scenario:</strong> {example.scenario}</p>
                    <p className={styles.explanation}><strong>Explanation:</strong> {example.explanation}</p>
                  </div>
                ))}
                <button className={styles.moreButton}>Show More Examples</button>
              </div>
            )}
            
            {content.type === 'pastexams' && (
              <div className={styles.pastExams}>
                <h3>Past ESLCE Questions</h3>
                {content.questions.map((q, i) => (
                  <div key={i} className={styles.examQuestion}>
                    <p className={styles.examYear}>{q.year}</p>
                    <p className={styles.question}>{q.question}</p>
                    <div className={styles.options}>
                      {q.options.map((option, j) => (
                        <div key={j} className={styles.option}>
                          <input 
                            type="radio" 
                            id={`eq${i}o${j}`} 
                            name={`examQuestion${i}`} 
                          />
                          <label htmlFor={`eq${i}o${j}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                    <button className={styles.checkButton}>Check Answer</button>
                  </div>
                ))}
                <button className={styles.moreButton}>More Past Questions</button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Select an option above to generate ESLCE-focused content</p>
          </div>
        )}
      </div>
    </div>
  );
} 