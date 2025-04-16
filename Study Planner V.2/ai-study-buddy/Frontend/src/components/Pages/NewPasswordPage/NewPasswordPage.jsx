import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NewPasswordPage.css';

import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const NewPasswordPage = () => {

    const navigate = useNavigate();

    const submithandleclick = () => {
        navigate('/');
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

                    <div className='underline'>
                    </div>

                </div>

                <div className='inputs'>

                    <div className='text_2'>
                        Please enter your new password.
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="" />
                        <input name='password' type="password" placeholder='Password' />
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="" />
                        <input name='confirm-password' type="password" placeholder='Confirm Password' />
                    </div>

                </div>

                <div className='submission-container' onClick={submithandleclick}>
                    Submit
                </div>

            </div>
        </div>
    );
};

export default NewPasswordPage;
