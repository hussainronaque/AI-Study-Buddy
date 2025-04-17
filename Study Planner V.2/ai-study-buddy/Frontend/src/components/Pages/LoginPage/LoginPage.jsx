import React, { useState } from 'react';
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

  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid login credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

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
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input">
            <img src={password_icon} alt="password" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

        <div className="login-prompt">
          <Link to="/signup">Don't have an account? Sign Up</Link>
        </div>

        <div className="signup-container" onClick={handleLogin}>
          Login
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
