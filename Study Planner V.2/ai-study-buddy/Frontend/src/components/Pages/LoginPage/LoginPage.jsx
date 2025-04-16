import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

import email_icon from '../../Assets/email.png';
import password_icon from '../../Assets/password.png';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (res.data.token) {
        // Optionally store token: localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid login credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleGoogleSignIn = (response) => {
    if (response.credential) {
      console.log('Google Sign-In successful');
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '717882539289-j5pfmv17tg1gbnrtncbajehdjjjreenf.apps.googleusercontent.com',
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
  }, [isScriptLoaded]);

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

        <div className="inputs">
          <div className="input">
            <img src={email_icon} alt="email" />
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input">
            <img src={password_icon} alt="password" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <div className="login-prompt">
          <Link to="/signup">Don’t have an account? Sign Up</Link>
        </div>

        <div className="signup-container" onClick={handleLogin}>
          Login
        </div>

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
