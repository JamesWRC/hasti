"use client"
// Create basic sign in page
//
import React from 'react';
const crypto = require('crypto');

function generateCsrfToken() {
  return crypto.randomBytes(100).toString('hex');
}

const csrfToken = generateCsrfToken();
const SignInPage = () => {
    const handleButtonClick = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/signin/github', {
                method: 'POST',
                // Add any required headers or body parameters here
            });

            // Handle the response as needed
            if (response.ok) {
                // Success logic
            } else {
                // Error logic
            }
        } catch (error) {
            // Error handling
        }
    };

    return (
        // Add CSRF token in the post request
        <div>
            <h1>Sign In</h1>
            {/* <button onClick={handleButtonClick}>Make POST Request</button> */}
            <form onSubmit={handleButtonClick}>
                <button type="submit">Make POST Request</button>
                <input type="hidden" name="csrfToken" value={csrfToken}/>
                <input type="hidden" name="callbackUrl" value="http://localhost:3000/signin"/>
            </form>
        </div>
    );
};

export default SignInPage;