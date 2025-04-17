import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SecurityContext } from '../context/SecurityContext';

// Simple debugging component you can add to Dashboard.js for troubleshooting
const DebugPanel = () => {
  const [visible, setVisible] = useState(false);
  const [apiResponses, setApiResponses] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const { 
    isAuthenticated, 
    loading: authLoading, 
    user, 
    error: authError 
  } = useContext(AuthContext);
  
  const { 
    loading: securityLoading, 
    error: securityError,
    sensors,
    logs
  } = useContext(SecurityContext);
  
  // Test API endpoint function
  const testEndpoint = async (endpoint) => {
    try {
      const result = await fetch(endpoint);
      const status = result.status;
      const text = await result.text();
      
      setApiResponses(prev => [
        { 
          endpoint, 
          status, 
          response: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 4)  // Keep last 5 responses
      ]);
    } catch (error) {
      setApiResponses(prev => [
        { 
          endpoint, 
          status: 'Error', 
          response: error.message,
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 4)
      ]);
    }
  };
  
  // Force component update every second to show accurate timers
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!visible) {
    return (
      <button 
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 1000,
          background: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '5px 10px'
        }}
      >
        Show Debug
      </button>
    );
  }
  
  const timeSinceMount = Math.floor((Date.now() - lastUpdate) / 1000);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      overflowY: 'auto',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Debug Panel</h3>
        <button onClick={() => setVisible(false)}>Close</button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <h4>Auth State:</h4>
        <div>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>authLoading: {authLoading ? 'true' : 'false'}</div>
        <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
        <div>Auth Error: {authError || 'none'}</div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <h4>Security State:</h4>
        <div>securityLoading: {securityLoading ? 'true' : 'false'}</div>
        <div>Security Error: {securityError || 'none'}</div>
        <div>Sensors: {sensors ? sensors.length : 0}</div>
        <div>Logs: {logs ? logs.length : 0}</div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <h4>Test API Endpoints:</h4>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => testEndpoint('/api/auth/me')}
            style={{ padding: '5px', fontSize: '11px' }}
          >
            Test /api/auth/me
          </button>
          <button 
            onClick={() => testEndpoint('/api/sensors')}
            style={{ padding: '5px', fontSize: '11px' }}
          >
            Test /api/sensors
          </button>
          <button 
            onClick={() => testEndpoint('/api/security/logs')}
            style={{ padding: '5px', fontSize: '11px' }}
          >
            Test /api/security/logs
          </button>
        </div>
      </div>
      
      <div>
        <h4>API Test Results:</h4>
        {apiResponses.length === 0 ? (
          <div>No tests run yet</div>
        ) : (
          apiResponses.map((result, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              padding: '5px',
              background: result.status === 200 ? '#d4edda' : '#f8d7da'
            }}>
              <div><strong>{result.time} - {result.endpoint}</strong></div>
              <div>Status: {result.status}</div>
              <div>Response: {result.response}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DebugPanel;