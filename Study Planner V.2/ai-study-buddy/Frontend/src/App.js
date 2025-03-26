import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Pages/LoginPage/LoginPage';
import SignUpPage from './components/Pages/SignUpPage/SignUpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/homepage" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
