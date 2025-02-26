'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';

export default function InstructorPortal() {
    const router = useRouter();

    const [selectedSection, setSelectedSection] = useState('dashboard');

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <span className={styles.logo}>MindMap</span>
                <button className={styles.accountIcon} onClick={() => router.push('/account')}>
                    <FaUserCircle />
                </button>
            </header>

            <div className={styles.content}>
                {/* Sidebar */}
                <nav className={styles.sidebar}>
                    <ul>
                        <li 
                            className={selectedSection === 'dashboard' ? styles.active : ''}
                            onClick={() => setSelectedSection('dashboard')}
                        >
                            Dashboard
                        </li>
                        <li 
                            className={selectedSection === 'courses' ? styles.active : ''}
                            onClick={() => setSelectedSection('courses')}
                        >
                            Courses
                        </li>
                        <li 
                            className={selectedSection === 'assignments' ? styles.active : ''}
                            onClick={() => setSelectedSection('assignments')}
                        >
                            Assignments
                        </li>
                        <li 
                            className={selectedSection === 'settings' ? styles.active : ''}
                            onClick={() => setSelectedSection('settings')}
                        >
                            Settings
                        </li>
                    </ul>
                </nav>

                {/*Right Side Content*/}
                <div className={styles.main}>
                    {selectedSection === 'dashboard' && (
                        <div>
                            <h1 className={styles.title}>Instructor Dashboard</h1>
                            <div className={styles.divider}></div>
                            <p className={styles.sectionText}>Welcome to your dashboard</p>
                        </div>
                    )}

                    {selectedSection === 'courses' && (
                        <div>
                            <h1 className={styles.title}>Courses</h1>
                            <div className={styles.divider}></div>
                            <p className={styles.sectionText}>Manage your courses here</p>
                        </div>
                    )}

                    {selectedSection === 'assignments' && (
                        <div>
                            <h1 className={styles.title}>Assignments</h1>
                            <div className={styles.divider}></div>
                            <p className={styles.sectionText}>Manage assignments here</p>
                        </div>
                    )}

                    {selectedSection === 'settings' && (
                        <div>
                            <h1 className={styles.title}>Settings</h1>
                            <div className={styles.divider}></div>
                            <p className={styles.sectionText}>Adjust your settings here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
