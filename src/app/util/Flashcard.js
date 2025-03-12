'use client';

import { useState } from 'react';
import styles from './Flashcard.module.css';

export default function Flashcard({ word, definition }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div 
            className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}
            onClick={() => setFlipped(!flipped)}
        >
            <div className={styles.cardContent}>
                {flipped ? <p>{definition}</p> : <p>{word}</p>}
            </div>
        </div>
    );
}
