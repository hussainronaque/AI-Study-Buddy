import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';

const DashboardPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-logo">
                    <img src={website_logo_transparent} alt="Logo" />
                </div>
                <div className="nav-links">
                    <button className="nav-item active">Dashboard</button>
                    <button className="nav-item">Notes</button>
                    <button className="nav-item">Calendar</button>
                    <button className="nav-item">Tasks</button>
                    <button className="nav-item">AI Assistant</button>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            <main className="dashboard-main">
                <div className="welcome-section">
                    <h1>Welcome to AI Study Buddy</h1>
                    <p>Manage your studies efficiently</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Recent Notes</h3>
                        <p>No notes yet</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Upcoming Tasks</h3>
                        <p>No tasks scheduled</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Calendar Events</h3>
                        <p>No upcoming events</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>AI Study Tips</h3>
                        <p>Ask AI for study recommendations</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;