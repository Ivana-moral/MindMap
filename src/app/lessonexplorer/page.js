'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import Next.js router
import styles from './page.module.css';

export default function LessonExplorer() {
    const router = useRouter(); // Initialize router

    // Example lesson data
    const [lessons, setLessons] = useState([
        { id: 1, title: 'LESSON 1 - Intro to Spanish', overview: 'Lesson overview', expanded: false },
        { id: 2, title: 'LESSON 2 - (lesson name)', overview: 'Overview of lesson 2', expanded: false },
        { id: 3, title: 'LESSON 3 - (lesson name)', overview: 'Overview of lesson 3', expanded: false },
        { id: 4, title: 'LESSON 4 - (lesson name)', overview: 'Overview of lesson 4', expanded: false },
    ]);

    // Navigate to the lesson page when clicked
    const goToLessonPage = (id) => {
        router.push(`/lesson/${id}`);
    };

    // Navigate to the Account Page when profile icon is clicked
    const goToAccountPage = () => {
        router.push('account');
    };

    return (
        <div className={styles.lessonContainer}>
            <div className={styles.lessonWrapper}>
                {/* Header */}
                <div className={styles.header}>
                    <h2>Lesson Explorer</h2>
                    <div className={styles.profileIcon} onClick={goToAccountPage}>👤</div> {/* Clickable Profile Icon */}
                </div>

                {/* Main Content */}
                <div className={styles.container}>

                    {/* Lessons Section */}
                    <section className={styles.lessons}>
                        {lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className={`${styles.lessonCard} ${lesson.expanded ? styles.expanded : ''}`}
                                onClick={() => goToLessonPage(lesson.id)} // Navigate when clicked
                            >
                                <div className={styles.lessonHeader}>
                                    <span className={styles.toggleArrow}>{lesson.expanded ? '▼' : '▲'}</span>
                                    <h3>{lesson.title}</h3>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}
