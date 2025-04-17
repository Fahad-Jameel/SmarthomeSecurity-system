import React, { createContext, useReducer, useEffect, useRef } from 'react';
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

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const authAttemptedRef = useRef(false);

  // Load user
  const loadUser = async () => {
    // Prevent multiple auth attempts
    if (authAttemptedRef.current) {
      console.log('Auth already attempted, skipping loadUser');
      return;
    }
    
    authAttemptedRef.current = true;
    
    try {
      console.log('Loading user data...');
      const res = await axios.get('/api/auth/me');
      console.log('User data response:', res.data);

      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data
      });
      
      return true;
    } catch (err) {
      console.error('Load user error:', err);
      
      // If we get a 401 Unauthorized, that's expected for non-authenticated users
      if (err.response && err.response.status === 401) {
        console.log('User not authenticated (401)');
        // Clear any local storage to ensure we don't get stuck in a loop
        localStorage.removeItem('isAuthenticated');
        
        dispatch({ type: 'AUTH_ERROR' });
      } else if (err.response) {
        // Other response error
        dispatch({ type: 'AUTH_ERROR' });
      } else {
        // Network error - don't log out the user
        console.warn('Network error loading user, not logging out');
        dispatch({ type: 'CLEAR_ERRORS' });
      }
      
      return false;
    } finally {
      // Reset the ref after a delay to allow future attempts
      setTimeout(() => {
        authAttemptedRef.current = false;
      }, 5000);
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
      
      // Reset auth attempt flag to allow loadUser to run
      authAttemptedRef.current = false;
      
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
      console.log('Logging out user...');
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

  // Effect to load user on mount if authenticated
  useEffect(() => {
    console.log('AuthContext: Initial auth check running');
    
    // Only attempt to load user if authenticated according to localStorage
    // and we haven't already attempted auth
    if (state.isAuthenticated && !state.user && state.loading && !authAttemptedRef.current) {
      console.log('AuthContext: Loading user on initial mount');
      loadUser();
    } else if (!state.isAuthenticated && state.loading) {
      // If not authenticated, just set loading to false
      console.log('AuthContext: Not authenticated, completing loading');
      dispatch({ type: 'AUTH_ERROR' });
    }
    
    // Cleanup function
    return () => {
      console.log('AuthContext: Cleanup');
    };
  }, []);  // Empty dependency array = run once on mount

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