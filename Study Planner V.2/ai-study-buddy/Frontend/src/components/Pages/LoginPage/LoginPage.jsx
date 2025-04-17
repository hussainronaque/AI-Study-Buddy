import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../../config';
import './LoginPage.css';

import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${config.API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback((response) => {
    if (response.credential) {
      // Handle Google sign-in token
      console.log('Google Sign-In successful');
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: config.GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
        });

        window.google.accounts.id.renderButton(
          document.getElementById('my-signin2'),
          {
            theme: 'outline',
            size: 'large',
            width: 240,
            type: 'standard',
          }
        );
      }
    };

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
  }, [isScriptLoaded, handleGoogleSignIn]);

  return (
    <div className="page-container">
      <div className="website-logo">
        <img src={website_logo_transparent} alt="Logo" />
      </div>

      <div className="content-container">
        <div className="header">
          <div className="text">Login</div>
          <div className="underline"></div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="inputs">
            <div className="input">
              <img src={email_icon} alt="email" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input">
              <img src={password_icon} alt="password" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <div className="login-prompt">
            <Link to="/signup">Don't have an account? Sign Up</Link>
          </div>

          <button 
            type="submit" 
            className="signup-container"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div className="or">OR</div>
        </div>

        <div className="google-signin-container">
          <div id="my-signin2"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;