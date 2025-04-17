import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPasswordPage.css';

import email_icon from '../../Assets/email.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submithandleclick = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await axios.post('http://localhost:4000/api/auth/forgot-password', {
                email: email
            });

            if (response.data.message === 'OTP sent to your email') {
                navigate('/otp', { state: { email: email } });
            } else {
                setError(response.data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
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
                        Please enter your Email for password authentication.
                    </div>

                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input 
                            name='email' 
                            type="email" 
                            placeholder='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                </div>

                <div 
                    className={`forgot-container ${loading ? 'loading' : ''}`} 
                    onClick={submithandleclick}
                >
                    {loading ? 'Sending...' : 'Submit'}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
