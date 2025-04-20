import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../../utils/api';
import './ForgotPasswordPage.css';

import email_icon from '../../Assets/email.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = () => {
        if (!email) {
            setError('Email is required');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail()) {
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            navigate('/otp', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='page-container'>
            <Link to="/" className='back-button'>
                <img src={back_arrow} alt="Back" />
            </Link>

            <div className='website-logo'>
                <img src={website_logo_transparent} alt="Logo" />
            </div>
            
            <div className='content-container'>
                <div className='header'>
                    <div className='text'>
                        Forgot Password
                    </div>
                    <div className='underline'></div>
                </div>

                <form onSubmit={handleSubmit} className='inputs'>
                    <div className='text_2'>
                        Please enter your Email for password authentication.
                    </div>

                    <div className='input'>
                        <img src={email_icon} alt="Email" />
                        <input 
                            name='email' 
                            type="email" 
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className={`submit-container ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
