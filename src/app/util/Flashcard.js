'use client';

import { useState } from 'react';
import styles from './Flashcard.module.css';

export default function Flashcard({ word, definition }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className={styles.flashcard} onClick={() => setFlipped(!flipped)}>
            <div className={`${styles.cardInner} ${flipped ? styles.flipped : ''}`}>
                <div className={styles.cardFront}>
                    <p>{word}</p>
                </div>
                <div className={styles.cardBack}>
                    <p>{definition}</p>
                </div>
            </div>
        </div>
    );
}
