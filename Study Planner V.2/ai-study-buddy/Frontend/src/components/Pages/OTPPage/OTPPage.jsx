// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import './OTPPage.css';

// import website_logo_transparent from '../../Assets/website-logo-transparent.png'
// import back_arrow from '../../Assets/Back-Arrow.png'

// const OTPPage = () => {

//     const navigate = useNavigate();

//     const submithandleclick = () => {
//         navigate('/new-password');
//     };

//     return (
//         <div className='page-container'>

//             <Link to="/forgot-password" className='back-button'>
//                 <img src={back_arrow} alt="" />
//             </Link>

//             <div className='website-logo'>
//                 <img src={website_logo_transparent} alt="" />
//             </div>
            
//             <div className='content-container'>

//                 <div className='header'>

//                     <div className='text'>
//                         OTP Verification
//                     </div>

//                     <div className='underline'>
//                     </div>

//                 </div>

//                 <div className='inputs'>

//                     <div className='text_2'>
//                         Please enter the OTP sent to your registered email.
//                     </div>

//                     <div className='input'>
//                         <input name='otp' type="text" placeholder='#PIN'/>
//                     </div>
//                 </div>

//                 <div className='submission-container' onClick={submithandleclick}>
//                     Submit
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OTPPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './OTPPage.css';

import website_logo_transparent from '../../Assets/website-logo-transparent.png';
import back_arrow from '../../Assets/Back-Arrow.png';

const OTPPage = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const correctOTP = '1234'; // In a real app, this would come from your backend

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

    const verifyOtp = () => {
        const enteredOTP = otp.join('');
        
        if (enteredOTP.length !== 4) {
            setError('Please enter all 4 digits');
            return;
        }

        if (enteredOTP === correctOTP) {
            // OTP is correct
            console.log('OTP verified successfully');
            navigate('/new-password');
        } else {
            setError('Invalid OTP. Please try again.');
            // Clear OTP fields
            setOtp(['', '', '', '']);
            // Focus first input
            const firstInput = document.querySelector('input[name=otp-0]');
            if (firstInput) firstInput.focus();
        }
    };

    const handleResendOtp = () => {
        // Add your resend OTP logic here
        setError('');
        setOtp(['', '', '', '']);
        alert('New OTP has been sent to your email');
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
                    Enter the 4-digit verification code sent to your email
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

                <div className='submission-container' onClick={verifyOtp}>
                    Verify OTP
                </div>

                <div className='resend-prompt'>
                    Didn't receive the code? 
                    <span className='resend-link' onClick={handleResendOtp}> Resend OTP</span>
                </div>
            </div>
        </div>
    );
};

export default OTPPage;