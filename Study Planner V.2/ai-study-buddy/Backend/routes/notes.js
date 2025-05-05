const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// Get all notes for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes', error: err.message });
    }
});

// Create a new note
router.post('/', auth, async (req, res) => {
    try {
        const note = new Note({
            ...req.body,
            userId: req.user.id
        });
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: 'Error creating note', error: err.message });
    }
});

// Edit/update a note
router.put('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this note' });
        }
        Object.assign(note, req.body);
        await note.save();
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: 'Error updating note', error: err.message });
    }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note', error: err.message });
    }
});

module.exports = router; 