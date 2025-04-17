import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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
    const email = location.state?.email;

    useEffect(() => {
        // Check if email exists in navigation state
        if (!email) {
            navigate('/forgot-password');
        }
    }, [navigate, email]);

    const handleSubmit = async () => {
        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:4000/api/auth/reset-password', {
                email,
                newPassword: password
            });
            
            // Show success message and redirect
            alert('Password reset successful! Please login with your new password.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='page-container'>
            <Link to="/otp" className='back-button'>
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
                            placeholder='New Password'
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

                    {error && <div className="error-message">{error}</div>}
                </div>

                <div 
                    className={`submit-container ${loading ? 'loading' : ''}`}
                    onClick={handleSubmit}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </div>
            </div>
        </div>
    );
};

export default NewPasswordPage;
