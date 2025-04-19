import React from 'react';
import styles from './QuizStatus.module.css';

export default function QuizStatus({ progress, currentIndex, totalQuestions }) {
    if (!progress) return null;

    return (
        <div className={styles.progressPanel}>
            <div className={styles.statusRow}>
                <span><strong>Question:</strong> {currentIndex + 1} / {totalQuestions}</span>
            </div>

            <div className={styles.progressBarWrapper}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    {Math.trunc(((currentIndex) / totalQuestions) * 100)}% Complete
                </span>
            </div>
        </div>
    );
}
