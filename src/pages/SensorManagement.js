import React, { useContext, useEffect, useState, useCallback } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import AddSensorModal from '../components/sensors/AddSensorModal.js';
import SensorCard from '../components/sensors/SensorCard.js';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import styles from './SensorManagement.module.css';

const SensorManagement = () => {
  const { sensors, loading, getSensors, deleteSensor } = useContext(SecurityContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filteredSensors, setFilteredSensors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Create stable callback for data fetching
  const fetchSensors = useCallback(async () => {
    if (refreshing) return; // Prevent concurrent fetches
    
    try {
      console.log('SensorManagement: Fetching sensors');
      setRefreshing(true);
      await getSensors();
      console.log('SensorManagement: Sensors fetched successfully');
    } catch (error) {
      console.error('Error fetching sensors:', error);
    } finally {
      setRefreshing(false);
      setInitialLoadComplete(true);
    }
  }, [getSensors, refreshing]);
  
  // Initial data load on component mount
  useEffect(() => {
    console.log('SensorManagement: Initial sensor fetch');
    let isMounted = true;
    
    const initialFetch = async () => {
      if (isMounted && !initialLoadComplete) {
        await fetchSensors();
      }
    };
    
    initialFetch();
    
    return () => {
      console.log('SensorManagement: Cleaning up');
      isMounted = false;
    };
  }, [fetchSensors, initialLoadComplete]);
  
  // Filter and search effect
  useEffect(() => {
    let result = [...sensors];
    
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(sensor => sensor.type === filter);
    }
    
    // Apply search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        sensor => 
          sensor.name.toLowerCase().includes(term) || 
          sensor.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredSensors(result);
  }, [sensors, filter, searchTerm]);
  
  const handleRefresh = () => {
    if (refreshing) return;
    console.log('SensorManagement: Manual refresh triggered');
    fetchSensors();
  };
  
  const handleDeleteSensor = async (id) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      try {
        await deleteSensor(id);
      } catch (error) {
        console.error('Error deleting sensor:', error);
      }
    }
  };
  
  // Show loading spinner only on initial load
  if (loading && !initialLoadComplete) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sensor Management</h1>
        <div className={styles.headerButtons}>
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={styles.addButton}
          >
            <svg className={styles.addIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Sensor
          </button>
        </div>
      </div>
      
      <div className={styles.searchCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputContainer}>
            <div className={styles.searchIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              className={styles.searchInput}
              placeholder="Search sensors by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filterContainer}>
            <label htmlFor="filter" className={styles.filterLabel}>Filter by type:</label>
            <select
              id="filter"
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All sensors</option>
              <option value="motion">Motion sensors</option>
              <option value="door">Door sensors</option>
              <option value="window">Window sensors</option>
              <option value="camera">Cameras</option>
              <option value="smoke">Smoke detectors</option>
              <option value="temperature">Temperature sensors</option>
            </select>
          </div>
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
              ? "You haven't added any sensors yet."
              : "No sensors match your current filters."}
          </p>
          {sensors.length === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={styles.addButton}
            >
              Add Your First Sensor
            </button>
          )}
        </div>
      ) : (
        <div className={styles.sensorGrid}>
          {filteredSensors.map(sensor => (
            <SensorCard
              key={sensor._id}
              sensor={sensor}
              onDelete={() => handleDeleteSensor(sensor._id)}
            />
          ))}
        </div>
      )}
      
      <AddSensorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default SensorManagement;