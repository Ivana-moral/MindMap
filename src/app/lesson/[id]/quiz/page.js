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

    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const handleSubmit = (e) => {
        e.preventDefault();

        const userNormalized = normalize(userAnswer);
        const answerNormalized = normalize(current.answer);
        const isAcceptable = userNormalized === answerNormalized;

        setIsCorrect(isAcceptable);
        setShowFeedback(true);

        if(currentIndex < 20) {
            setTimeout(() => {
                setUserAnswer('');
                setShowFeedback(false);
                setCurrentIndex((prev) => prev + 1);
            }, 1000);
        } else {
            //TODO: POST RESULTS TO BACK-END
        }
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
