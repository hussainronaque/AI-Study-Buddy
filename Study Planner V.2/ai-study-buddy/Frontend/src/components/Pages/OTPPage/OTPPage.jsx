import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../config';
import './OTPPage.css';

import website_logo_transparent from '../../Assets/website-logo-transparent.png';
import back_arrow from '../../Assets/Back-Arrow.png';

const OTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        // Get email from location state
        const emailFromState = location.state?.email;
        if (emailFromState) {
            setEmail(emailFromState);
        } else {
            // If no email in state, redirect to forgot password
            navigate('/forgot-password');
        }

        // Start timer
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [location, navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
            if (prevInput) prevInput.focus();
        }
    };

    const verifyOtp = async () => {
        const enteredOTP = otp.join('');
        
        if (enteredOTP.length !== 4) {
            setError('Please enter all 4 digits');
            return;
        }

        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/verify-otp`, {
                email,
                otp: enteredOTP
            });

            if (response.data.message === 'OTP verified successfully') {
                navigate('/new-password', { state: { email } });
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to verify OTP');
            // Clear OTP fields
            setOtp(['', '', '', '']);
            // Focus first input
            const firstInput = document.querySelector('input[name=otp-0]');
            if (firstInput) firstInput.focus();
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/request-otp`, { email });
            
            if (response.data.message === 'OTP sent successfully') {
                setError('');
                setOtp(['', '', '', '']);
                setTimer(300);
                setCanResend(false);
                alert('New OTP has been sent to your email');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to resend OTP');
        }
    };

    return (
        <div className='page-container'>
            <Link to="/forgot-password" className='back-button'>
                <img src={back_arrow} alt="" />
            </Link>

            <div className='website-logo'>
                <img src={website_logo_transparent} alt="" />
            </div>
            
            <div className='content-container'>
                <div className='header'>
                    <div className='text'>Enter OTP</div>
                    <div className='underline'></div>
                </div>

                <div className='text_2'>
                    Enter the 4-digit verification code sent to {email}
                </div>

                <div className='otp-inputs'>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            name={`otp-${index}`}
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className='otp-input'
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                {error && <div className='error-message'>{error}</div>}

                <div className='timer'>
                    Time remaining: {formatTime(timer)}
                </div>

                <div className='submission-container' onClick={verifyOtp}>
                    Verify OTP
                </div>

                <div className='resend-prompt'>
                    Didn't receive the code? 
                    <span 
                        className={`resend-link ${canResend ? 'active' : 'disabled'}`} 
                        onClick={handleResendOtp}
                    >
                        Resend OTP
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OTPPage;