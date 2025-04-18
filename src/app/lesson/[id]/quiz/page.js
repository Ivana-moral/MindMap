'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useAuth } from '@/app/util/auth/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import QuizStatus from '@/app/util/QuizStatus';

export default function QuizPage() {
    const { id } = useParams();
    const { user, loading } = useAuth();
    const router = useRouter();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        if(loading) {
            return;
        }

        if(!user) {
            router.replace('/login');
            return;
        }

        async function fetchQuestions() {
            try {
                const jwt = await user.getIdToken();
                const res = await fetch(`http://127.0.0.1:8000/api/quiz/lessons/${id}/quiz?quiz_size=20`, {
                    method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${jwt}`
					}
                });

                if(!res.ok) {
                    throw new Error(`HTTP Error! Status Code ${res.status}`);
                }

                const data = await res.json();
                console.log(data);

                setProgress(data.progress);
                setQuestions(data.questions);
            } catch (err) {
                console.error(`Failed to fetch vocabulary: `, err);
            } finally {
                setFetching(false);
            }
        }

        fetchQuestions();
    }, [user, loading, router, id]);

    if (loading || fetching) return <div className={styles.loading}>Loading...</div>;
    if (questions.length === 0) return <div>No questions found for this lesson.</div>;
    if (currentIndex >= questions.length) return <div className={styles.complete}>🎉 Quiz complete!</div>;

    const current = questions[currentIndex];

    const normalizeAndStrip = (str) => {
        return str
            .replace(/\((el|la|los|las|un|una|unos|unas)\)/gi, '$1')
            .normalize('NFD')                                     // decompose accents
            .replace(/[\u0300-\u036f]/g, '')                      // remove accents
            .toLowerCase()                                        // lowercase everything
            .replace(/\s+/g, ' ')                                 // collapse spaces
            .trim();                                              // remove outer spaces
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userNormalized = normalizeAndStrip(userAnswer);
        const answerNormalized = normalizeAndStrip(current.answer);
        console.log("User Normalized: ", userNormalized);
        console.log("Answer Normalized: ", answerNormalized);

        const isAcceptable = userNormalized === answerNormalized;

        setIsCorrect(isAcceptable);
        setShowFeedback(true);

        const difficulty_rating = isAcceptable ? "GOOD" : "AGAIN";
        const jwt = await user.getIdToken();
        
        try {
            const res = await fetch('http://127.0.0.1:8000/api/quiz/submit-answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({
                    material_id: questions[currentIndex].material_id,
                    lesson_id: questions[currentIndex].lesson_id,
                    was_correct: isAcceptable,
                    difficulty_rating: difficulty_rating
                })
            });

            if (!res.ok) {
                throw new Error('Failed to submit answer');
            }
        } catch (err) {
            console.error('Error submitting answer:', err);
        }

        setTimeout(() => {
            setUserAnswer('');
            setShowFeedback(false);
            setCurrentIndex((prev) => prev + 1);
        }, 1000);
    };

    return (
        <div className={styles.container}>
            <QuizStatus
            progress={progress}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            />

            <div className={styles.card}>
                <p className={styles.prompt}>{current.prompt}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={showFeedback}
                    className={styles.input}
                    autoFocus
                    placeholder="Type your answer..."
                />
                <button type="submit" disabled={showFeedback || !userAnswer.trim()} className={styles.button}>
                    Submit
                </button>
            </form>

            {showFeedback && (
                <div className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
                    {isCorrect ? '✅ Correct!' : `❌ Correct answer: ${current.answer}`}
                </div>
            )}
        </div>
    );
}
