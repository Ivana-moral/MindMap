'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/app/util/auth/AuthContext';

export default function CoursePage() {
    const router = useRouter();

    const { user, loading } = useAuth();

    const [courses, setCourses] = useState([]);
    const [courseCode, setCourseCode] = useState('');
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(loading) {
            return;
        }

        if(!user) {
            router.replace('/login');
            return;
        }

        async function fetchCourses() {
            try {
                const jwt = await user.getIdToken();

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.uid}/classes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    }
                });

                if(!res.ok) {
                    throw new Error('Failed to fetch classes');
                }

                const data = await res.json();

                setCourses(data);
            } catch (err) {
                console.error('Error fetching classes: ', err)
            } finally {
                setFetching(false);
            }
        }

        if(fetching) {
            fetchCourses();
        }
        
    }, [user, loading, fetching]);

    const handleInputChange = (e) => {
        setCourseCode(e.target.value);
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();

        const jwt = await user.getIdToken();
        console.log(jwt);
        console.log(user.uid);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.uid}/enroll?class_id=${courseCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                }
            });

            if(!res.ok) {
                throw new Error('Failed to enroll in class.');
            }
        } catch (err) {
            setError(err);
        }

        setCourseCode('');
        setFetching(true);
    };

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <span className={styles.logo}>MindMap</span>
                <button className={styles.accountIcon} onClick={() => router.push('/account')}>
                    <FaUserCircle /> {}
                </button>
            </header>

            {/* Course Enrollment Section */}
            <h1 className={styles.title}>Current Enrollment</h1>
            <div className={styles.divider}></div>

            {/* Course List */}
            <div className={styles.courseContainer}>
                <div className={styles.courseList}>
                    {courses.map((course) => (
                        <button key={course.class_id} className={styles.courseCard}>
                            {course.class_name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Course Section */}
            <div className={styles.addCourseContainer}>
                <input
                    type="text"
                    placeholder="Enter Course Code"
                    value={courseCode}
                    onChange={handleInputChange}
                    className={styles.input}
                />
                <button className={styles.addButton} onClick={handleAddCourse}>
                    Add Course
                </button>
                {error && <p>Could Not Find Course!</p>}
            </div>
        </div>
    );
}
