import React, { useState , useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUpPage.css';

import user_icon from '../../Assets/person.png';
import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png'
import back_arrow from '../../Assets/Back-Arrow.png'

const SignUpPage = () => {
    const navigate = useNavigate();
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {

    const initializeGoogleSignIn = () => {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: '717882539289-j5pfmv17tg1gbnrtncbajehdjjjreenf.apps.googleusercontent.com',
                callback: handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true,
                ux_mode: 'popup',  // Add this line
            });
            window.google.accounts.id.renderButton(
                document.getElementById('my-signin2'),
                { 
                    theme: 'outline', 
                    size: 'large', 
                    width: 240,
                    type: 'standard'  // Add this line
                }
            );
        }
    };

        const handleGoogleSignIn = (response) => {
            if (response.credential) {
                console.log('Google Sign-In successful');
                navigate('/dashboard');
            }
        };

        // Load the Google Sign-In script if not already loaded
        if (!isScriptLoaded) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setIsScriptLoaded(true);
                initializeGoogleSignIn();
            };
            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        } else {
            initializeGoogleSignIn();
        }
    }, [navigate, isScriptLoaded]);

    const submithandleclick = () => {
        navigate('/');
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
                        Sign Up
                    </div>

                    <div className='underline'>
                    </div>

                </div>

                <div className='inputs'>

                    <div className='input'>
                        <img src={user_icon} alt="" />
                        <input name= 'username' type="text" placeholder='Name'/>
                    </div>

                    <div className='input'>
                        <img src={email_icon} alt="" />
                        <input name='email' type="text" placeholder='Email'/>
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

                <div className='login-prompt'>
                    <Link to="/">Already Have An Account? Login!</Link>
                </div>

                <div className='signup-container' onClick={submithandleclick}>
                    Sign Up
                </div>

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <div className='or'>
                        OR
                    </div>
                </div>
                
                <div className="google-signin-container">
                    <div id="my-signin2"></div>
                </div>
                
            </div>
        </div>
    );
};

export default SignUpPage;
