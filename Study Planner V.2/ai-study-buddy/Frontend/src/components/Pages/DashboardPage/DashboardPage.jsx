import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashboardPage.css';
import { useAuth } from '../../../context/AuthContext';
import { studyPlansApi } from '../../../utils/api';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [recentNotes, setRecentNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studyPlan, setStudyPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchRecentNotes = useCallback(async () => {
        try {
            console.log('Fetching recent notes...');
            const response = await axios.get('http://localhost:4000/api/notes/recent', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Recent notes received:', response.data);
            setRecentNotes(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching recent notes:', error);
            setError('Error fetching notes');
            setLoading(false);
        }
    }, [token]);

    const fetchLatestStudyPlan = useCallback(async () => {
        try {
            const response = await studyPlansApi.getPlans(token);
            if (response && response.length > 0) {
                setStudyPlan(response[0]); // Get the most recent plan
            }
            setLoadingPlan(false);
        } catch (error) {
            console.error('Error fetching study plan:', error);
            setLoadingPlan(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchRecentNotes();
            fetchLatestStudyPlan();
        }
    }, [fetchRecentNotes, fetchLatestStudyPlan, token]);

    return (
        <main className='main'>
            <div className="dashboard">
                <div className="welcome-section">
                    <h1>Welcome to AI Study Buddy</h1>
                    <p>Manage your studies efficiently</p>
                </div>

                {/* Study Plan Preview Window */}
                {studyPlan ? (
                    <div className="study-plan-preview">
                        <div className="study-plan-header">
                            <h2>Latest Study Plan</h2>
                        </div>
                        <div className="study-plan-content">
                            {loadingPlan ? (
                                <p>Loading study plan...</p>
                            ) : (
                                <div className="active-plan">
                                    <div className="plan-details">
                                        <div className="plan-schedule">
                                            <img 
                                                src={studyPlan.scheduleImage} 
                                                alt="Study Schedule" 
                                                className="schedule-preview-image"
                                            />
                                        </div>
                                        <div className="plan-tasks">
                                            <h3>Tasks:</h3>
                                            <ul className="tasks-preview-list">
                                                {studyPlan.tasks.map((task, index) => (
                                                    <li key={index} className="task-preview-item">
                                                        <span className="task-name">{task.name}</span>
                                                        <span className="task-deadline">
                                                            Due: {formatDate(task.end_time)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <button 
                                        className="view-plan-btn"
                                        onClick={() => navigate('/study-plans')}
                                    >
                                        View All Plans
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="study-plan-preview">
                        <div className="no-plan">
                            <p>You haven't created a study plan yet. Create one to start organizing your study sessions effectively!</p>
                            <button 
                                className="create-plan-btn"
                                onClick={() => navigate('/study-plans')}
                            >
                                Create New Plan
                            </button>
                        </div>
                    </div>
                )}

                <div className="dashboard-grid">
                    {/* Recent Notes Card */}
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

                    {/* Other Dashboard Cards */}
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

export default DashboardPage;