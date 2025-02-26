'use client';

import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LessonPage() {
    const { id } = useParams(); // Get lesson ID from URL
    const router = useRouter(); // Router for navigation

    // Example lesson data (Replace with API call later)
    const lessonData = {
        1: { title: 'Intro to Spanish', content: 'This is the introduction to Spanish.' },
        2: { title: 'Lesson 2 - Topic Name', content: 'Lesson 2 content goes here.' },
        3: { title: 'Lesson 3 - Topic Name', content: 'Lesson 3 content goes here.' },
        4: { title: 'Lesson 4 - Topic Name', content: 'Lesson 4 content goes here.' },
    };

    const lesson = lessonData[id] || { title: 'Lesson Not Found', content: 'No content available.' };

    const goToVocabulary = () => router.push(`/lesson/${id}/vocabulary`);
    const goToGrammar = () => router.push(`/lesson/${id}/grammar`);
    const goToQuiz = () => router.push(`/lesson/${id}/quiz`);

    return (
        <div className={styles.lessonPageContainer}>
            <h1 className={styles.lessonTitle}>{lesson.title}</h1>

            {/* Buttons for Lesson Activities */}
            <div className={styles.buttonContainer}>
                <button className={styles.lessonButton} onClick={goToVocabulary}>Learn Vocabulary</button>
                <button className={styles.lessonButton} onClick={goToGrammar}>Grammar Practice</button>
                <button className={styles.lessonButton} onClick={goToQuiz}>Take a Quiz</button>
            </div>
        </div>
    );
}
