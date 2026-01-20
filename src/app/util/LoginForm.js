'use client'

import Button from '@/app/util/Button';

import { auth } from '@/app/util/auth/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';
import { useAuth } from '@/app/util/auth/AuthContext';

export default function LoginForm() {
		const { user, loading } = useAuth();
		const [ error, setError ] = useState(null);
		const router = useRouter();

		useEffect(() => {
			if(loading) {
				return;
			}

			if(user) {
				router.replace('/account');
			}
		}, [user, loading, router]);
	
		async function handleSignIn() {
			const provider = await new GoogleAuthProvider();
			provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

			try {
				//TODO: change popup language based on system preferences
				const result = await signInWithPopup(auth, provider);
				const jwt = await result.user.getIdToken();
				fetch(`${process.env.NEXT_PUBLIC_API_URL}/login?token=${jwt}`, {
					method: 'POST'
				});
			} catch (err) {
				console.error("Sign-in Error: ", err);
				setError(`${err.code}: ${err.message}`);
			}
		}

		if(loading) {
			return <div>Loading...</div>
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