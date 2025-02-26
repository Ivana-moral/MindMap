'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';

export default function CoursePage() {
    const router = useRouter();

    // TODO: Fetch actual course data from backend
    const [courses, setCourses] = useState([
        { id: 1, name: 'Spanish 1' },
        { id: 2, name: 'Business Spanish' },
        { id: 3, name: 'Spanish Culture' }
    ]);

    const [courseCode, setCourseCode] = useState('');

    const handleInputChange = (e) => {
        setCourseCode(e.target.value);
    };

    const handleAddCourse = () => {
        console.log('Adding course:', courseCode);
        setCourseCode('');
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
                        <button key={course.id} className={styles.courseCard}>
                            {course.name}
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
            </div>
        </div>
    );
}
