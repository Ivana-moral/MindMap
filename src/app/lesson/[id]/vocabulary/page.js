'use client';

import { useParams } from 'next/navigation';
import styles from './page.module.css';
import Flashcard from '@/app/util/Flashcard';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/util/auth/AuthContext';

export default function VocabularyPage() {
	const { id } = useParams();
	const { user, loading } = useAuth();
	const router = useRouter();

	const [vocab, setVocab] = useState([]);
	const [fetching, setFetching] = useState(true);

	useEffect(() => {
		if(loading) {
			return;
		}

		if(!user) {
			router.replace('/login');
			return;
		}

		async function fetchData() {
			try {
				const jwt = await user.getIdToken();
				const res = await fetch(`http://127.0.0.1:8000/api/lessons/${id}/materials`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${jwt}`
					}
				});

				if(!res.ok) {
					throw new Error(`HTTP Error! Status Code ${res.status}`);
				}

				const data = await res.json();
				const vocabOnly = data.filter(item => item.type_of_material === 'vocabulary');

				const formattedVocab = vocabOnly.map(item => ({
					word: item.vocabulary_word,
					definition: item.vocabulary_definition,
				}));

				setVocab(formattedVocab);
			} catch (err) {
				console.error(`Failed to fetch vocabulary: `, err);
			} finally {
				setFetching(false);
			}
		}

		fetchData();
	}, [user, loading, router, id]);

	if(loading || fetching) {
		return <div>Loading...</div>
	}

    return (
        <div className={styles.vocabularyContainer}>
            <h1>Lesson {id} - Vocabulary</h1>
            <div className={styles.flashcardContainer}>
				{vocab.length === 0 ? (<p>No vocabulary found for this lesson.</p>) : (
					vocab.map((item, index) => (
						<Flashcard key={index} word={item.word} definition={item.definition} />
					))
				)}
            </div>
        </div>
    );
}
