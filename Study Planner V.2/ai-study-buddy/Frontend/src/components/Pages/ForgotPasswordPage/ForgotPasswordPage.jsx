import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css';

import email_icon from '../../Assets/email.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const ForgotPasswordPage = () => {

    const navigate = useNavigate();

    const submithandleclick = () => {
        navigate('/OTP');
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

                    <div className='underline'>
                    </div>

                </div>

                <div className='inputs'>

                    <div className='text_2'>
                        Please enter your Email or Username for password authentication.
                    </div>

                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input name='email-username' type="text" placeholder='Username Or Email'/>
                    </div>
                </div>

                <div className='forgot-container' onClick={submithandleclick}>
                    Submit
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
