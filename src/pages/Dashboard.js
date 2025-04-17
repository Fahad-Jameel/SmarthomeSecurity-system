import React, { useContext, useEffect, useState, useCallback } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import { AuthContext } from '../context/AuthContext';
import SystemStatus from '../components/dashboard/SystemStatus.js';
import SensorOverview from '../components/dashboard/SensorOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import styles from './Dashboard.module.css';

import DebugPanel from './DebugPanel.js';
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { 
    systemStatus, 
    sensors, 
    logs, 
    loading, 
    getSensors, 
    getLogs, 
    changeSystemState 
  } = useContext(SecurityContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Create stable callback functions to prevent effect dependencies from changing
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      // Use Promise.all with error handling
      try {
        await Promise.all([getSensors(), getLogs()]);
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRefreshing(false);
    }
  }, [getSensors, getLogs]);

  // This effect will run once on mount and whenever fetchData changes
  // (which should be never due to useCallback)
  useEffect(() => {
    console.log('Dashboard: Initial data fetching');
    let isMounted = true;
    
    const initialFetch = async () => {
      if (isMounted) {
        await fetchData();
      }
    };
    
    initialFetch();
    
    // Set up refresh interval
    const interval = setInterval(() => {
      if (isMounted) {
        console.log('Dashboard: Refreshing data on interval');
        fetchData();
      }
    }, 60000); // 60 seconds
    
    // Cleanup function
    return () => {
      console.log('Dashboard: Cleaning up');
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchData, refreshCount]);
  
  const handleRefresh = () => {
    if (refreshing) return; // Prevent multiple refresh calls
    console.log('Dashboard: Manual refresh triggered');
    fetchData();
  };
  
  const handleRetry = () => {
    console.log('Dashboard: Retry triggered');
    setRefreshCount(prev => prev + 1); // Force effect to re-run
  };
  
  const handleArmDisarm = async (action) => {
    await changeSystemState(action);
  };
  
  // Only show loading spinner on initial load, not during refreshes
  if (loading && sensors.length === 0 && !refreshing) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {user?.name || 'User'}</h1>
        <div className={styles.actionButtons}>
          <button 
            onClick={handleRefresh} 
            className={styles.refreshButton}
            disabled={refreshing}
          >
            <svg 
              className={`${styles.refreshIcon} ${refreshing ? styles.spinning : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {sensors.length === 0 && !loading && (
            <button 
              onClick={handleRetry} 
              className={styles.retryButton || 'retry-button'}
            >
              Retry Loading
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.col2Span}>
          <SystemStatus 
            status={systemStatus} 
            onArmDisarm={handleArmDisarm} 
          />
        </div>
        <div className={styles.statsCard}>
          <h2 className={styles.statsTitle}>Quick Stats</h2>
          <div className={styles.statsGrid}>
            <div className={`${styles.statsItem} ${styles.statsItemBlue}`}>
              <p className={styles.statsLabel}>Total Sensors</p>
              <p className={styles.statsValue}>{sensors.length}</p>
            </div>
            <div className={`${styles.statsItem} ${styles.statsItemGreen}`}>
              <p className={styles.statsLabel}>Active</p>
              <p className={styles.statsValue}>
                {sensors.filter(sensor => sensor.status === 'active').length}
              </p>
            </div>
            <div className={`${styles.statsItem} ${styles.statsItemYellow}`}>
              <p className={styles.statsLabel}>Offline</p>
              <p className={styles.statsValue}>
                {sensors.filter(sensor => sensor.status === 'offline').length}
              </p>
            </div>
            <div className={`${styles.statsItem} ${styles.statsItemRed}`}>
              <p className={styles.statsLabel}>Alerts Today</p>
              <p className={styles.statsValue}>
                {logs.filter(log => 
                  log.eventType === 'alert' && 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.col2Span}>
          <SensorOverview sensors={sensors} />
        </div>
        <div>
          <RecentActivity logs={logs.slice(0, 10)} />
        </div>
      </div>
      <DebugPanel />
    </div>
  );
};

export default Dashboard;