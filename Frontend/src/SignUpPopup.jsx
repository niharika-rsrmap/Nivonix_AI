import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './SignUpPopup.css';

function SignUpPopup({ onSignUp, onSkip, isVisible }) {
    const [showGoogle, setShowGoogle] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowGoogle(false);
        }
    }, [isVisible]);

    const handleSignUpClick = () => {
        setShowGoogle(true);
    };

    // 🔴 GOOGLE SUCCESS HANDLER
    const handleGoogleSuccess = (credentialResponse) => {
        console.log('Google login successful:', credentialResponse);
        const token = credentialResponse.credential;
        // Pass token to parent component (App.jsx) to handle backend call
        onSignUp(token);
    };

    const handleGoogleError = () => {
        console.log('Google login failed');
        alert('Google login failed. Please try again.');
    };

    if (!isVisible) return null;

    return (
        <div className="signup-popup-overlay">
            <div className="signup-popup-modal">
                <div className="popup-header">
                    <h2>Join Nivonix AI</h2>
                    <p>Sign up to save your conversations and access them anytime</p>
                </div>

                <div className="popup-content">
                    {!showGoogle ? (
                        <>
                            <div className="popup-message">
                                <p>Get started with Nivonix AI today</p>
                            </div>

                            <div className="popup-buttons">
                                <button 
                                    className="btn-signup"
                                    onClick={handleSignUpClick}
                                >
                                    Sign Up
                                </button>
                                <button 
                                    className="btn-skip"
                                    onClick={onSkip}
                                >
                                    Skip for Now
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="google-login-container">
                            <p className="google-text">Continue with Google</p>

                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="dark"
                                size="large"
                                width="300"
                            />

                            <button 
                                className="btn-back"
                                onClick={() => setShowGoogle(false)}
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>

                <div className="popup-footer">
                    <p>
                        Already have an account? <a href="#login">Sign In</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUpPopup;
