import axios from 'axios';
import mockReadinessData from '../mockReadinessData.json';
import mockPoseFaults from '../mockPoseFaults.json';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tool-calling functions as specified in the architecture
export const toolFunctions = {
  // Fetches and synthesizes data from HealthKit/Google Fit APIs
  async getReadinessData() {
    try {
      // In production, this would call the actual backend API
      // For now, using mock data with simulated API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate API response structure
      return {
        success: true,
        data: mockReadinessData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching readiness data:', error);
      return {
        success: false,
        error: error.message,
        data: mockReadinessData // Fallback to mock data
      };
    }
  },

  // Processes skeletal data to identify technical faults in form
  async analyzeMovementForm(poseLandmarks) {
    try {
      // In production, this would send pose landmarks to the backend for analysis
      const response = await new Promise(resolve => {
        setTimeout(() => {
          // Simulate AI analysis based on pose landmarks
          const analysisResult = {
            ...mockPoseFaults,
            analysisTimestamp: new Date().toISOString(),
            inputLandmarks: poseLandmarks?.length || 0,
            processingTime: Math.random() * 200 + 100 // Simulated processing time
          };
          resolve(analysisResult);
        }, 300);
      });

      return {
        success: true,
        data: response,
        confidence: 0.87
      };
    } catch (error) {
      console.error('Error analyzing movement form:', error);
      return {
        success: false,
        error: error.message,
        data: mockPoseFaults
      };
    }
  },

  // Saves qualitative user feedback to the database
  async logPerformanceNote(noteDetails) {
    try {
      const payload = {
        ...noteDetails,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId') || 'demo-user'
      };

      // In production, this would save to Firebase Firestore
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        message: 'Performance note logged successfully',
        noteId: `note_${Date.now()}`,
        data: payload
      };
    } catch (error) {
      console.error('Error logging performance note:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Additional utility functions for the app
  async getTrainingPlan(userId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        success: true,
        data: {
          planId: `plan_${userId}`,
          type: 'adaptive',
          difficulty: 'intermediate',
          duration: 45,
          exercises: [
            { name: 'Bodyweight Squats', sets: 3, reps: 12, restTime: 60 },
            { name: 'Push-ups', sets: 3, reps: 8, restTime: 60 },
            { name: 'Plank', sets: 3, duration: 30, restTime: 45 },
            { name: 'Lunges', sets: 3, reps: 10, restTime: 60 }
          ],
          adaptations: [
            'Increased rest time based on heart rate recovery',
            'Reduced intensity due to sleep quality score'
          ]
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getWeatherBasedRecommendations(location) {
    try {
      // Mock weather API integration
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        data: {
          temperature: 22,
          humidity: 65,
          conditions: 'partly_cloudy',
          recommendations: [
            'Great weather for outdoor cardio',
            'Stay hydrated due to moderate humidity',
            'Consider reducing intensity if temperature rises above 25°C'
          ]
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Main API service object
export const apiService = {
  // Authentication
  auth: {
    login: async (credentials) => apiClient.post('/auth/login', credentials),
    logout: async () => apiClient.post('/auth/logout'),
    register: async (userData) => apiClient.post('/auth/register', userData)
  },

  // User profile management
  user: {
    getProfile: async () => apiClient.get('/user/profile'),
    updateProfile: async (data) => apiClient.put('/user/profile', data),
    getPreferences: async () => apiClient.get('/user/preferences')
  },

  // Training sessions
  sessions: {
    start: async (sessionData) => apiClient.post('/sessions/start', sessionData),
    update: async (sessionId, data) => apiClient.put(`/sessions/${sessionId}`, data),
    end: async (sessionId, summary) => apiClient.post(`/sessions/${sessionId}/end`, summary),
    getHistory: async () => apiClient.get('/sessions/history')
  },

  // Analytics and insights
  analytics: {
    getProgressReport: async (timeframe) => apiClient.get(`/analytics/progress?timeframe=${timeframe}`),
    getInjuryRisk: async () => apiClient.get('/analytics/injury-risk'),
    getPerformanceTrends: async () => apiClient.get('/analytics/trends')
  }
};

export default apiService;
