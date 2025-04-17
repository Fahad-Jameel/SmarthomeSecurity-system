import React, { useContext, useEffect, useState, useCallback } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import SystemStatus from '../components/dashboard/SystemStatus';
import ActivityLog from '../components/security/ActivityLog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import styles from './Security.module.css';

const Security = () => {
  const { 
    systemStatus, 
    logs, 
    loading, 
    getLogs, 
    changeSystemState 
  } = useContext(SecurityContext);
  
  const [logsFilter, setLogsFilter] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Create stable callback for data fetching
  const fetchLogs = useCallback(async () => {
    if (refreshing) return; // Prevent concurrent fetches
    
    try {
      console.log('Security: Fetching logs');
      setRefreshing(true);
      await getLogs();
      console.log('Security: Logs fetched successfully');
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setRefreshing(false);
      setInitialLoadComplete(true);
    }
  }, [getLogs, refreshing]);
  
  // Initial data load
  useEffect(() => {
    console.log('Security: Initial logs fetch');
    let isMounted = true;
    
    const initialFetch = async () => {
      if (isMounted && !initialLoadComplete) {
        await fetchLogs();
      }
    };
    
    initialFetch();
    
    return () => {
      console.log('Security: Cleaning up');
      isMounted = false;
    };
  }, [fetchLogs, initialLoadComplete]);
  
  // Filter logs whenever the filter changes or logs update
  useEffect(() => {
    if (logsFilter === 'all') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.eventType === logsFilter));
    }
  }, [logs, logsFilter]);
  
  const handleRefresh = () => {
    if (refreshing) return;
    console.log('Security: Manual refresh triggered');
    fetchLogs();
  };
  
  const handleArmDisarm = async (action) => {
    try {
      await changeSystemState(action);
    } catch (error) {
      console.error('Error changing system state:', error);
    }
  };
  
  // Only show loading spinner on initial load
  if (loading && !initialLoadComplete) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Security Control</h1>
        <button 
          onClick={handleRefresh} 
          className={styles.refreshButton || 'refresh-button'}
          disabled={refreshing}
        >
          <svg 
            className={`${styles.refreshIcon || 'refresh-icon'} ${refreshing ? styles.spinning || 'spinning' : ''}`} 
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
        <div className={styles.emergencyCard}>
          <h2 className={styles.emergencyTitle}>Emergency Contacts</h2>
          <div className={styles.contactsList}>
            <div className={`${styles.contactItem} ${styles.securityContact}`}>
              <svg className={styles.securityIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h3 className={styles.contactName}>Security Company</h3>
                <p className={styles.contactNumber}>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className={`${styles.contactItem} ${styles.emergencyContact}`}>
              <svg className={styles.emergencyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className={styles.contactName}>Emergency (911)</h3>
                <p className={`${styles.contactNumber} ${styles.emergencyNumber}`}>911</p>
              </div>
            </div>
          </div>
          <button className={styles.emergencyButton}>
            Call Emergency Services
          </button>
        </div>
      </div>
      
      <div className={styles.logsCard}>
        <div className={styles.logsHeader}>
          <h2 className={styles.logsTitle}>Activity Log</h2>
          <div className={styles.filterContainer}>
            <label htmlFor="logsFilter" className={styles.filterLabel}>Filter:</label>
            <select
              id="logsFilter"
              className={styles.filterSelect}
              value={logsFilter}
              onChange={(e) => setLogsFilter(e.target.value)}
            >
              <option value="all">All events</option>
              <option value="arm">Arm events</option>
              <option value="disarm">Disarm events</option>
              <option value="trigger">Triggers</option>
              <option value="alert">Alerts</option>
              <option value="system">System events</option>
            </select>
          </div>
        </div>
        
        <ActivityLog logs={filteredLogs} />
      </div>
    </div>
  );
};

export default Security;