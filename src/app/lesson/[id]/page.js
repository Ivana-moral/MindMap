'use client';

import styles from './page.module.css';

import { useRouter, useParams } from 'next/navigation';

export default function LessonExplorer() {
	const router = useRouter();

	const { id } = useParams();

    return (
        <div className={styles.lessonPageContainer}>
            <h2 className={styles.title}>Intro to Spanish</h2>
            <hr className={styles.divider} />

            <div className={styles.buttonContainer}>
                <button className={styles.lessonButton} onClick={() => router.push(`/lesson/${id}/vocabulary`)}>
                    Learn Vocabulary
                </button>
                <button className={styles.lessonButton} onClick={() => router.push(`/lesson/${id}/grammar`)}>
                    Grammar Practice
                </button>
                <button className={styles.lessonButton} onClick={() => router.push(`/lesson/${id}/quiz`)}>
                    Take a Quiz
                </button>
            </div>
        </div>
    );
}
