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
