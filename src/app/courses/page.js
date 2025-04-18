'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/util/auth/AuthContext';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function LessonExplorer() {
    const router = useRouter();

    const goToLessonPage = (id) => {
        router.push(`/course/${id}`);
    };

	const { user, loading } = useAuth();

	const [ classes, setClasses ] = useState([]);
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
				const res = await fetch(`http://127.0.0.1:8000/api/users/${user.uid}/classes`, {
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

				setClasses(data);

			} catch(err) {
				console.error('Failed to fetch classes:', err);
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
            <h2 className={styles.title}>Course Explorer</h2>
            <hr className={styles.divider} />

            <div className={styles.classList}>
                {classes.map((classObj, index) => (
                    <div
                        key={classObj.class_id}
                        className={styles.classCard}
                        onClick={() => goToLessonPage(classObj.class_id)}
                    >
                        <span className={styles.classNumber}>{index + 1}</span>
                        <div>
                            <span className={styles.classTitle}>{classObj.class_name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
