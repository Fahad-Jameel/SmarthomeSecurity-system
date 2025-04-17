// src/utils/axiosConfig.js
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add a request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log(`Received response from ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`Error response (${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('Error: No response received');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;