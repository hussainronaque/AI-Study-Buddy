import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';

import user_icon from '../../Assets/person.png';
import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import website_logo from '../../Assets/website-logo.jpeg'
import back_arrow from '../../Assets/Back-Arrow.png'

const ForgotPasswordPage = () => {

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
                        Please enter your Email or Username for password verification.
                    </div>

                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input type="text" placeholder='Username Or Email'/>
                    </div>
                </div>

                <div className='forgot-container'>
                    <div className='submitbutton' onClick={()=>{}}>
                        Submit
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
