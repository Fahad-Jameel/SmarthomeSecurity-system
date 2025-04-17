// SecurityContext.js with fixed API URLs

import React, { createContext, useReducer } from 'react';
import axios from 'axios';
import securityReducer from '../reducers/securityReducer';

// Create context
export const SecurityContext = createContext();

// Initial state
const initialState = {
  systemStatus: 'disarmed',
  sensors: [],
  logs: [],
  loading: true,
  error: null
};

// Provider component
export const SecurityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(securityReducer, initialState);

  // Set loading
  const setLoading = () => dispatch({ type: 'SET_LOADING' });

  // Get all sensors
  const getSensors = async () => {
    setLoading();
    try {
      // Fixed URL - removed 'localhost:5000'
      const res = await axios.get('/api/sensors');
      
      dispatch({
        type: 'GET_SENSORS_SUCCESS',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error fetching sensors:', err);
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response?.data?.error || 'Error fetching sensors'
      });
    }
  };

  // Add sensor
  const addSensor = async (sensorData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      // Fixed URL - removed 'localhost:5000'
      const res = await axios.post('/api/sensors', sensorData, config);
      
      dispatch({
        type: 'ADD_SENSOR_SUCCESS',
        payload: res.data.data
      });
      
      return res.data.data;
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response?.data?.error || 'Error adding sensor'
      });
      throw err;
    }
  };

  // Update sensor
  const updateSensor = async (id, sensorData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      // Fixed URL - removed 'localhost:5000'
      const res = await axios.put(`/api/sensors/${id}`, sensorData, config);
      
      dispatch({
        type: 'UPDATE_SENSOR_SUCCESS',
        payload: res.data.data
      });
      
      return res.data.data;
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response?.data?.error || 'Error updating sensor'
      });
      throw err;
    }
  };

  // Delete sensor
  const deleteSensor = async (id) => {
    try {
      // Fixed URL - removed 'localhost:5000'
      await axios.delete(`/api/sensors/${id}`);
      
      dispatch({
        type: 'DELETE_SENSOR_SUCCESS',
        payload: id
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response?.data?.error || 'Error deleting sensor'
      });
      throw err;
    }
  };

  // Change system state (arm/disarm)
  const changeSystemState = async (state) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      // Fixed URL - removed 'localhost:5000'
      await axios.post('/api/security/system', { state: state === 'disarmed' ? 'disarm' : 'arm' }, config);
      
      dispatch({
        type: 'CHANGE_SYSTEM_STATE',
        payload: state
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response?.data?.error || 'Error changing system state'
      });
      throw err;
    }
  };

  // Get security logs
  const getLogs = async () => {
    setLoading();
    try {
      // Fixed URL - removed 'localhost:5000'
      const res = await axios.get('/api/security/logs');
      
      dispatch({
        type: 'GET_LOGS_SUCCESS',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error fetching logs:', err);
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response?.data?.error || 'Error fetching logs'
      });
    }
  };

  // Trigger alert
  const triggerAlert = async (alertData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      // Fixed URL - removed 'localhost:5000'
      const res = await axios.post('/api/security/alert', alertData, config);
      
      dispatch({
        type: 'ALERT_TRIGGERED',
        payload: res.data.data
      });
      
      return res.data.data;
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response?.data?.error || 'Error triggering alert'
      });
      throw err;
    }
  };

  // Clear errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERRORS' });

  return (
    <SecurityContext.Provider
      value={{
        systemStatus: state.systemStatus,
        sensors: state.sensors,
        logs: state.logs,
        loading: state.loading,
        error: state.error,
        getSensors,
        addSensor,
        updateSensor,
        deleteSensor,
        changeSystemState,
        getLogs,
        triggerAlert,
        clearErrors
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};