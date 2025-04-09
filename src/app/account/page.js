'use client'

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Button from '@/app/util/Button';
import { auth } from '@/app/util/firebase';
import { redirect } from 'next/navigation';

export default function Account() {
	const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
    });

    useEffect(() => {
        // Redirect to login if no user is found
        if (!auth.currentUser) {
            redirect('/login');
        } else {
            // Set the user state if authenticated
            const currentUser = auth.currentUser;
            setUser(currentUser);
            setFormData({
                username: currentUser.displayName,
                firstName: currentUser.displayName.split(' ')[0],
                lastName: currentUser.displayName.split(' ')[1],
                email: currentUser.email,
            });
        }
    }, []);

    // If we haven't gotten the user yet, return a loading state or a spinner
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.accountContainer}>
            <div className={styles.accountWrapper}>
                {/* Account Icon */}
                <div className={styles.accountIcon}>
                    {formData.firstName.charAt(0).toUpperCase()}
                </div>

                {/* Line */}
                <div className={styles.divider}></div>

                {/* Account Information Form */}
                <form>
                    <div className={styles.formGroup}>
                        <label htmlFor="firstName" className={styles.label}>First Name</label>
                        <p className={styles.text}>{formData.firstName}</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="lastName" className={styles.label}>Last Name</label>
                        <p className={styles.text}>{formData.lastName}</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <p className={styles.text}>{formData.email}</p>
                    </div>

                    {/* Save Button */}
                    <div className={styles.buttonContainer}>
						<Button text="Sign Out" onClick={() => auth.signOut()}/>
                    </div>
                </form>
            </div>
        </div>
    );
}