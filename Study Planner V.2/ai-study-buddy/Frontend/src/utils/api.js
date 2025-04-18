import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // backend URL

// Function to sign up a user
export const signUp = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data; // returns the response data from the server
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    throw error;
  }
};

// Function to log in a user
export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data; // returns the response data from the server (including token)
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

const BASE_UR = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const notesApi = {
    getAllNotes: async (token) => {
        const response = await fetch(`${BASE_URL}/notes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch notes');
        return response.json();
    },

    createNote: async (token, noteData) => {
        const response = await fetch(`${BASE_URL}/notes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Failed to create note');
        return response.json();
    },

    updateNote: async (token, noteId, noteData) => {
        const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error('Failed to update note');
        return response.json();
    },

    deleteNote: async (token, noteId) => {
        const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) throw new Error('Failed to delete note');
        return response.json();
    }
};
