import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../../utils/api';
import './NewPasswordPage.css';

import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const NewPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const email = location.state?.email;

    useEffect(() => {
        // Check if email exists in navigation state
        if (!email) {
            navigate('/forgot-password');
        }
    }, [navigate, email]);

    const validateForm = () => {
        if (!formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, formData.password);
            navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className='page-container'>
            <Link to="/otp" className='back-button'>
                <img src={back_arrow} alt="Back" />
            </Link>

            <div className='website-logo'>
                <img src={website_logo_transparent} alt="Logo" />
            </div>
            
            <div className='content-container'>
                <div className='header'>
                    <div className='text'>
                        New Password
                    </div>
                    <div className='underline'></div>
                </div>

                <form onSubmit={handleSubmit} className='inputs'>
                    <div className='text_2'>
                        Please enter your new password.
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="Password" />
                        <input 
                            name='password' 
                            type="password" 
                            placeholder='New Password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="Confirm Password" />
                        <input 
                            name='confirmPassword' 
                            type="password" 
                            placeholder='Confirm Password'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className={`submit-container ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewPasswordPage;
