import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotesPage.css';
import './NotesPage.css';
import NoteCard from '../../Notes/NoteCard.jsx';
import NoteForm from '../../Notes/NoteForm.jsx';
import { useAuth } from '../../../context/AuthContext';


const NotesPage = () => {
    const { token } = useAuth();
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
    }, [token]);

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
        <div className="dashboard-main">
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
                <NoteForm 
                    note={newNote}
                    onNoteChange={setNewNote}
                    onSubmit={handleAddNote}
                    categories={categories}
                    colors={colors}
                />

                <div className="notes-list">
                    {loading ? (
                        <div className="loading">Loading notes...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="no-notes">No notes found</div>
                    ) : (
                        filteredNotes.map(note => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onPin={handleTogglePin}
                                onArchive={handleToggleArchive}
                                onDelete={handleDeleteNote}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotesPage;