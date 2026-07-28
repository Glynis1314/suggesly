import axios from 'axios';

// Read the base URL from the environment variable (standard REACT_APP_ prefix for React CLI)
// Fallback to local backend port 5000 in development, or relative url in production
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

/**
 * Configure and export an Axios instance with pre-configured headers,
 * request token injection, and response handling.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling global responses or errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // We can inspect global errors here, e.g., 401 Unauthorized
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn('Unauthorized request - token may be expired or invalid.');
        // Optional: clear token or redirect to login
        // localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
