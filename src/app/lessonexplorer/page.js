'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/util/auth/AuthContext';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function LessonExplorer() {
    const router = useRouter();

    const goToLessonPage = (id) => {
        router.push(`/lesson/${id}`);
    };

	const { user, loading } = useAuth();

	const [ lessons, setLessons ] = useState([]);
	const [ fetching, setFetching ] = useState(true);

	useEffect(() => {
		if(loading) {
			return;
		}

		if(!user) {
			router.replace('/login');
			return;
		}

		async function fetchData() {
			try {
				const jwt = await user.getIdToken();
				const res = await fetch(`http://127.0.0.1:8000/api/lessons`, {
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

				const formattedLessons = data.map(item => ({
					lessonNumber: item.lesson_id,
					lessonName: item.lesson_name
				}))

				setLessons(formattedLessons);
			} catch(err) {
				console.error('Failed to fetch lessons:', err);
			} finally {
				setFetching(false);
			}
		}

		fetchData();
	}, [user, loading, router]);

	if(loading || fetching) {
		return <div>Loading...</div>
	}

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Lesson Explorer</h2>
            <hr className={styles.divider} />

            <div className={styles.lessonList}>
                {lessons.map((lesson, index) => (
                    <div
                        key={lesson.lessonNumber}
                        className={styles.lessonCard}
                        onClick={() => goToLessonPage(lesson.lessonNumber)}
                    >
                        <span className={styles.lessonNumber}>{index + 1}</span>
                        <div>
                            <span className={styles.lessonTitle}>{lesson.lessonName}</span>
							{/*TODO: Replace Placeholder with something... */}
                            <div className={styles.lessonSubtext}>placeholder</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
