import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudyPlanPage.css';
import { useAuth } from '../../../context/AuthContext';
import { studyPlansApi, aiStudyPlanApi } from '../../../utils/api';
import ScheduleUpload from '../../../components/ScheduleUpload/ScheduleUpload';

const StudyPlanPage = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studyPlans, setStudyPlans] = useState([]);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [currentScheduleId, setCurrentScheduleId] = useState(null);
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [planNumber, setPlanNumber] = useState(1);
    const [tasks, setTasks] = useState([{ name: '', end_time: '' }]);
    const [hasUploadedSchedule, setHasUploadedSchedule] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [editingTasks, setEditingTasks] = useState([]);
    const [aiGeneratedPlans, setAiGeneratedPlans] = useState({});
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    // Fetch study plans
    const fetchStudyPlans = useCallback(async () => {
        try {
            const response = await studyPlansApi.getPlans(token);
            setStudyPlans(response);
            setLoading(false);
            
            // Fetch AI-generated plans for each study plan
            response.forEach(plan => {
                fetchAiGeneratedPlan(plan.userId || user?._id);
            });
        } catch (err) {
            console.error('Error fetching study plans:', err);
            setError('Failed to fetch study plans');
            setLoading(false);
        }
    }, [token, user]);

    // Fetch AI-generated study plan from ai_gens collection
    const fetchAiGeneratedPlan = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/ai_gens/study_plan/${userId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.content) {
                setAiGeneratedPlans(prev => ({
                    ...prev,
                    [userId]: response.data.content
                }));
            }
        } catch (error) {
            console.error('Error fetching AI-generated study plan:', error);
            // Don't set the global error state, just log the error
        }
    };

    useEffect(() => {
        if (token) {
            fetchStudyPlans();
        }
    }, [fetchStudyPlans, token]);

    useEffect(() => {
        // Fetch AI plan for the current user if they exist
        if (user && user._id) {
            fetchAiGeneratedPlan(user._id);
        }
    }, [user, token]);

    const fetchUserSchedule = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/schedules', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data && response.data.length > 0) {
                const mostRecentSchedule = response.data[0];
                setImagePreviewUrl(mostRecentSchedule.imageUrl);
                setCurrentScheduleId(mostRecentSchedule._id);
                setHasUploadedSchedule(true);
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
            setError('Error fetching schedule');
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchUserSchedule();
            // Remove the non-existent endpoint call
            setPlanNumber(1); // Start with plan number 1
        }
    }, [fetchUserSchedule, token]);

    const handleUploadSuccess = (response) => {
        console.log('Upload success response:', response);

        if (!response) {
            console.error('No response received from upload');
            setError('No response received from upload');
            return;
        }

        const { imageUrl, schedule } = response;

        if (!imageUrl) {
            console.error('No image URL in response:', response);
            setError('Failed to get image URL from upload');
            return;
        }

        setImagePreviewUrl(imageUrl);
        if (schedule && schedule._id) {
            setCurrentScheduleId(schedule._id);
        }
        setHasUploadedSchedule(true);
        setError(null);
    };

    const handleCreatePlan = () => {
        setIsCreatingPlan(true);
    };

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...tasks];
        newTasks[index] = {
            ...newTasks[index],
            [field]: value
        };
        setTasks(newTasks);
    };

    const addTask = () => {
        setTasks([...tasks, { name: '', end_time: '' }]);
    };

    const removeTask = (index) => {
        if (tasks.length > 1) {
            const newTasks = tasks.filter((_, i) => i !== index);
            setTasks(newTasks);
        }
    };

    const handleSavePlan = async () => {
        try {
            const planData = {
                tasks: tasks,
                scheduleImage: imagePreviewUrl
            };

            const response = await studyPlansApi.createPlan(token, planData);
            console.log('Save plan response:', response);

            setIsCreatingPlan(false);
            setTasks([{ name: '', end_time: '' }]);
            setImagePreviewUrl('');
            setHasUploadedSchedule(false);
            alert('Study plan saved successfully!');
            
            // Refresh the study plans list
            fetchStudyPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
            console.error('Error response:', error.response?.data);
            setError('Error saving plan: ' + (error.response?.data?.message || error.message));
            alert('Failed to save plan: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditPlan = (plan) => {
        setEditingPlanId(plan._id);
        setEditingTasks([...plan.tasks]);
    };

    const handleCancelEdit = () => {
        setEditingPlanId(null);
        setEditingTasks([]);
    };

    const handleEditTaskChange = (index, field, value) => {
        const newTasks = [...editingTasks];
        newTasks[index] = {
            ...newTasks[index],
            [field]: value
        };
        setEditingTasks(newTasks);
    };

    const handleAddTaskToExisting = () => {
        setEditingTasks([...editingTasks, { name: '', end_time: '' }]);
    };

    const handleRemoveTaskFromExisting = (index) => {
        const newTasks = editingTasks.filter((_, i) => i !== index);
        setEditingTasks(newTasks);
    };

    const handleSaveEdit = async (planId) => {
        try {
            // Filter out empty tasks
            const validTasks = editingTasks.filter(task => task.name && task.end_time);
            
            if (validTasks.length === 0) {
                alert('Please add at least one task');
                return;
            }

            await studyPlansApi.updatePlan(token, planId, { tasks: validTasks });
            setEditingPlanId(null);
            setEditingTasks([]);
            fetchStudyPlans(); // Refresh the list
            alert('Study plan updated successfully!');
        } catch (error) {
            console.error('Error updating plan:', error);
            alert('Failed to update plan: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeletePlan = async (planId) => {
        if (window.confirm('Are you sure you want to delete this study plan? This action cannot be undone.')) {
            try {
                await studyPlansApi.deletePlan(token, planId);
                fetchStudyPlans(); // Refresh the list
                alert('Study plan deleted successfully!');
            } catch (error) {
                console.error('Error deleting plan:', error);
                alert('Failed to delete plan: ' + (error.response?.data?.message || error.message));
            }
        }
    };

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

    // Get the AI-generated study plan content for a specific user
    const getAiPlanContent = (userId) => {
        return aiGeneratedPlans[userId || user?._id] || "Loading AI-generated study plan...";
    };

    // Regenerate AI plan trigger
    const handleRegenerateAiPlan = async (userId) => {
        try {
            setNotificationMessage("Regenerating study plan...");
            setShowNotification(true);
            
            const response = await aiStudyPlanApi.generateStudyPlan(token, { userId: userId || user?._id });
            
            if (response && response.success) {
                setNotificationMessage("Study plan regeneration started. This may take a minute.");
                // Poll for the new study plan after a short delay
                setTimeout(() => {
                    fetchAiGeneratedPlan(userId || user?._id);
                    setShowNotification(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Error regenerating AI study plan:', error);
            setNotificationMessage('Failed to regenerate AI study plan');
            setTimeout(() => setShowNotification(false), 3000);
        }
    };

    return (
        <main className='main'>
            {/* Add the notification overlay */}
            {showNotification && (
                <div className="notification-overlay show" />
            )}
            
            <div className="dashboard">
                <div className="welcome-section">
                    <h1>Study Plans</h1>
                    <p>Organize and track your study sessions</p>
                </div>

                {!isCreatingPlan ? (
                    <>
                        <div className="create-plan-section">
                            <button 
                                className="create-plan-btn"
                                onClick={handleCreatePlan}
                            >
                                Create Study Plan
                            </button>
                        </div>

                        {/* Display existing study plans */}
                        <div className="study-plans-list">
                            {loading ? (
                                <p>Loading study plans...</p>
                            ) : error ? (
                                <p className="error-message">{error}</p>
                            ) : studyPlans.length === 0 ? (
                                <p>No study plans created yet.</p>
                            ) : (
                                studyPlans.map((plan, index) => (
                                    <div key={plan._id} className="study-plan-card">
                                        <div className="study-plan-header">
                                            <h3>Study Plan #{studyPlans.length - index}</h3>
                                            <div className="study-plan-actions">
                                                <span className="created-at">
                                                    Created: {formatDate(plan.createdAt)}
                                                </span>
                                                <button 
                                                    className="delete-plan-btn"
                                                    onClick={() => handleDeletePlan(plan._id)}
                                                >
                                                    Delete Plan
                                                </button>
                                            </div>
                                        </div>
                                        <div className="study-plan-content">
                                            <div className="schedule-image">
                                                <img 
                                                    src={plan.scheduleImage} 
                                                    alt="Study Schedule" 
                                                    className="schedule-preview-image"
                                                />
                                            </div>
                                            <div className="ai-plan-section">
                                                <div className="ai-plan-header">
                                                    <h4>AI-Generated Study Schedule</h4>
                                                    <div style={{ position: 'relative' }}>
                                                        {showNotification && (
                                                            <div className="regenerate-notification show">
                                                                {notificationMessage}
                                                            </div>
                                                        )}
                                                        <button 
                                                            className="regenerate-ai-plan-btn"
                                                            onClick={() => handleRegenerateAiPlan(plan.userId)}
                                                        >
                                                            Regenerate
                                                        </button>
                                                    </div>
                                                </div>
                                                <textarea 
                                                    readOnly
                                                    className="static-text-display"
                                                    value={getAiPlanContent(plan.userId)}
                                                />
                                            </div>
                                            <div className="tasks-list">
                                                <div className="tasks-header">
                                                    <h4>Tasks:</h4>
                                                    {editingPlanId !== plan._id && (
                                                        <button 
                                                            className="edit-tasks-btn"
                                                            onClick={() => handleEditPlan(plan)}
                                                        >
                                                            Edit Tasks
                                                        </button>
                                                    )}
                                                </div>
                                                {editingPlanId === plan._id ? (
                                                    <div className="edit-tasks-section">
                                                        {editingTasks.map((task, taskIndex) => (
                                                            <div key={taskIndex} className="task-input-group">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Task name"
                                                                    value={task.name}
                                                                    onChange={(e) => handleEditTaskChange(taskIndex, 'name', e.target.value)}
                                                                    className="task-input"
                                                                />
                                                                <input
                                                                    type="datetime-local"
                                                                    value={task.end_time ? new Date(task.end_time).toISOString().slice(0, 16) : ''}
                                                                    onChange={(e) => handleEditTaskChange(taskIndex, 'end_time', e.target.value)}
                                                                    className="task-deadline"
                                                                />
                                                                <button 
                                                                    className="remove-task-btn"
                                                                    onClick={() => handleRemoveTaskFromExisting(taskIndex)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <div className="edit-tasks-actions">
                                                            <button 
                                                                className="add-task-btn"
                                                                onClick={handleAddTaskToExisting}
                                                            >
                                                                Add Task
                                                            </button>
                                                            <div className="edit-control-buttons">
                                                                <button 
                                                                    className="save-edit-btn"
                                                                    onClick={() => handleSaveEdit(plan._id)}
                                                                >
                                                                    Save Changes
                                                                </button>
                                                                <button 
                                                                    className="cancel-edit-btn"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <ul>
                                                        {plan.tasks.map((task, taskIndex) => (
                                                            <li key={taskIndex} className="task-item">
                                                                <span className="task-name">{task.name}</span>
                                                                <span className="task-deadline">
                                                                    Due: {formatDate(task.end_time)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="plan-creation-flow">
                        <div className="plan-editor">
                            <div className="plan-header">
                                <h2>Study Plan #{planNumber}</h2>
                            </div>

                            <div className="schedule-upload-section">
                                <h3>Upload Your Schedule</h3>
                                <ScheduleUpload onUploadSuccess={handleUploadSuccess} />
                                {imagePreviewUrl && (
                                    <div className="schedule-preview">
                                        <img 
                                            src={imagePreviewUrl} 
                                            alt="Uploaded Schedule" 
                                            className="uploaded-image-preview" 
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="tasks-section">
                                <h3>Tasks</h3>
                                {tasks.map((task, index) => (
                                    <div key={index} className="task-input-group">
                                        <input
                                            type="text"
                                            placeholder="Task name"
                                            value={task.name}
                                            onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                                            className="task-input"
                                        />
                                        <input
                                            type="datetime-local"
                                            value={task.end_time}
                                            onChange={(e) => handleTaskChange(index, 'end_time', e.target.value)}
                                            className="task-deadline"
                                        />
                                        {tasks.length > 1 && (
                                            <button 
                                                className="remove-task-btn"
                                                onClick={() => removeTask(index)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    className="add-task-btn"
                                    onClick={addTask}
                                >
                                    Add Another Task
                                </button>
                            </div>

                            <div className="plan-actions">
                                <button 
                                    className="save-plan-btn"
                                    onClick={handleSavePlan}
                                    disabled={!hasUploadedSchedule || tasks.some(task => !task.name || !task.end_time)}
                                >
                                    Save Plan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default StudyPlanPage;