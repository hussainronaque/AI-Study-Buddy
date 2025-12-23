import React from 'react';
import './NoteForm.css';

const NoteForm = ({ note, onNoteChange, onSubmit, categories, colors }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form className="note-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Note Title"
                value={note.title}
                onChange={(e) => onNoteChange({ ...note, title: e.target.value })}
                className="note-title-input"
                required
            />
            
            <textarea
                placeholder="Write your note here..."
                value={note.content}
                onChange={(e) => onNoteChange({ ...note, content: e.target.value })}
                className="note-content-input"
                required
                rows="4"
            />
            
            <div className="note-options">
                <select
                    value={note.category}
                    onChange={(e) => onNoteChange({ ...note, category: e.target.value })}
                    className="category-select"
                >
                    {categories.filter(cat => cat !== 'All').map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                
                <div className="color-picker">
                    {colors.map(color => (
                        <button
                            key={color}
                            type="button"
                            className={`color-option ${note.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => onNoteChange({ ...note, color })}
                        />
                    ))}
                </div>
            </div>
            
            <button type="submit" className="add-note-btn">
                Add New Note
            </button>
        </form>
    );
};

export default NoteForm;