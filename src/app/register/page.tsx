"use client"
// Create basic sign in page
//
import React from 'react';
import axios from 'axios';
const crypto = require('crypto');

function generateCsrfToken() {
  return crypto.randomBytes(100).toString('hex');
}

const csrfToken = generateCsrfToken();
const SignInPage = () => {
    const handleButtonClick = async () => {
        try {
            const response = await axios({
                url: '/api/auth/signin/github',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
                timeoutErrorMessage: 'Request timed out. Please try again.',
              })

            // Handle the response as needed
            if (response.status === 200) {
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
