import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';

const LoginPage = () => {

    return (
        <div className='page-container'>

            <div className='website-logo'>
                <img src={website_logo_transparent} alt="" />
            </div>
            
            <div className='content-container'>

                <div className='header'>

                    <div className='text'>
                        Login
                    </div>

                    <div className='underline'>
                    </div>

                </div>

                <div className='inputs'>
                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input name='email-username' type="text" placeholder='Username Or Email'/>
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="" />
                        <input name='password' type="password" placeholder='Password' />
                    </div>

                </div>
            
                <div className='forgot-password'>
                    <Link to="/forgot-password">Forgot Password?</Link> 
                </div>

                <div className='signup-prompt'>
                    <Link to="/signup">Don't Already Have An Account? Sign Up!</Link> 
                </div>

                <div className='login-container'>
                    <div className='loginbutton' onClick={()=>{}}>
                        Login
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
