import axios from 'axios';

const API_URL = 'http://localhost:4000/api/auth';
const SCHEDULE_URL = 'http://localhost:4000/api/schedules';
const STUDY_PLANS_URL = 'http://localhost:4000/api/study-plans';
const AI_GENS_URL = 'http://localhost:4000/api/ai_gens';

// This file will be implemented later with actual API endpoints
// For now, it contains placeholder functions

// Auth related functions
export const signUp = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (credentials) => {
  try {
    console.log('Making login request to:', `${API_URL}/login`);
    console.log('With credentials:', credentials);
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Login error details:', error.response?.data);
    throw error.response?.data || error;
  }
};

// Add or update these functions in your api.js file
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/reset-password', { 
      email, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Notes related functions
export const notesApi = {
  getAllNotes: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  createNote: async (token, noteData) => {
    try {
      const response = await axios.post(`${API_URL}/notes`, noteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  updateNote: async (token, noteId, noteData) => {
    try {
      const response = await axios.put(`${API_URL}/notes/${noteId}`, noteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  deleteNote: async (token, noteId) => {
    try {
      const response = await axios.delete(`${API_URL}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Schedule related functions
export const scheduleApi = {
  uploadSchedule: async (token, file) => {
    try {
      const formData = new FormData();
      formData.append('schedule', file);
      
      console.log('Uploading file:', file.name); // Debug log
      
      const response = await axios.post(`${SCHEDULE_URL}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload API response:', response.data); // Debug log

      // Make sure we're returning the data property of the response
      return response.data;
    } catch (error) {
      console.error('Schedule upload error:', error.response?.data || error); // Debug log
      throw error.response?.data || error;
    }
  },
  getSchedules: async (token) => {
    try {
      const response = await axios.get(`${SCHEDULE_URL}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Study Plans related functions
export const studyPlansApi = {
  createPlan: async (token, planData) => {
    try {
      const response = await axios.post(STUDY_PLANS_URL, planData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getPlans: async (token) => {
    try {
      const response = await axios.get(STUDY_PLANS_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updatePlan: async (token, planId, updateData) => {
    try {
      const response = await axios.put(`${STUDY_PLANS_URL}/${planId}`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deletePlan: async (token, planId) => {
    try {
      const response = await axios.delete(`${STUDY_PLANS_URL}/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// AI-Generated Study Plan functions
export const aiStudyPlanApi = {
  // Load existing generated plan by userId
  getGeneratedStudyPlan: async (token, userId) => {
    try {
      const response = await axios.get(`${AI_GENS_URL}/study_plan/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Trigger generation of a new plan
  generateStudyPlan: async (token, payload) => {
    try {
      const response = await axios.post(`${AI_GENS_URL}/generate_study_plan`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};