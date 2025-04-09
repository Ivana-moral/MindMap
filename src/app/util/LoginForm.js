'use client'

import Button from '@/app/util/Button';

import { auth } from '@/app/util/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

export default function LoginForm() {
		const router = useRouter();
		const [error, setError] = useState(null);

		// Redirect user if they are already signed in
		useEffect(() => {
			if (auth.currentUser) {
				router.push('/account');
			}
		}, [router]);
	
		async function handleSignIn() {
			const provider = await new GoogleAuthProvider();
			provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
			try {
				//TODO: change popup language based on system preferences
				const result = await signInWithPopup(auth, provider);
				router.push('/account');
			} catch (error) {
				setError(error);
				console.error("Error Signing In: %s\nMessage: %s", error.code, error.message);
			}
		}
	
		return (
			<div className={styles.container}>
			  <div className={styles.form}>
				<h2 className={styles.title}>Sign in</h2>
				<Button text="Sign in with Google" onClick={handleSignIn} className={styles.button} />
				{error && <p className={styles.error}>{error}</p>}
			  </div>
			</div>
		  );
}