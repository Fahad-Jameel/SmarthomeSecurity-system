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

  // Get all sensors
  const getSensors = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      const res = await axios.get('/api/sensors');

      dispatch({
        type: 'GET_SENSORS_SUCCESS',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response.data.error
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
      const res = await axios.post('/api/sensors', sensorData, config);

      dispatch({
        type: 'ADD_SENSOR_SUCCESS',
        payload: res.data.data
      });

      return res.data.data;
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response.data.error
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
      const res = await axios.put(`/api/sensors/${id}`, sensorData, config);

      dispatch({
        type: 'UPDATE_SENSOR_SUCCESS',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response.data.error
      });
    }
  };

  // Delete sensor
  const deleteSensor = async (id) => {
    try {
      await axios.delete(`/api/sensors/${id}`);

      dispatch({
        type: 'DELETE_SENSOR_SUCCESS',
        payload: id
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response.data.error
      });
    }
  };

  // Arm/Disarm system
  const changeSystemState = async (state) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      await axios.post('/api/security/system', { state }, config);

      dispatch({
        type: 'CHANGE_SYSTEM_STATE',
        payload: state
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response.data.error
      });
    }
  };

  // Get security logs
  const getLogs = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      
      const res = await axios.get('/api/security/logs');

      dispatch({
        type: 'GET_LOGS_SUCCESS',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response.data.error
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
      const res = await axios.post('/api/security/alert', alertData, config);

      dispatch({
        type: 'ALERT_TRIGGERED',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'SECURITY_ERROR',
        payload: err.response.data.error
      });
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