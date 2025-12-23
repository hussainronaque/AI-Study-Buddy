const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// Get all todos for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching todos for user:', req.user.id);
        const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
        console.log('Found todos:', todos);
        res.json(todos);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ message: 'Error fetching todos', error: err.message });
    }
});

// Create a new todo
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating todo for user:', req.user.id);
        console.log('Todo data:', req.body);
        
        if (!req.body.text) {
            console.error('Missing text in todo creation');
            return res.status(400).json({ message: 'Todo text is required' });
        }

        const todo = new Todo({
            text: req.body.text,
            userId: req.user.id
        });
        
        console.log('Saving todo:', todo);
        await todo.save();
        console.log('Todo saved successfully:', todo);
        
        res.status(201).json(todo);
    } catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ message: 'Error creating todo', error: err.message });
    }
});

// Update a todo
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('Updating todo:', req.params.id);
        console.log('Update data:', req.body);
        
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            console.error('Todo not found:', req.params.id);
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        if (todo.userId.toString() !== req.user.id) {
            console.error('Unauthorized todo update attempt');
            return res.status(403).json({ message: 'Not authorized to update this todo' });
        }
        
        todo.completed = req.body.completed;
        console.log('Saving updated todo:', todo);
        await todo.save();
        console.log('Todo updated successfully:', todo);
        
        res.json(todo);
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ message: 'Error updating todo', error: err.message });
    }
});

// Delete a todo
router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('Deleting todo:', req.params.id);
        
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            console.error('Todo not found:', req.params.id);
            return res.status(404).json({ message: 'Todo not found' });
        }
        
        if (todo.userId.toString() !== req.user.id) {
            console.error('Unauthorized todo deletion attempt');
            return res.status(403).json({ message: 'Not authorized to delete this todo' });
        }
        
        await Todo.findByIdAndDelete(req.params.id);
        console.log('Todo deleted successfully:', req.params.id);
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ message: 'Error deleting todo', error: err.message });
    }
});

module.exports = router; 