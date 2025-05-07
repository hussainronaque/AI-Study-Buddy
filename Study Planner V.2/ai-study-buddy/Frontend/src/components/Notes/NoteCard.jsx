import React from 'react';
import './NoteCard.css';

const NoteCard = ({ note, onPin, onArchive, onDelete }) => {
    return (
        <div 
            className={`note-card ${note.isPinned ? 'pinned' : ''} ${note.isArchived ? 'archived' : ''}`}
            style={{ backgroundColor: note.color }}
        >
            <div className="note-header">
                <h3>{note.title}</h3>
                <div className="note-actions">
                    <button 
                        className="action-btn delete-btn" 
                        onClick={() => onDelete(note._id)}
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </div>
            <p className="note-content">{note.content}</p>
            <div className="note-footer">
                <span className="note-category">{note.category}</span>
                <small className="note-date">
                    {new Date(note.updatedAt).toLocaleDateString()}
                </small>
            </div>
        </div>
    );
};

export default NoteCard;