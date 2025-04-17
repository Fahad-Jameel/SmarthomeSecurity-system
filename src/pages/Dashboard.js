import React, { useContext, useEffect, useState } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import { AuthContext } from '../context/AuthContext';
import SystemStatus from '../components/dashboard/SystemStatus.js';
import SensorOverview from '../components/dashboard/SensorOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import styles from './Dashboard.module.css';

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

  // In Dashboard.js - Replace the useEffect block with this improved version

useEffect(() => {
  let isMounted = true;
  const fetchData = async () => {
    try {
      if (isMounted) {
        setRefreshing(true);
        await Promise.all([getSensors(), getLogs()]);
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (isMounted) {
        setRefreshing(false);
      }
    }
  };
  
  fetchData();
  
  // Refresh data every 60 seconds, but only if component is still mounted
  const interval = setInterval(() => {
    if (isMounted) {
      fetchData();
    }
  }, 60000);
  
  // Cleanup function to prevent memory leaks
  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [getSensors, getLogs]);

// Also add this to fix the handleRefresh function
const handleRefresh = async () => {
  if (refreshing) return; // Prevent multiple refresh calls
  
  setRefreshing(true);
  try {
    await Promise.all([getSensors(), getLogs()]);
  } catch (error) {
    console.error('Error during refresh:', error);
  } finally {
    setRefreshing(false);
  }
};
  
  const handleArmDisarm = async (action) => {
    await changeSystemState(action);
  };
  
  if (loading && sensors.length === 0) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {user?.name}</h1>
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
    </div>
  );
};

export default Dashboard;