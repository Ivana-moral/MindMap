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
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	useEffect(() => {
		if (loading) return;

		if (!user) {
			router.replace('/login');
			return;
		}

		async function fetchData() {
			try {
				const jwt = await user.getIdToken();
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${id}/materials`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${jwt}`
					}
				});

				if (!res.ok) {
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

	const handlePrev = () => {
		if (currentIndex > 0) {
			setCurrentIndex(prev => prev - 1);
			setIsFlipped(false);
		}
	};

	const handleNext = () => {
		if (currentIndex < vocab.length - 1) {
			setCurrentIndex(prev => prev + 1);
			setIsFlipped(false);
		}
	};

	if (loading || fetching) {
		return <div className={styles.container}><p>Loading...</p></div>;
	}

	if (vocab.length === 0) {
		return (
			<div className={styles.container}>
				<h1>Lesson {id} - Vocabulary</h1>
				<p>No vocabulary found for this lesson.</p>
			</div>
		);
	}

	const currentCard = vocab[currentIndex];

	return (
		<div className={styles.container}>
		<h2 className={styles.title}>Lesson {id} - Vocabulary</h2>
		<div className={styles.flashcardContainer}>
				<Flashcard
					word={currentCard.word}
					definition={currentCard.definition}
					isFlipped={isFlipped}
					onFlip={() => setIsFlipped(prev => !prev)}
				/>
				<div className={styles.navButtons}>
					<button onClick={handlePrev} className={styles.navBtn}>Prev</button>
					<span className={styles.counter}>{currentIndex + 1} / {vocab.length}</span>
					<button onClick={handleNext} className={styles.navBtn}>Next</button>
				</div>
			</div>
		</div>
	);
}
