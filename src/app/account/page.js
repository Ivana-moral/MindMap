'use client'

import { useEffect } from 'react';
import styles from './page.module.css';
import Button from '@/app/util/Button';
import { useAuth } from '@/app/util/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function Account() {
	const { user, loading, signOut } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if(loading) {
			return;
		}

		if(!user) {
			router.replace('/login');
		}
	}, [user, loading, router]);

	if(loading || !user) {
		return <div>Loading...</div>
	}

	const displayName = user.displayName || '';
	const [firstName, lastName] = displayName.split(' ');

    return (
        <div className={styles.accountContainer}>
            <div className={styles.accountWrapper}>
                {/* Account Icon */}
                <div className={styles.accountIcon}>
                    {firstName?.charAt(0).toUpperCase()}
                </div>

                {/* Line */}
                <div className={styles.divider}></div>

                {/* Account Information Form */}
                <form>
                    <div className={styles.formGroup}>
                        <label htmlFor="firstName" className={styles.label}>First Name</label>
                        <p className={styles.text}>{firstName}</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="lastName" className={styles.label}>Last Name</label>
                        <p className={styles.text}>{lastName}</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <p className={styles.text}>{user.email}</p>
                    </div>
                </form>

				{/* Sign Out Button */}
				<div className={styles.buttonContainer}>
					<Button text="Sign Out" onClick={signOut}/>
				</div>
            </div>
        </div>
    );
}