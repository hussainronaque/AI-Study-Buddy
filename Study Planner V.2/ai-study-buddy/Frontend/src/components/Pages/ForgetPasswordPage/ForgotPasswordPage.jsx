import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css';

import email_icon from '../../Assets/email.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';
import back_arrow from '../../Assets/Back-Arrow.png';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        // Add password reset logic here
        // For now, just show a success message
        setMessage('Password reset link sent to your email!');
        setTimeout(() => {
            navigate('/');
        }, 3000);
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

                <div className='subtitle'>
                    Enter your email address to reset your password
                </div>

                <div className='inputs'>
                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input 
                            type="email" 
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {message && (
                    <div className='message'>
                        {message}
                    </div>
                )}

                <div className='submit-container' onClick={handleSubmit}>
                    Reset Password
                </div>

                <div className='login-prompt'>
                    <Link to="/">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;