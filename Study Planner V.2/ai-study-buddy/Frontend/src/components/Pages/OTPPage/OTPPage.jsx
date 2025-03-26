import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './OTPPage.css';

import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const OTPPage = () => {

    const navigate = useNavigate();

    const submithandleclick = () => {
        navigate('/new-password');
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
                        OTP Verification
                    </div>

                    <div className='underline'>
                    </div>

                </div>

                <div className='inputs'>

                    <div className='text_2'>
                        Please enter the OTP sent to your registered email.
                    </div>

                    <div className='input'>
                        <input name='otp' type="text" placeholder='#PIN'/>
                    </div>
                </div>

                <div className='submission-container' onClick={submithandleclick}>
                    Submit
                </div>
            </div>
        </div>
    );
};

export default OTPPage;
