import React, { useContext, useEffect, useState } from 'react';
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
  
  useEffect(() => {
    getLogs();
    
    // Refresh logs every 30 seconds
    const interval = setInterval(() => {
      getLogs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [getLogs]);
  
  useEffect(() => {
    if (logsFilter === 'all') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.eventType === logsFilter));
    }
  }, [logs, logsFilter]);
  
  const handleArmDisarm = async (action) => {
    await changeSystemState(action);
  };
  
  if (loading && logs.length === 0) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Security Control</h1>
      
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