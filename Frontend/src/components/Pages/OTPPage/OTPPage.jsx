import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, forgotPassword } from '../../../utils/api';
import './OTPPage.css';

import website_logo_transparent from '../../Assets/website-logo-transparent.png';
import back_arrow from '../../Assets/Back-Arrow.png';

const OTPPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(600); // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const email = location.state?.email;

    useEffect(() => {
        // Check if email exists in navigation state
        if (!email) {
            navigate('/forgot-password');
            return;
        }

        // Start countdown timer
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate, email]);

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
        if (value && index < 5) {
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

    const verifyOtpHandler = async () => {
        const enteredOTP = otp.join('');
        
        if (enteredOTP.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await verifyOtp(email, enteredOTP);

            if (response.message === 'OTP verified successfully') {
                navigate('/new-password', { state: { email } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            // Clear OTP fields
            setOtp(['', '', '', '', '', '']);
            // Focus first input
            const firstInput = document.querySelector('input[name=otp-0]');
            if (firstInput) firstInput.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');

        try {
            const response = await forgotPassword(email);

            if (response.message === 'OTP sent to your email') {
                setTimer(600);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
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
                    <div className='text'>
                        Enter OTP
                    </div>
                    <div className='underline'></div>
                </div>

                <div className='inputs'>
                    <div className='text_2'>
                        Please enter the 6-digit OTP sent to your email.
                    </div>

                    <div className='otp-inputs'>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                name={`otp-${index}`}
                            />
                        ))}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className='timer'>
                        Time remaining: {formatTime(timer)}
                    </div>

                    <div 
                        className={`resend ${canResend ? 'active' : ''}`}
                        onClick={handleResendOtp}
                    >
                        {canResend ? 'Resend OTP' : 'Wait before resending'}
                    </div>
                </div>

                <div 
                    className={`submit-container ${loading ? 'loading' : ''}`}
                    onClick={verifyOtpHandler}
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </div>
            </div>
        </div>
    );
};

export default OTPPage;