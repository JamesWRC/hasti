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

// return (
//     <div>
//         <h1>Sign In</h1>
//         <button onClick={handleGitHubSignIn} disabled={loading}>
//             Sign in with GitHub
//         </button>
//     </div>
// );
// const SignInPage = () => {
//     const fetchData = async () => {
//         const session = await auth();

//         };

//         export default SignInPage;

//         if (session) {
//             // User is already signed in, redirect to another page
//             return (
//                 <div>
//                     <h1>Already signed in ya goose</h1>
//                 </div>
//             );
//         }else{
//             return (
//                 <div>
//                     <h1>Sign In</h1>
//                     <SignIn />
//                 </div>
//             );
        
//         }
//     };

//     return fetchData();


// };

// export default SignInPage;

// const SignInPage = () => {
//     const [loading, setLoading] = useState(false);

//     const handleGitHubSignIn = async () => {
//         try {
//             setLoading(true);
//             const response = await fetch('http://localhost:3000/api/auth/signin/github', {
//                 method: 'POST',
//                 // Add any required headers or body parameters here
//             });

//             // Handle the response as needed
//             if (response.ok) {
//                 // User is already signed in, redirect to another page
//                 // Replace the following code with your desired redirect logic
//                 return (
//                     <div>
//                         <h1>Already signed in ya goose</h1>
//                     </div>
//                 );
//             } else {
//                 // Handle the unsuccessful sign-in
//                 // Replace the following code with your desired error handling logic
//                 return (
//                     <div>
//                         <h1>Sign In</h1>
//                         <button onClick={handleGitHubSignIn} disabled={loading}>
//                             Sign in with GitHub
//                         </button>
//                     </div>
//                 );
//             }
//         } catch (error) {
//             // Handle any errors that occur during the sign-in process
//             // Replace the following code with your desired error handling logic
//             console.error('Error signing in with GitHub:', error);
//             return (
//                 <div>
//                     <h1>Sign In</h1>
//                     <button onClick={handleGitHubSignIn} disabled={loading}>
//                         Sign in with GitHub
//                     </button>
//                 </div>
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <h1>Sign In</h1>
//             <button onClick={handleGitHubSignIn} disabled={loading}>
//                 Sign in with GitHub
//             </button>
//         </div>
//     );
// }
