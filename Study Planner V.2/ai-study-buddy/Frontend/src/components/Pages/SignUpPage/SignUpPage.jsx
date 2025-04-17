import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import './SignUpPage.css';
import user_icon from '../../Assets/person.png';
import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';
import back_arrow from '../../Assets/Back-Arrow.png';

const SignUpPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = useCallback((response) => {
    if (response.credential) {
      console.log('Google Sign-In successful');
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_CLIENT_ID_HERE',
          callback: handleGoogleSignIn,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('my-signin2'),
          { theme: 'outline', size: 'large' }
        );
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [handleGoogleSignIn]);

  const submithandleclick = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('/api/auth/signup', {
        username,
        email,
        password,
      });

      if (res.data.message === 'User created successfully') {
        navigate('/login');
      } else {
        setError(res.data.message || 'Sign up failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    }
  };

  return (
    <div className="page-container">
      <Link to="/" className="back-button">
        <img src={back_arrow} alt="Back" />
      </Link>

      <div className="website-logo">
        <img src={website_logo_transparent} alt="Logo" />
      </div>

      <div className="content-container">
        <div className="header">
          <div className="text">Sign Up</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          <div className="input">
            <img src={user_icon} alt="user" />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="input">
            <img src={email_icon} alt="email" />
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input">
            <img src={password_icon} alt="password" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="input">
            <img src={password_icon} alt="confirm" />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

        <div className="login-prompt">
          <Link to="/login">Already Have An Account? Login!</Link>
        </div>

        <div className="signup-container" onClick={submithandleclick}>
          Sign Up
        </div>

        <div className="or">OR</div>

        <div id="my-signin2"></div>
      </div>
    </div>
  );
};

export default SignUpPage;
