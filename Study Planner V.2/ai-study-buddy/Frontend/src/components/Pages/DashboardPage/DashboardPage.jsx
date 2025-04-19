// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './DashboardPage.css';
// import ScheduleUpload from '../../Schedule/scheduleUpload';
// import { useAuth } from '../../../context/AuthContext';

// const DashboardPage = () => {
//     const navigate = useNavigate();
//     const { logout } = useAuth();
//     const [recentNotes, setRecentNotes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [imagePreviewUrl, setImagePreviewUrl] = useState('');
//     const [uploadedImage, setUploadedImage] = useState(null);

//     useEffect(() => {
//         fetchRecentNotes();
//     }, []);

//     const fetchRecentNotes = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get('http://localhost:4000/api/notes/recent', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setRecentNotes(response.data);
//             setLoading(false);
//         } catch (error) {
//             console.error('Error fetching recent notes:', error);
//             setLoading(false);
//         }
//     };

//     const handleLogout = () => {
//         logout();
//         navigate('/');
//     };

//     const handleUploadSuccess = (imageUrl) => {
//         setImagePreviewUrl(imageUrl);
//     };

//     return (
//         <main className='main'>

//             <div className="dashboard">

//                 <div className="welcome-section">
//                     <h1>Welcome to AI Study Buddy</h1>
//                     <p>Manage your studies efficiently</p>
//                 </div>

//                 <div className="dashboard-grid">

//                     <div className="dashboard-card">
//                         <h3>Recent Notes</h3>
//                         {loading ? (
//                             <p>Loading notes...</p>
//                         ) : recentNotes.length === 0 ? (
//                             <p>No notes yet</p>
//                         ) : (
//                             <div className="recent-notes-list">
//                                 {recentNotes.map(note => (
//                                     <div key={note._id} className="recent-note-item" onClick={() => navigate('/notes')}>
//                                         <h4>{note.title}</h4>
//                                         <p>{note.content.substring(0, 50)}...</p>
//                                         <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* Schedule Card */}
//                     <div className="dashboard-card schedule-section">
//                         <h3>Class Schedule</h3>
//                         {imagePreviewUrl ? (
//                             <div className="image-preview-module">
//                                 <img 
//                                     src={imagePreviewUrl} 
//                                     alt="Uploaded Schedule" 
//                                     className="uploaded-image-preview" 
//                                 />
//                             </div>
//                         ) : (
//                             <p>No schedule uploaded yet</p>
//                         )}
//                         <ScheduleUpload onUploadSuccess={handleUploadSuccess} />
//                     </div>

//                     <div className="dashboard-card">
//                         <h3>Upcoming Tasks</h3>
//                         <p>No tasks scheduled</p>
//                     </div>

//                     <div className="dashboard-card">
//                         <h3>Calendar Events</h3>
//                         <p>No upcoming events</p>
//                     </div>

//                     <div className="dashboard-card">
//                         <h3>AI Study Tips</h3>
//                         <p>Ask AI for study recommendations</p>
//                     </div>

//                 </div>

//                 {/* Image Preview Module */}
//                 {imagePreviewUrl && (
//                     <div className="image-preview-module">
//                         <h3>Schedule</h3>
//                         <img src={imagePreviewUrl} alt="Uploaded Schedule" className="uploaded-image-preview" />
//                     </div>
//                 )}

//                 {/* Upload Button */}
//                 <div className="upload-section">
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageUpload}
//                         id="image-upload"
//                         style={{ display: 'none' }}
//                     />
//                     <label htmlFor="image-upload" className="dashboard-upload-btn">
//                         Upload Schedule
//                     </label>
//                 </div>

//                 <div className="mb-6">
//                     <h2 className="text-xl font-semibold mb-4">Your Schedule</h2>
//                     <ScheduleUpload />
//                 </div>

//                     <div className="dashboard-card schedule-section">
//                         <h3>Class Schedule</h3>
//                         {imagePreviewUrl ? (
//                             <div className="image-preview-module">
//                                 <img 
//                                     src={imagePreviewUrl} 
//                                     alt="Uploaded Schedule" 
//                                     className="uploaded-image-preview" 
//                                 />
//                             </div>
//                         ) : (
//                             <p>No schedule uploaded yet</p>
//                         )}
//                         <ScheduleUpload onUploadSuccess={handleUploadSuccess} />
//                     </div>

