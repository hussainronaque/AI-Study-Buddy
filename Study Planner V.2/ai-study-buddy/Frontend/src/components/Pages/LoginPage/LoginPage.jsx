import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';
import { useNavigate } from 'react-router-dom';


const LoginPage = () => {

    // const [credentials, checkCredentials] = useState('')
    // const [password, checkPassword] = useState('')
    const navigate = useNavigate();
    const handleLogin = () => {
        // Perform login logic here
        // For example, you can send a request to your backend API for authentication
        // If successful, navigate to the dashboard
        navigate('/dashboard');
    };

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        // Initialize Google Sign-In
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
                    <div className='loginbutton' onClick={handleLogin}>
                        Login
                    </div>
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

export default LoginPage;
