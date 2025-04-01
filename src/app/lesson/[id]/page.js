'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LessonExplorer() {
    const router = useRouter();

    const lessons = [
        { id: 1, title: 'Intro to Spanish', subtext: '5 vocab • 1 quiz' },
        { id: 2, title: 'Grammar Basics', subtext: '4 grammar rules' },
        { id: 3, title: 'Common Phrases', subtext: '10 phrases' },
        { id: 4, title: 'Culture & Travel', subtext: '3 topics' },
    ];

    const goToLessonPage = (id) => {
        router.push(`/lesson/${id}`);
    };

    return (
        <div className={styles.lessonPageContainer}>
            <h2 className={styles.title}>Intro to Spanish</h2>
            <hr className={styles.divider} />

            <div className={styles.buttonContainer}>
                <button className={styles.lessonButton} onClick={() => router.push('/lesson/1/vocab')}>
                    Learn Vocabulary
                </button>
                <button className={styles.lessonButton} onClick={() => router.push('/lesson/1/grammar')}>
                    Grammar Practice
                </button>
                <button className={styles.lessonButton} onClick={() => router.push('/lesson/1/quiz')}>
                    Take a Quiz
                </button>
            </div>
        </div>
    );
}
