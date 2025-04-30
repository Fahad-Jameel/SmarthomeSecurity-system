import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SecurityContext } from '../context/SecurityContext';
import { AuthContext } from '../context/AuthContext';
import SystemStatus from '../components/dashboard/SystemStatus.js';
import SensorOverview from '../components/dashboard/SensorOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
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
  const [zones, setZones] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingCodes, setLoadingCodes] = useState(true);

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

  // Fetch zones for the zone management overview
  const fetchZones = async () => {
    try {
      setLoadingZones(true);
      const res = await axios.get('/api/zones');
      
      // Handle different response formats
      let zonesData = [];
      if (Array.isArray(res.data)) {
        zonesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        zonesData = res.data.data;
      } else {
        console.log('Unexpected zones format:', res.data);
        zonesData = [];
      }
      
      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoadingZones(false);
    }
  };

  // Fetch access codes for the guest access overview
  const fetchAccessCodes = async () => {
    try {
      setLoadingCodes(true);
      const res = await axios.get('/api/access-codes');
      
      // Handle different response formats
      let codesData = [];
      if (Array.isArray(res.data)) {
        codesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        codesData = res.data.data;
      } else {
        console.log('Unexpected access codes format:', res.data);
        codesData = [];
      }
      
      setAccessCodes(codesData);
    } catch (error) {
      console.error('Error fetching access codes:', error);
    } finally {
      setLoadingCodes(false);
    }
  };

  // This effect will run once on mount to load initial data
  useEffect(() => {
    console.log('Dashboard: Initial data fetching');
    let isMounted = true;
    
    const initialFetch = async () => {
      if (isMounted && !initialLoadComplete) {
        await fetchData();
        // Fetch zones and access codes for overview sections
        fetchZones();
        fetchAccessCodes();
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
    fetchZones();
    fetchAccessCodes();
  };
  
  const handleArmDisarm = async (action) => {
    try {
      await changeSystemState(action);
    } catch (error) {
      console.error('Error changing system state:', error);
    }
  };

  // Navigation handlers
  const goToZones = () => navigate('/zones');
  const goToGuestAccess = () => navigate('/guests');
  
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
      
      {/* Zone Management & Guest Access Overviews */}
      <div className={styles.grid}>
        <div>
          <div className={styles.overviewCard}>
            <div className={styles.overviewHeader}>
              <h2 className={styles.overviewTitle}>Zone Management</h2>
              <button onClick={goToZones} className={styles.viewAllButton}>
                View All
              </button>
            </div>
            <div className={styles.overviewContent}>
              {loadingZones ? (
                <p className={styles.loadingText}>Loading zones...</p>
              ) : zones.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className={styles.emptyText}>No zones created yet</p>
                  <button onClick={goToZones} className={styles.createButton}>
                    Create Zone
                  </button>
                </div>
              ) : (
                <div className={styles.zonesList}>
                  {zones.slice(0, 3).map(zone => (
                    <div key={zone._id} className={styles.zoneItem} style={{ borderLeftColor: zone.color || '#4169E1' }}>
                      <div className={styles.zoneName}>{zone.name}</div>
                      <div className={styles.zoneDetails}>
                        <span className={styles.sensorCount}>
                          {zone.sensors ? zone.sensors.length : 0} sensors
                        </span>
                      </div>
                    </div>
                  ))}
                  {zones.length > 3 && (
                    <div className={styles.moreIndicator}>
                      +{zones.length - 3} more zones
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className={styles.overviewCard}>
            <div className={styles.overviewHeader}>
              <h2 className={styles.overviewTitle}>Guest Access</h2>
              <button onClick={goToGuestAccess} className={styles.viewAllButton}>
                View All
              </button>
            </div>
            <div className={styles.overviewContent}>
              {loadingCodes ? (
                <p className={styles.loadingText}>Loading access codes...</p>
              ) : accessCodes.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className={styles.emptyText}>No guest access codes created</p>
                  <button onClick={goToGuestAccess} className={styles.createButton}>
                    Create Access Code
                  </button>
                </div>
              ) : (
                <div className={styles.accessCodesList}>
                  {accessCodes.slice(0, 3).map(code => (
                    <div key={code._id} className={styles.accessCodeItem}>
                      <div className={styles.codeName}>{code.name}</div>
                      <div className={styles.codeDetails}>
                        <span className={styles.codeExpiry}>
                          Expires: {new Date(code.expiry).toLocaleDateString()}
                        </span>
                        <span className={styles.codeUsage}>
                          {code.limit - (code.usedCount || 0)} uses left
                        </span>
                      </div>
                    </div>
                  ))}
                  {accessCodes.length > 3 && (
                    <div className={styles.moreIndicator}>
                      +{accessCodes.length - 3} more access codes
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;