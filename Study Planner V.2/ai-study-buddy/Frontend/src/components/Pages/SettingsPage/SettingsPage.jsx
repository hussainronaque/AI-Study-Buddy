import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SettingsPage.css';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [recentNotes, setRecentNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentNotes();
    }, []);

    const fetchRecentNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/notes/recent', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentNotes(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching recent notes:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <main className='main'>

            <div className='sidebar'>

                <div className="sidebar-logo">
                    <img src={website_logo_transparent} alt="Logo"/>
                </div>

                <div className="sidebar-links">
                    <button className="nav-item active">Dashboard</button>
                    <button className="nav-item" onClick={() => navigate('/notes')}>Notes</button>
                    <button className="nav-item">Calendar</button>
                    <button className="nav-item">Tasks</button>
                    <button className="nav-item">AI Assistant</button>
                </div>

                <button className="sidebar-logout-btn" onClick={handleLogout}>
                    Logout
                </button>

            </div>
                
            <div className="dashboard">

                <div className="welcome-section">
                    <h1>Welcome to AI Study Buddy</h1>
                    <p>Manage your studies efficiently</p>
                </div>

                <div className="dashboard-grid">

                    <div className="dashboard-card">
                        <h3>Recent Notes</h3>
                        {loading ? (
                            <p>Loading notes...</p>
                        ) : recentNotes.length === 0 ? (
                            <p>No notes yet</p>
                        ) : (
                            <div className="recent-notes-list">
                                {recentNotes.map(note => (
                                    <div key={note._id} className="recent-note-item" onClick={() => navigate('/notes')}>
                                        <h4>{note.title}</h4>
                                        <p>{note.content.substring(0, 50)}...</p>
                                        <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        )}
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

            </div>
        
        </main>
    );
};

export default SettingsPage;