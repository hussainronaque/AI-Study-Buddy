import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Pages/LoginPage/LoginPage';
import SignUpPage from './components/Pages/SignUpPage/SignUpPage';
import ForgotPasswordPage from './components/Pages/ForgotPasswordPage/ForgotPasswordPage';
import OTPPage from './components/Pages/OTPPage/OTPPage';
import NewPasswordPage from './components/Pages/NewPasswordPage/NewPasswordPage';
import DashboardPage from './components/Pages/DashboardPage/DashboardPage';
import NotesPage from './components/Pages/NotesPage/NotesPage';
import SettingsPage from './components/Pages/SettingsPage/SettingsPage';
import SidebarLayout from './components/Layout/SidebarLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />

        {/* Protected Routes (nested under SidebarLayout) */}
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './components/Pages/LoginPage/LoginPage';
// import SignUpPage from './components/Pages/SignUpPage/SignUpPage';
// import ForgotPasswordPage from './components/Pages/ForgotPasswordPage/ForgotPasswordPage';
// import OTPPage from './components/Pages/OTPPage/OTPPage';
// import NewPasswordPage from './components/Pages/NewPasswordPage/NewPasswordPage';
// import DashboardPage from './components/Pages/DashboardPage/DashboardPage';
// import NotesPage from './components/Pages/NotesPage/NotesPage';
// import SettingsPage from './components/Pages/SettingsPage/SettingsPage'

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/login" element={<LoginPage />} /> {/* optional alias */}
//         <Route path="/signup" element={<SignUpPage />} />
//         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//         <Route path="/otp" element={<OTPPage />} />
//         <Route path="/new-password" element={<NewPasswordPage />} />
//         <Route path="/dashboard" element={<DashboardPage />} />
//         <Route path="/settings" element={<SettingsPage />} />
//         <Route path="/notes" element={<NotesPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
