import React, { useState, useContext } from 'react';
import { SecurityContext } from '../../context/SecurityContext';
import { toast } from 'react-toastify';
import styles from './SensorCard.module.css';

const SensorCard = ({ sensor, onDelete }) => {
  const { updateSensor } = useContext(SecurityContext);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const getStatusColor = () => {
    switch (sensor.status) {
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
  
  const getSensorIconClass = () => {
    switch (sensor.type) {
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
  
  const getSensorIcon = () => {
    switch (sensor.type) {
      case 'motion':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'door':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      case 'window':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'camera':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'smoke':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'temperature':
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };
  
  const getBatteryBarClass = () => {
    if (sensor.batteryLevel > 70) return styles.batteryGood;
    if (sensor.batteryLevel > 30) return styles.batteryMedium;
    return styles.batteryLow;
  };
  
  const toggleStatus = async () => {
    const newStatus = sensor.status === 'active' ? 'inactive' : 'active';
    
    setIsUpdating(true);
    try {
      await updateSensor(sensor._id, { ...sensor, status: newStatus });
      toast.success(`Sensor ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update sensor status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.header}>
          <div className={styles.sensorInfo}>
            <div className={`${styles.iconContainer} ${getSensorIconClass()}`}>
              {getSensorIcon()}
            </div>
            <div>
              <h3 className={styles.sensorName}>{sensor.name}</h3>
              <p className={styles.sensorLocation}>{sensor.location}</p>
            </div>
          </div>
          <div className={styles.statusContainer}>
            <div className={`${styles.statusIndicator} ${getStatusColor()}`}></div>
            <span className={styles.statusText}>{sensor.status}</span>
          </div>
        </div>
        
        <div className={styles.batteryContainer}>
          <div className={styles.batteryHeader}>
            <span className={styles.batteryLabel}>Battery</span>
            <span className={styles.batteryValue}>{sensor.batteryLevel}%</span>
          </div>
          <div className={styles.batteryBar}>
            <div 
              className={`${styles.batteryProgress} ${getBatteryBarClass()}`} 
              style={{ width: `${sensor.batteryLevel}%` }}
            ></div>
          </div>
        </div>
        
        <div className={styles.metaContainer}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Zone</span>
            <p className={styles.metaValue}>{sensor.zone}</p>
          </div>
          {sensor.lastTriggered && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Last Triggered</span>
              <p className={styles.metaValue}>
                {new Date(sensor.lastTriggered).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.actionBar}>
        <button
          onClick={toggleStatus}
          className={
            isUpdating 
              ? `${styles.actionButton} ${styles.disabledButton}` 
              : `${styles.actionButton} ${
                  sensor.status === 'active' 
                    ? styles.deactivateButton 
                    : styles.activateButton
                }`
          }
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : sensor.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
        <div className={styles.separator}></div>
        <button
          onClick={onDelete}
          className={styles.deleteButton}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SensorCard;