import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import authReducer from '../reducers/authReducer';

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
  loading: true,
  user: null,
  error: null
};

// Set up axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    try {
      console.log('Loading user data...');
      const res = await axios.get('/api/auth/me');
      console.log('User data response:', res.data);

      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Load user error:', err);
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register user
  const register = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Sending registration data:', formData);
      const res = await axios.post('/api/auth/register', formData, config);
      console.log('Registration response:', res.data);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      // Store authentication state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      // Load user data
      await loadUser();
      return true;
    } catch (err) {
      console.error('Register error details:', err);
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.error || 'Registration failed'
      });
      
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Sending login data:', formData);
      const res = await axios.post('/api/auth/login', formData, config);
      console.log('Login response:', res.data);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      // Store authentication state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      // Load user data
      await loadUser();
      return true;
    } catch (err) {
      console.error('Login error details:', err);
      
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.error || 'Login failed'
      });
      
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      localStorage.removeItem('isAuthenticated');
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('isAuthenticated');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user profile
  const updateProfile = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.put('/api/users/profile', formData, config);

      dispatch({
        type: 'UPDATE_PROFILE_SUCCESS',
        payload: res.data.data
      });
      
      return true;
    } catch (err) {
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: err.response?.data?.error || 'Profile update failed'
      });
      
      throw err;
    }
  };

  // Clear errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

  // Effect to load user on mount or when authentication state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      loadUser();
    }
  }, [state.isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        updateProfile,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};