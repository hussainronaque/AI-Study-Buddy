import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Pages/LoginPage/LoginPage';
import SignUpPage from './components/Pages/SignUpPage/SignUpPage';
import ForgotPasswordPage from './components/Pages/ForgotPasswordPage/ForgotPasswordPage';
import OTPPage from './components/Pages/OTPPage/OTPPage';
import NewPasswordPage from './components/Pages/NewPasswordPage/NewPasswordPage';
import DashboardPage from './components/Pages/DashboardPage/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
        <Route path="/OTP" element={<OTPPage/>} />
        <Route path="/new-password" element={<NewPasswordPage/>} />
        <Route path="/homepage" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
