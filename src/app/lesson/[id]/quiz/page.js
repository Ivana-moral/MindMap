'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

export default function QuizPage() {
    const { id } = useParams();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [showFinalScore, setShowFinalScore] = useState(false);

    // Example quiz data (Replace with API call later)
    const quizData = {
        1: [
            {
                question: "What does 'Hola' mean?",
                options: ["Goodbye", "Hello", "Thank you", "Please"],
                correctAnswer: "Hello",
            },
            {
                question: "How do you say 'Thank you' in Spanish?",
                options: ["Adiós", "Hola", "Gracias", "De nada"],
                correctAnswer: "Gracias",
            }
        ],
        2: [
            {
                question: "Which article is correct for 'perro' (dog)?",
                options: ["El", "La", "Un", "Una"],
                correctAnswer: "El",
            },
            {
                question: "Which word means 'House' in Spanish?",
                options: ["Gato", "Casa", "Perro", "Libro"],
                correctAnswer: "Casa",
            }
        ],
    };

    const questions = quizData[id] || [];

    // Handle answer selection
    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);

        // update score if correct
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 1);
        }

        // Move to next question after a short delay
        setTimeout(() => {
            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null); // Reset selection for next question
            } else {
                setShowFinalScore(true); // Show final score if last question
            }
        }, 1000);
    };

    return (
        <div className={styles.quizContainer}>
            <h1>Lesson {id} - Quiz</h1>

            {!showFinalScore ? (
                <>
                    <p className={styles.question}>{questions[currentQuestionIndex].question}</p>

                    {/* Display answer options */}
                    <div className={styles.optionsContainer}>
                        {questions[currentQuestionIndex].options.map((option, index) => (
                            <button
                                key={index}
                                className={`${styles.optionButton} 
                                    ${selectedAnswer ? 
                                        (option === questions[currentQuestionIndex].correctAnswer ? styles.correct : 
                                        (option === selectedAnswer ? styles.incorrect : '')) 
                                        : ''}`}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={selectedAnswer !== null} // Disable after selection
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.finalScoreContainer}>
                    <h2>Quiz Completed!</h2>
                    <p>Your Score: {score} / {questions.length}</p>
                    <button onClick={() => window.location.reload()} className={styles.retryButton}>
                        Retry Quiz
                    </button>
                </div>
            )}
        </div>
    );
}
