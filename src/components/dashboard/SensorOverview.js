import React, { useState, useEffect } from 'react';
import styles from './SensorOverview.module.css';

const SensorOverview = ({ sensors }) => {
  const [filter, setFilter] = useState('all');
  const [filteredSensors, setFilteredSensors] = useState([]);
  
  useEffect(() => {
    if (filter === 'all') {
      setFilteredSensors(sensors);
    } else {
      setFilteredSensors(sensors.filter(sensor => sensor.status === filter));
    }
  }, [sensors, filter]);
  
  const getSensorIconClass = (type) => {
    switch (type) {
      case 'motion':
        return styles.iconBlue;
      case 'door':
        return styles.iconGreen;
      case 'window':
        return styles.iconPurple;
      case 'camera':
        return styles.iconRed;
      default:
        return styles.iconGray;
    }
  };
  
  const getSensorIcon = (type) => {
    switch (type) {
      case 'motion':
        return (
          <svg className={styles.sensorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'door':
        return (
          <svg className={styles.sensorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      case 'window':
        return (
          <svg className={styles.sensorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'camera':
        return (
          <svg className={styles.sensorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'smoke':
        return (
          <svg className={styles.sensorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'temperature':
        return (
          <svg className={styles.sensorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={styles.sensorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };
  
  const getSensorItemStatusClass = (status) => {
    switch (status) {
      case 'active':
        return styles.sensorItemActive;
      case 'inactive':
        return styles.sensorItemInactive;
      case 'triggered':
        return styles.sensorItemTriggered;
      case 'offline':
        return styles.sensorItemOffline;
      default:
        return styles.sensorItemInactive;
    }
  };
  
  const getStatusIndicatorClass = (status) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'inactive':
        return styles.statusInactive;
      case 'triggered':
        return styles.statusTriggered;
      case 'offline':
        return styles.statusOffline;
      default:
        return styles.statusInactive;
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sensor Overview</h2>
        <div className={styles.filterContainer}>
          <label htmlFor="statusFilter" className={styles.filterLabel}>Show:</label>
          <select
            id="statusFilter"
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All sensors</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="triggered">Triggered</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      
      {filteredSensors.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={styles.emptyTitle}>No sensors found</h3>
          <p className={styles.emptyText}>
            {sensors.length === 0
              ? "You haven't added any sensors yet"
              : "No sensors match the current filter"
            }
          </p>
        </div>
      ) : (
        <div className={styles.sensorGrid}>
          {filteredSensors.map(sensor => (
            <div 
              key={sensor._id} 
              className={`${styles.sensorItem} ${getSensorItemStatusClass(sensor.status)}`}
            >
              <div className={`${styles.sensorIcon} ${getSensorIconClass(sensor.type)}`}>
                {getSensorIcon(sensor.type)}
              </div>
              <div className={styles.sensorInfo}>
                <div className={styles.sensorName}>{sensor.name}</div>
                <div className={styles.sensorLocation}>{sensor.location}</div>
              </div>
              <div className={`${styles.statusIndicator} ${getStatusIndicatorClass(sensor.status)}`}></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SensorOverview;