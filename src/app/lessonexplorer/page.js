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
        <div className={styles.container}>
            <h2 className={styles.title}>Lesson Explorer</h2>
            <hr className={styles.divider} />

            <div className={styles.lessonList}>
                {lessons.map((lesson, index) => (
                    <div
                        key={lesson.id}
                        className={styles.lessonCard}
                        onClick={() => goToLessonPage(lesson.id)}
                    >
                        <span className={styles.lessonNumber}>{index + 1}</span>
                        <div>
                            <span className={styles.lessonTitle}>{lesson.title}</span>
                            <div className={styles.lessonSubtext}>{lesson.subtext}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
