import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SecurityContext } from '../../context/SecurityContext';
import styles from './AddSensorModal.module.css';

const AddSensorModal = ({ isOpen, onClose }) => {
  const { addSensor } = useContext(SecurityContext);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'motion',
    location: '',
    zone: ''
  });

  // Fetch zones when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchZones();
    }
  }, [isOpen]);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/zones');
      
      console.log('Zones API response:', res.data);
      
      // Handle different response formats
      let zonesData = [];
      if (Array.isArray(res.data)) {
        zonesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        zonesData = res.data.data;
      } else if (res.data && Array.isArray(res.data.zones)) {
        zonesData = res.data.zones;
      } else {
        console.error('Unexpected zones data format:', res.data);
        zonesData = [];
      }
      
      setZones(zonesData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching zones:', err);
      toast.error('Failed to fetch zones');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      toast.error('Please provide all required fields');
      return;
    }
    
    try {
      // Create a sensor object with or without zone
      const sensorData = { ...formData };
      
      // Only include zone if one is selected
      if (!formData.zone) {
        delete sensorData.zone;
      }
      
      await addSensor(sensorData);
      resetForm();
      onClose();
      toast.success('Sensor added successfully');
    } catch (error) {
      console.error('Error adding sensor:', error);
      toast.error('Failed to add sensor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'motion',
      location: '',
      zone: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Add New Sensor</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Sensor Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Living Room Motion Sensor"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Sensor Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="motion">Motion Sensor</option>
              <option value="door">Door Sensor</option>
              <option value="window">Window Sensor</option>
              <option value="camera">Camera</option>
              <option value="smoke">Smoke Detector</option>
              <option value="temperature">Temperature Sensor</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Living Room"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="zone">Zone (Optional)</label>
            <select
              id="zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
            >
              <option value="">No Zone</option>
              {isLoading ? (
                <option disabled>Loading zones...</option>
              ) : (
                zones.map(zone => (
                  <option key={zone._id} value={zone._id}>
                    {zone.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className={styles.modalFooter}>
            <button 
              type="button" 
              onClick={() => {
                resetForm();
                onClose();
              }}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Sensor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSensorModal;