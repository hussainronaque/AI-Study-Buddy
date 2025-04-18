const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// Get all notes for a user
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id })
            .sort({ isPinned: -1, updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

// Get recent notes for dashboard
router.get('/recent', auth, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .limit(5);
        res.json(notes);
    } catch (error) {
        console.error('Error fetching recent notes:', error);
        res.status(500).json({ message: 'Error fetching recent notes' });
    }
});

// Create a new note
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, category, tags, color } = req.body;
        const note = new Note({
            userId: req.user.id,
            title,
            content,
            category,
            tags,
            color
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: 'Error creating note' });
    }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const { title, content, category, tags, color, isPinned, isArchived } = req.body;
        note.title = title || note.title;
        note.content = content || note.content;
        note.category = category || note.category;
        note.tags = tags || note.tags;
        note.color = color || note.color;
        note.isPinned = isPinned !== undefined ? isPinned : note.isPinned;
        note.isArchived = isArchived !== undefined ? isArchived : note.isArchived;

        await note.save();
        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Error updating note' });
    }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Error deleting note' });
    }
});

// Toggle pin status
router.patch('/:id/toggle-pin', auth, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        note.isPinned = !note.isPinned;
        await note.save();
        res.json(note);
    } catch (error) {
        console.error('Error toggling pin status:', error);
        res.status(500).json({ message: 'Error toggling pin status' });
    }
});

// Toggle archive status
router.patch('/:id/toggle-archive', auth, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        note.isArchived = !note.isArchived;
        await note.save();
        res.json(note);
    } catch (error) {
        console.error('Error toggling archive status:', error);
        res.status(500).json({ message: 'Error toggling archive status' });
    }
});

module.exports = router; 