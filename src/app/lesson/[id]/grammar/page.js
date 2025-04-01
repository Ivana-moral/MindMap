'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

export default function GrammarPage() {
    const { id } = useParams();
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const grammarData = {
        1: {
            topic: 'Present Tense Verbs',
            explanation: 'In Spanish, regular verbs in the present tense end in -ar, -er, or -ir. Example: "hablar" (to speak) becomes "hablo" (I speak).',
            exampleSentence: 'Yo hablo español.',
            quizQuestion: 'What is the correct present tense form of "comer" (to eat) for "yo" (I)?',
            options: ['Como', 'Comes', 'Come', 'Comemos'],
            correctAnswer: 'Como',
        },
        2: {
            topic: 'Definite and Indefinite Articles',
            explanation: 'In Spanish, "el" and "la" are definite articles (the), while "un" and "una" are indefinite articles (a/an).',
            exampleSentence: 'El gato es negro. (The cat is black.)',
            quizQuestion: 'Which article is correct for "libro" (book)?',
            options: ['El', 'La', 'Un', 'Una'],
            correctAnswer: 'El',
        },
    };

    const grammarLesson = grammarData[id] || {
        topic: 'No Grammar Lesson Found',
        explanation: 'No content available.',
        exampleSentence: '',
        quizQuestion: '',
        options: [],
        correctAnswer: '',
    };

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
        setShowResult(true);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Lesson {id} - {grammarLesson.topic}</h2>
            <hr className={styles.divider} />

            <div className={styles.explanationBox}>
                <p><strong>Explanation:</strong> {grammarLesson.explanation}</p>
                <p><strong>Example:</strong> {grammarLesson.exampleSentence}</p>
            </div>

            <div className={styles.quizCard}>
                <p className={styles.quizPrompt}><strong>Quiz:</strong> {grammarLesson.quizQuestion}</p>
                <div className={styles.optionsContainer}>
                    {grammarLesson.options.map((option, index) => (
                        <button 
                            key={index} 
                            className={`${styles.optionButton} ${showResult && option === grammarLesson.correctAnswer ? styles.correct : ''} ${showResult && option !== grammarLesson.correctAnswer && option === selectedAnswer ? styles.incorrect : ''}`}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={showResult}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {showResult && (
                    <p className={selectedAnswer === grammarLesson.correctAnswer ? styles.correctText : styles.incorrectText}>
                        {selectedAnswer === grammarLesson.correctAnswer 
                            ? 'Correct!' 
                            : `Incorrect! The correct answer is: ${grammarLesson.correctAnswer}`}
                    </p>
                )}
            </div>
        </div>
    );
}
