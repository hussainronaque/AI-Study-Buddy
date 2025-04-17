import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../config';
import './NewPasswordPage.css';

import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const NewPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Get email from location state
        const emailFromState = location.state?.email;
        if (emailFromState) {
            setEmail(emailFromState);
        } else {
            // If no email in state, redirect to forgot password
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    const handleSubmit = async () => {
        // Validate passwords
        if (!password || !confirmPassword) {
            setError('Please enter both passwords');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Call the reset-password API endpoint
            const response = await axios.post(`${config.API_BASE_URL}/api/reset-password`, { 
                email, 
                password 
            });
            
            if (response.data.message === 'Password reset successfully') {
                // Show success message and redirect to login
                alert('Password reset successful! Please login with your new password.');
                navigate('/');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className='page-container'>
            <Link to="/OTP" className='back-button'>
                <img src={back_arrow} alt="" />
            </Link>

            <div className='website-logo'>
                <img src={website_logo_transparent} alt="" />
            </div>
            
            <div className='content-container'>
                <div className='header'>
                    <div className='text'>
                        New Password
                    </div>
                    <div className='underline'></div>
                </div>

                <div className='inputs'>
                    <div className='text_2'>
                        Please enter your new password.
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="" />
                        <input 
                            name='password' 
                            type="password" 
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="" />
                        <input 
                            name='confirm-password' 
                            type="password" 
                            placeholder='Confirm Password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className='error-message'>{error}</div>}
                </div>

                <div 
                    className={`submission-container ${loading ? 'loading' : ''}`} 
                    onClick={handleSubmit}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </div>
            </div>
        </div>
    );
};

export default NewPasswordPage;
