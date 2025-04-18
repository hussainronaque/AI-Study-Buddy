import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotesPage.css';
import website_logo_transparent from '../../Assets/website-logo-transparent.png';

const NotesPage = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        category: 'Study',
        tags: [],
        color: '#ffffff'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showArchived, setShowArchived] = useState(false);

    const categories = ['All', 'Study', 'Personal', 'Work', 'Other'];
    const colors = ['#ffffff', '#ffcdd2', '#f8bbd0', '#e1bee7', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9'];

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/notes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching notes');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleAddNote = async () => {
        if (newNote.title.trim() && newNote.content.trim()) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('http://localhost:4000/api/notes', newNote, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotes([response.data, ...notes]);
                setNewNote({
                    title: '',
                    content: '',
                    category: 'Study',
                    tags: [],
                    color: '#ffffff'
                });
            } catch (error) {
                setError('Error creating note');
            }
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:4000/api/notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.filter(note => note._id !== id));
        } catch (error) {
            setError('Error deleting note');
        }
    };

    const handleTogglePin = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`http://localhost:4000/api/notes/${id}/toggle-pin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.map(note => 
                note._id === id ? response.data : note
            ));
        } catch (error) {
            setError('Error toggling pin status');
        }
    };

    const handleToggleArchive = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`http://localhost:4000/api/notes/${id}/toggle-archive`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotes(notes.map(note => 
                note._id === id ? response.data : note
            ));
        } catch (error) {
            setError('Error toggling archive status');
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
        const matchesArchive = showArchived ? note.isArchived : !note.isArchived;
        return matchesSearch && matchesCategory && matchesArchive;
    });

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-logo">
                    <img src={website_logo_transparent} alt="Logo" />
                </div>
                <div className="nav-links">
                    <button className="nav-item" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="nav-item active">Notes</button>
                    <button className="nav-item">Calendar</button>
                    <button className="nav-item">Tasks</button>
                    <button className="nav-item">AI Assistant</button>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            <main className="dashboard-main">
                <div className="notes-header">
                    <h1>My Notes</h1>
                    <div className="notes-controls">
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="category-select"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <button
                            className={`archive-toggle ${showArchived ? 'active' : ''}`}
                            onClick={() => setShowArchived(!showArchived)}
                        >
                            {showArchived ? 'Show Active' : 'Show Archived'}
                        </button>
                    </div>
                </div>

                <div className="notes-container">
                    <div className="notes-input-section">
                        <input
                            type="text"
                            placeholder="Note Title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            className="note-title-input"
                        />
                        <textarea
                            placeholder="Write your note here..."
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            className="note-content-input"
                        />
                        <div className="note-options">
                            <select
                                value={newNote.category}
                                onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                                className="category-select"
                            >
                                {categories.filter(cat => cat !== 'All').map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <div className="color-picker">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        className="color-option"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewNote({ ...newNote, color })}
                                    />
                                ))}
                            </div>
                        </div>
                        <button className="add-note-btn" onClick={handleAddNote}>Add New Note</button>
                    </div>

                    <div className="notes-list">
                        {loading ? (
                            <div className="loading">Loading notes...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : filteredNotes.length === 0 ? (
                            <div className="no-notes">No notes found</div>
                        ) : (
                            filteredNotes.map(note => (
                                <div
                                    key={note._id}
                                    className={`note-card ${note.isPinned ? 'pinned' : ''} ${note.isArchived ? 'archived' : ''}`}
                                    style={{ backgroundColor: note.color }}
                                >
                                    <div className="note-header">
                                        <h3>{note.title}</h3>
                                        <div className="note-actions">
                                            <button
                                                className="pin-btn"
                                                onClick={() => handleTogglePin(note._id)}
                                            >
                                                {note.isPinned ? '📌' : '📍'}
                                            </button>
                                            <button
                                                className="archive-btn"
                                                onClick={() => handleToggleArchive(note._id)}
                                            >
                                                {note.isArchived ? '📦' : '🗃️'}
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteNote(note._id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p>{note.content}</p>
                                    <div className="note-footer">
                                        <span className="note-category">{note.category}</span>
                                        <small>{new Date(note.updatedAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotesPage; 