import React, { useContext, useEffect, useState } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import { AuthContext } from '../context/AuthContext';
import SystemStatus from '../components/dashboard/SystemStatus.js';
import SensorOverview from '../components/dashboard/SensorOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { 
    systemStatus, 
    sensors, 
    logs, 
    loading, 
    error,
    getSensors, 
    getLogs, 
    changeSystemState,
    clearErrors
  } = useContext(SecurityContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        if (isMounted) {
          setRefreshing(true);
          
          // Use Promise.allSettled to continue even if one request fails
          const results = await Promise.allSettled([
            getSensors(), 
            getLogs()
          ]);
          
          // Check if any of the promises were rejected
          const hasFailures = results.some(result => result.status === 'rejected');
          
          if (isMounted) {
            setRefreshing(false);
            setLoadingFailed(hasFailures);
            
            if (hasFailures) {
              console.error('Some data failed to load:', 
                results.filter(r => r.status === 'rejected').map(r => r.reason)
              );
            }
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (isMounted) {
          setRefreshing(false);
          setLoadingFailed(true);
        }
      }
    };
    
    fetchData();
    
    // Only set up refresh interval if first load succeeded
    let interval;
    if (!loadingFailed) {
      // Refresh data every 60 seconds, but only if component is still mounted
      interval = setInterval(() => {
        if (isMounted && isAuthenticated) {
          fetchData();
        }
      }, 60000);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [getSensors, getLogs, isAuthenticated, loadingFailed, retryCount]);
  
  // Clear errors when component unmounts or when errors are shown
  useEffect(() => {
    if (error) {
      console.error('Security context error:', error);
    }
    
    return () => {
      if (clearErrors) clearErrors();
    };
  }, [error, clearErrors]);

  const handleRefresh = async () => {
    if (refreshing) return; // Prevent multiple refresh calls
    
    setRefreshing(true);
    setLoadingFailed(false);
    
    try {
      // Use Promise.allSettled to continue even if one request fails
      const results = await Promise.allSettled([
        getSensors(), 
        getLogs()
      ]);
      
      // Check if any of the promises were rejected
      const hasFailures = results.some(result => result.status === 'rejected');
      setLoadingFailed(hasFailures);
      
      if (hasFailures) {
        console.error('Some data failed to load during refresh:', 
          results.filter(r => r.status === 'rejected').map(r => r.reason)
        );
      }
    } catch (error) {
      console.error('Error during refresh:', error);
      setLoadingFailed(true);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoadingFailed(false);
    handleRefresh();
  };
  
  const handleArmDisarm = async (action) => {
    try {
      await changeSystemState(action);
    } catch (error) {
      console.error('Error changing system state:', error);
    }
  };
  
  // Show loading spinner only on initial load
  if (loading && sensors.length === 0 && !loadingFailed) {
    return <LoadingSpinner />;
  }
  
  // Show error state if loading failed
  if (loadingFailed) {
    return (
      <div className={styles.errorContainer || 'error-container'}>
        <h2>Unable to load dashboard data</h2>
        <p>There was a problem connecting to the server. Please check your connection and try again.</p>
        <button 
          onClick={handleRetry} 
          className={styles.retryButton || 'retry-button'}
          disabled={refreshing}
        >
          {refreshing ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
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