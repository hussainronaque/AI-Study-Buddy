import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignUpPage.css';

import user_icon from '../../Assets/person.png';
import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import website_logo from '../../Assets/website-logo.jpeg'
import back_arrow from '../../Assets/Back-Arrow.png'

const SignUpPage = () => {
    const [action, setAction] = useState("Sign Up");

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
                        Sign Up
                    </div>

                    <div className='underline'>
                    </div>

                </div>

                <div className='inputs'>

                    <div className='input'>
                        <img src={user_icon} alt="" />
                        <input type="text" placeholder='Name'/>
                    </div>

                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input type="text" placeholder='Username Or Email'/>
                    </div>

                    <div className='input'>
                        <img src={password_icon} alt="" />
                        <input type="password" placeholder='Password' />
                    </div>

                </div>

                <div className='signup-container'>
                    <div className='signupbutton' onClick={()=>{}}>
                        Sign Up
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
