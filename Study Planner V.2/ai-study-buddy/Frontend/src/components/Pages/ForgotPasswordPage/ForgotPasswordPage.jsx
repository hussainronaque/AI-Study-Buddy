import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import './ForgotPasswordPage.css';

import email_icon from '../../Assets/email.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/request-otp`, { email });
            
            if (response.data.message === 'OTP sent successfully') {
                // Navigate to OTP page with email in state
                navigate('/OTP', { state: { email } });
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='page-container'>
            <Link to="/" className='back-button'>
                <img src={back_arrow} alt="" />
            </Link>

            <div className='website-logo'>
                <img src={website_logo_transparent} alt="" />
            </div>
            
            <div className='content-container'>
                <div className='header'>
                    <div className='text'>
                        Forgot Password
                    </div>
                    <div className='underline'></div>
                </div>

                <div className='inputs'>
                    <div className='text_2'>
                        Please enter your email for password reset.
                    </div>

                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input 
                            name='email' 
                            type="email" 
                            placeholder='Email Address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    
                    {error && <div className='error-message'>{error}</div>}
                </div>

                <div 
                    className={`forgot-container ${loading ? 'loading' : ''}`} 
                    onClick={!loading ? handleSubmit : undefined}
                >
                    {loading ? 'Sending...' : 'Submit'}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
