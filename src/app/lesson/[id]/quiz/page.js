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

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
            } else {
                setShowFinalScore(true);
            }
        }, 1000);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Lesson {id} - Quiz</h2>
            <hr className={styles.divider} />

            {!showFinalScore ? (
                <div className={styles.quizCard}>
                    <p className={styles.question}>{questions[currentQuestionIndex].question}</p>

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
                                disabled={selectedAnswer !== null}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={styles.quizCard}>
                    <h3 className={styles.resultTitle}>Quiz Completed!</h3>
                    <p className={styles.resultScore}>Your Score: {score} / {questions.length}</p>
                    <button onClick={() => window.location.reload()} className={styles.retryButton}>
                        Retry Quiz
                    </button>
                </div>
            )}
        </div>
    );
}
