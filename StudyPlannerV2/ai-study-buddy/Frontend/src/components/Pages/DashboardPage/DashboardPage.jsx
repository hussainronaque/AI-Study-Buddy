import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashboardPage.css';
import { useAuth } from '../../../context/AuthContext';
import { studyPlansApi, todosApi } from '../../../utils/api';
import config from '../../../config';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [recentNotes, setRecentNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studyPlan, setStudyPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loadingTodos, setLoadingTodos] = useState(true);

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
            const response = await axios.get(`${config.API_URL}/api/notes`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            // Get only the 5 most recent notes
            setRecentNotes(response.data.slice(0, 5));
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
                setStudyPlan(response[0]);
            }
            setLoadingPlan(false);
        } catch (error) {
            console.error('Error fetching study plan:', error);
            setLoadingPlan(false);
        }
    }, [token]);

    const fetchTodos = useCallback(async () => {
        try {
            const response = await todosApi.getAllTodos(token);
            setTodos(response);
            setLoadingTodos(false);
        } catch (error) {
            console.error('Error fetching todos:', error);
            setLoadingTodos(false);
        }
    }, [token]);

    const addTodo = async (e) => {
        e.preventDefault();
        if (newTodo.trim()) {
            try {
                console.log('Creating todo:', { text: newTodo });
                const response = await todosApi.createTodo(token, { text: newTodo });
                console.log('Todo created:', response);
                setTodos([response, ...todos]);
                setNewTodo('');
            } catch (error) {
                console.error('Error creating todo:', error.response?.data || error);
                alert('Failed to create todo. Please try again.');
            }
        }
    };

    const toggleTodo = async (id) => {
        try {
            const todo = todos.find(t => t._id === id);
            console.log('Toggling todo:', { id, currentState: todo.completed });
            const response = await todosApi.updateTodo(token, id, { completed: !todo.completed });
            console.log('Todo updated:', response);
            setTodos(todos.map(t => t._id === id ? response : t));
        } catch (error) {
            console.error('Error updating todo:', error.response?.data || error);
            alert('Failed to update todo. Please try again.');
        }
    };

    const deleteTodo = async (id) => {
        try {
            console.log('Deleting todo:', id);
            await todosApi.deleteTodo(token, id);
            console.log('Todo deleted successfully');
            setTodos(todos.filter(todo => todo._id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error.response?.data || error);
            alert('Failed to delete todo. Please try again.');
        }
    };

    useEffect(() => {
        if (token) {
            fetchRecentNotes();
            fetchLatestStudyPlan();
            fetchTodos();
        }
    }, [fetchRecentNotes, fetchLatestStudyPlan, fetchTodos, token]);

    return (
        <main className='main'>
            <div className="dashboard">
                <div className="welcome-section">
                    <h1>Welcome to AI Study Buddy</h1>
                    <p>Manage your studies efficiently</p>
                </div>

                <div className="dashboard-grid">
                    {/* Quick Stats Section */}
                    <div className="dashboard-card stats-card">
                        <h3>Quick Stats</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{recentNotes.length}</span>
                                <span className="stat-label">Notes</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{todos.filter(t => t.completed).length}</span>
                                <span className="stat-label">Completed Tasks</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{studyPlan ? 'Active' : 'None'}</span>
                                <span className="stat-label">Study Plan</span>
                            </div>
                        </div>
                    </div>

                    {/* To-Do Section */}
                    <div className="dashboard-card todo-card">
                        <h3>Quick To-Do</h3>
                        <form onSubmit={addTodo} className="todo-form">
                            <input
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                placeholder="Add a new task..."
                                className="todo-input"
                            />
                            <button type="submit" className="add-todo-btn">Add</button>
                        </form>
                        <div className="todo-list">
                            {loadingTodos ? (
                                <p>Loading todos...</p>
                            ) : todos.length === 0 ? (
                                <p>No todos yet</p>
                            ) : (
                                todos.map(todo => (
                                    <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => toggleTodo(todo._id)}
                                        />
                                        <span className="todo-text">{todo.text}</span>
                                        <button onClick={() => deleteTodo(todo._id)} className="delete-todo-btn">×</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Notes Section */}
                    <div className="dashboard-card notes-card">
                        <h3>Recent Notes</h3>
                        <div className="recent-notes-list">
                            {loading ? (
                                <p>Loading notes...</p>
                            ) : error ? (
                                <p>{error}</p>
                            ) : recentNotes.length > 0 ? (
                                recentNotes.map(note => (
                                    <div key={note._id} className="recent-note-item" onClick={() => navigate('/notes')}>
                                        <h4>{note.title}</h4>
                                        <p>{note.content.substring(0, 100)}...</p>
                                        <small>{formatDate(note.createdAt)}</small>
                                    </div>
                                ))
                            ) : (
                                <p>No recent notes</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Study Plan Section - Moved to bottom */}
                <div className="study-plan-section">
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
                </div>
            </div>
        </main>
    );
};

export default DashboardPage;