//             </div>
        
//         </main>
//     );
// };

// export default DashboardPage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DashboardPage.css';
import ScheduleUpload from '../../Schedule/scheduleUpload';
import { useAuth } from '../../../context/AuthContext';
import { useCallback } from 'react';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [recentNotes, setRecentNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (token) {
            fetchRecentNotes();
        }
    }, [fetchRecentNotes, token]);

    const handleUploadSuccess = (imageUrl) => {
        setImagePreviewUrl(imageUrl);
    };


    return (
        <main className='main'>
            <div className="dashboard">
                <div className="welcome-section">
                    <h1>Welcome to AI Study Buddy</h1>
                    <p>Manage your studies efficiently</p>
                </div>

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

                    {/* Schedule Card */}
                    <div className="dashboard-card schedule-section">
                        <h3>Class Schedule</h3>
                        {imagePreviewUrl ? (
                            <div className="image-preview-module">
                                <img 
                                    src={imagePreviewUrl} 
                                    alt="Uploaded Schedule" 
                                    className="uploaded-image-preview" 
                                />
                            </div>
                        ) : (
                            <p>No schedule uploaded yet</p>
                        )}
                        <ScheduleUpload onUploadSuccess={handleUploadSuccess} />
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

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './DashboardPage.css';
// import website_logo_transparent from '../../Assets/website-logo-transparent.png';

// const DashboardPage = () => {
//     const navigate = useNavigate();
//     const [recentNotes, setRecentNotes] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchRecentNotes();
//     }, []);

//     const fetchRecentNotes = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get('http://localhost:4000/api/notes/recent', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setRecentNotes(response.data);
//             setLoading(false);
//         } catch (error) {
//             console.error('Error fetching recent notes:', error);
//             setLoading(false);
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         navigate('/');
//     };

//     return (
//         <div className="dashboard-container">
//             <nav className="dashboard-nav">
//                 <div className="nav-logo">
//                     <img src={website_logo_transparent} alt="Logo" />
//                 </div>
//                 <div className="nav-links">
//                     <button className="nav-item active">Dashboard</button>
//                     <button className="nav-item" onClick={() => navigate('/notes')}>Notes</button>
//                     <button className="nav-item">Calendar</button>
//                     <button className="nav-item">Tasks</button>
//                     <button className="nav-item">AI Assistant</button>
//                 </div>
//                 <button className="logout-btn" onClick={handleLogout}>
//                     Logout
//                 </button>
//             </nav>

//             <main className="dashboard-main">
//                 <div className="welcome-section">
//                     <h1>Welcome to AI Study Buddy</h1>
//                     <p>Manage your studies efficiently</p>
//                 </div>

//                 <div className="dashboard-grid">
//                     <div className="dashboard-card">
//                         <h3>Recent Notes</h3>
//                         {loading ? (
//                             <p>Loading notes...</p>
//                         ) : recentNotes.length === 0 ? (
//                             <p>No notes yet</p>
//                         ) : (
//                             <div className="recent-notes-list">
//                                 {recentNotes.map(note => (
//                                     <div key={note._id} className="recent-note-item" onClick={() => navigate('/notes')}>
//                                         <h4>{note.title}</h4>
//                                         <p>{note.content.substring(0, 50)}...</p>
//                                         <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                         <button className="add-note-btn" onClick={() => navigate('/notes')}>Add New Note</button>
//                     </div>
//                     <div className="dashboard-card">
//                         <h3>Upcoming Tasks</h3>
//                         <p>No tasks scheduled</p>
//                     </div>
//                     <div className="dashboard-card">
//                         <h3>Calendar Events</h3>
//                         <p>No upcoming events</p>
//                     </div>
//                     <div className="dashboard-card">
//                         <h3>AI Study Tips</h3>
//                         <p>Ask AI for study recommendations</p>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default DashboardPage;