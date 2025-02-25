'use client'

import { useState } from 'react';
import styles from './page.module.css'
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        //TODO: implement
    }

    return (
        <div className={styles.loginFormContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <div>
                    <label className={styles.labelField} htmlFor='email'>Email:</label>
                    <input
                        className={styles.inputField}
                        type='email'
                        id='email'
                        name='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className={styles.labelField} htmlFor='Password'>Password:</label>
                    <input
                        className={styles.inputField}
                        type='password'
                        id='password'
                        name='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={({color: 'red'})}>{error}</p>}
                <button className={styles.buttonField} type='submit'>Login</button>
                <p className={styles.signUp}>Need an account?
                    <Link className={styles.link} href='signup'> Sign Up </Link>
                </p>
            </form>
        </div>
    )
}