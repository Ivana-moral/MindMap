'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import styles from './Navbar.module.css';

export default function Navbar() {
    const router = useRouter();
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
            <header className={styles.header}>
                <span className={styles.logo} onClick={() => router.push('/')}>MindMap</span>

                <div className={styles.iconContainer}>
                    <button className={styles.themeToggle} onClick={toggleTheme}>
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>
                    <button className={styles.accountIcon} onClick={() => router.push('/account')}>
                        <FaUserCircle />
                    </button>
                    <button className={styles.menuToggle} onClick={toggleMenu}>
                        <FaBars />
                    </button>
                </div>
            </header>

            {/* Sidebar Menu */}
            <div className={`${styles.sidebar} ${menuOpen ? styles.show : ''}`}>
                <button className={styles.closeButton} onClick={toggleMenu}>
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
