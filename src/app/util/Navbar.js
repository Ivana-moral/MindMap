'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import styles from './Navbar.module.css';

export default function Navbar() {
    const router = useRouter();
	const [theme, setTheme] = useState('light');
    const [menuOpen, setMenuOpen] = useState(false);

	/**
	 * Theme onClick handler.
	 */
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

	/**
	 * Menu onClick handler
	 */
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
			{/* Top Menu */}
            <header className={styles.header}>
                <span className={styles.logo} onClick={() => router.push('/')}>MindMap</span>

                <div className={styles.iconContainer}>
                    <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>
                    <button className={styles.accountIcon} onClick={() => router.push('/account')} aria-label="Account Page">
                        <FaUserCircle />
                    </button>
                    <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Open Sidebar">
                        <FaBars />
                    </button>
                </div>
            </header>

            {/* Sidebar Menu */}
            <div className={`${styles.sidebar} ${menuOpen ? styles.show : ''}`}>
                <button className={styles.closeButton} onClick={toggleMenu} aria-label="Close Sidebar">
                    <FaTimes />
                </button>
                <ul>
                    <li onClick={() => { router.push('/account'); toggleMenu(); }}>Account</li>
                    <li onClick={() => { router.push('/coursepage'); toggleMenu(); }}>Courses</li>
                    <li onClick={() => { router.push('/instructorpage'); toggleMenu(); }}>Instructors</li>
                    <li onClick={() => { router.push('/lessonexplorer'); toggleMenu(); }}>Lessons</li>
                </ul>
            </div>
        </>
    );
}
