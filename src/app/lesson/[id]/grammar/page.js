'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/app/util/auth/AuthContext';
import { useEffect, useState } from 'react';
import Flashcard from '@/app/util/Flashcard';
import styles from './page.module.css';

export default function GrammarPage() {
    const { id } = useParams();
    const { user, loading } = useAuth();
    const [grammarItems, setGrammarItems] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (loading || !user) return;

        const fetchGrammar = async () => {
            try {
                const jwt = await user.getIdToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}/grammar`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    }
                });

                if (!res.ok) throw new Error(`HTTP Error! Status Code ${res.status}`);
                const data = await res.json();
                setGrammarItems(data);
            } catch (err) {
                console.error('Failed to fetch grammar:', err);
            } finally {
                setFetching(false);
            }
        };

        fetchGrammar();
    }, [user, loading, id]);

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < grammarItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const parsePrompt = (answer) => {
        const match = answer.match(/\((.*?)\)/);
        if (match) {
            return answer.replace(match[0], '___').trim();
        }
        return answer;
    };

    const getAnswer = (answer) => {
        const match = answer.match(/\((.*?)\)/);
        return match ? match[1] : answer;
    };

    if (loading || fetching) return <div className={styles.container}><p>Loading...</p></div>;

    if (grammarItems.length === 0) return (
        <div className={styles.container}>
            <h2 className={styles.title}>Lesson {id} - Grammar</h2>
            <p>No grammar content found for this lesson.</p>
        </div>
    );

    const currentItem = grammarItems[currentIndex];

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Lesson {id} - Grammar</h2>
            <div className={styles.flashcardContainer}>
                <Flashcard
                    word={parsePrompt(currentItem.grammar_structure_answer)}
                    definition={getAnswer(currentItem.grammar_structure_answer)}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(prev => !prev)}
                />
                <div className={styles.navButtons}>
                    <button onClick={handlePrev} className={styles.navBtn}>Prev</button>
                    <span className={styles.counter}>{currentIndex + 1} / {grammarItems.length}</span>
                    <button onClick={handleNext} className={styles.navBtn}>Next</button>
                </div>
            </div>
        </div>
    );
}
