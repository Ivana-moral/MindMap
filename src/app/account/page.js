'use client'

import { useState } from 'react';
import styles from './page.module.css';
import Button from '@/app/util/Button'

export default function Account() {
    // TODO: fetch actual data from backend using server side props
    const [formData, setFormData] = useState({
        username: 'jsmith1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
    });

    // Dynamically updates formData on input
    const handleInputChange = (e) => {
        const { name, value } = e.target;   // Get name and value attribute of field
        setFormData((prevState) => ({
          ...prevState,     // Copy previous form data
          [name]: value,    // Update the value of the field that was changed
        }));
    };

    return (
        <div className={styles.accountContainer}>
            <div className={styles.accountWrapper}>
                {/* Account Icon */}
                <div className={styles.accountIcon}>
                    {formData.username.charAt(0).toUpperCase()}
                </div>

                {/* Line */}
                <div className={styles.divider}></div>

                {/* Account Information Form */}
                <form>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={styles.input}
                            placeholder="Username"
                        />
                    </div>
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
						<Button text="Save Changes" />
                    </div>
                </form>
            </div>
        </div>
    );
}