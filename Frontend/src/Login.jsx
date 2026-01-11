import './Login.css';
import { useState } from 'react';

function Login({ onLoginSuccess }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const validateForm = () => {
        if (!formData.email.trim() || !formData.password.trim()) {
            setError('Email and password are required');
            return false;
        }

        if (isSignUp) {
            if (!formData.name.trim()) {
                setError('Name is required');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
            const payload = isSignUp 
                ? { name: formData.name, email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password };

            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setSuccess(isSignUp ? 'Account created successfully!' : 'Login successful!');
            
            setTimeout(() => {
                onLoginSuccess(data.user);
            }, 500);

        } catch (err) {
            console.error('Auth error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError(null);
        setSuccess(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="gradient-blob blob-1"></div>
                <div className="gradient-blob blob-2"></div>
                <div className="gradient-blob blob-3"></div>
            </div>

            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <span>N</span>
                        </div>
                        <h1>Nivonix AI</h1>
                        <p>Your Intelligent Assistant</p>
                    </div>

                    <div className="login-content">
                        <div className="auth-tabs">
                            <button 
                                className={`tab ${!isSignUp ? 'active' : ''}`}
                                onClick={() => !isSignUp && toggleMode()}
                            >
                                <i className="fas fa-sign-in-alt"></i>
                                Sign In
                            </button>
                            <button 
                                className={`tab ${isSignUp ? 'active' : ''}`}
                                onClick={() => isSignUp && toggleMode()}
                            >
                                <i className="fas fa-user-plus"></i>
                                Sign Up
                            </button>
                        </div>

                        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                        <p className="subtitle">
                            {isSignUp 
                                ? 'Join Nivonix and start chatting with AI' 
                                : 'Sign in to your account to continue'}
                        </p>

                        {error && (
                            <div className="alert alert-error">
                                <i className="fas fa-exclamation-circle"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                <i className="fas fa-check-circle"></i>
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login-form">
                            {isSignUp && (
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <i className="fas fa-user"></i>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">
                                    <i className="fas fa-envelope"></i>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className="form-input"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <i className="fas fa-lock"></i>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="form-input"
                                    disabled={loading}
                                />
                            </div>

                            {isSignUp && (
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <i className="fas fa-lock"></i>
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="form-input"
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="login-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                    </>
                                ) : (
                                    <>
                                        <i className={`fas ${isSignUp ? 'fa-user-plus' : 'fa-sign-in-alt'}`}></i>
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                <button 
                                    type="button"
                                    className="toggle-btn"
                                    onClick={toggleMode}
                                    disabled={loading}
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </div>

                        <div className="login-footer">
                            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                        </div>
                    </div>
                </div>

                <div className="login-features">
                    <div className="feature">
                        <div className="feature-icon">
                            <i className="fas fa-brain"></i>
                        </div>
                        <h3>AI Powered</h3>
                        <p>Advanced AI technology for intelligent conversations</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h3>Secure</h3>
                        <p>Your data is encrypted and protected</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">
                            <i className="fas fa-zap"></i>
                        </div>
                        <h3>Fast</h3>
                        <p>Lightning-fast responses and interactions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
