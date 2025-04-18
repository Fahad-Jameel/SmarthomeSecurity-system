import React, { useContext, useEffect, useState, useCallback } from 'react';
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Create stable callback function to prevent effect dependencies from changing
  const fetchData = useCallback(async () => {
    if (refreshing) return; // Prevent concurrent fetches
    
    try {
      console.log('Dashboard: Fetching data');
      setRefreshing(true);
      
      // Use Promise.all with error handling
      try {
        await Promise.all([getSensors(), getLogs()]);
        console.log('Dashboard: Data fetched successfully');
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setRefreshing(false);
        setInitialLoadComplete(true);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRefreshing(false);
      setInitialLoadComplete(true);
    }
  }, [getSensors, getLogs, refreshing]);

  // This effect will run once on mount to load initial data
  useEffect(() => {
    console.log('Dashboard: Initial data fetching');
    let isMounted = true;
    
    const initialFetch = async () => {
      if (isMounted && !initialLoadComplete) {
        await fetchData();
      }
    };
    
    initialFetch();
    
    // Cleanup function
    return () => {
      console.log('Dashboard: Cleaning up');
      isMounted = false;
    };
  }, [fetchData, initialLoadComplete]);
  
  // Manual refresh function - only triggered by button click
  const handleRefresh = () => {
    if (refreshing) return; // Prevent multiple refresh calls
    console.log('Dashboard: Manual refresh triggered');
    fetchData();
  };
  
  const handleArmDisarm = async (action) => {
    try {
      await changeSystemState(action);
    } catch (error) {
      console.error('Error changing system state:', error);
    }
  };
  
  // Only show loading spinner on initial load, not during refreshes
  if (loading && !initialLoadComplete && !refreshing) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {user?.name || 'User'}</h1>
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