'use client';

import { useParams } from 'next/navigation';
import styles from './page.module.css';
import Flashcard from '@/app/util/Flashcard';

export default function VocabularyPage() {
    const { id } = useParams();

    // Example vocabulary data (Replace with API call later)
    const vocabularyData = {
        1: [
            { word: 'Hola', definition: 'Hello' },
            { word: 'Gracias', definition: 'Thank you' },
            { word: 'Adiós', definition: 'Goodbye' }
        ],
        2: [
            { word: 'Casa', definition: 'House' },
            { word: 'Perro', definition: 'Dog' },
            { word: 'Gato', definition: 'Cat' }
        ],
        // Add more lessons here...
    };

    const vocabulary = vocabularyData[id] || [];

    return (
        <div className={styles.vocabularyContainer}>
            <h1>Lesson {id} - Vocabulary</h1>
            <div className={styles.flashcardContainer}>
                {vocabulary.map((item, index) => (
                    <Flashcard key={index} word={item.word} definition={item.definition} />
                ))}
            </div>
        </div>
    );
}
