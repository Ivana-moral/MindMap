'use client';

import { useState } from 'react';
import styles from './Flashcard.module.css';

export default function Flashcard({ word, definition, isFlipped, onFlip }) {
    const [internalFlip, setInternalFlip] = useState(false);

    // flipped for vocab vs grammar
    const flipped = isFlipped !== undefined ? isFlipped : internalFlip;
    const handleClick = () => {
        if (onFlip) {
            onFlip();
        } else {
            setInternalFlip(prev => !prev);
        }
    };

    return (
        <div className={styles.flashcard} onClick={handleClick}>
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
