import React, { useState, useContext } from 'react';
import { SecurityContext } from '../../context/SecurityContext';
import { toast } from 'react-toastify';
import styles from './AddSensorModal.module.css';

const AddSensorModal = ({ isOpen, onClose }) => {
  const { addSensor } = useContext(SecurityContext);
  
  const initialState = {
    name: '',
    type: 'motion',
    location: '',
    zone: 'default'
  };
  
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { name, type, location, zone } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Sensor name is required';
    if (!location.trim()) errors.location = 'Location is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await addSensor(formData);
        toast.success(`${type} sensor added successfully!`);
        setFormData(initialState);
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to add sensor');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add New Sensor</h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">
              Sensor Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className={formErrors.name ? `${styles.input} ${styles.inputError}` : styles.input}
              placeholder="e.g., Living Room Motion Sensor"
            />
            {formErrors.name && (
              <p className={styles.errorMessage}>{formErrors.name}</p>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="type">
              Sensor Type
            </label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={onChange}
              className={styles.select}
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
            <label className={styles.label} htmlFor="location">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={onChange}
              className={formErrors.location ? `${styles.input} ${styles.inputError}` : styles.input}
              placeholder="e.g., Living Room, Front Door"
            />
            {formErrors.location && (
              <p className={styles.errorMessage}>{formErrors.location}</p>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="zone">
              Zone
            </label>
            <select
              id="zone"
              name="zone"
              value={zone}
              onChange={onChange}
              className={styles.select}
            >
              <option value="default">Default</option>
              <option value="perimeter">Perimeter</option>
              <option value="interior">Interior</option>
              <option value="upstairs">Upstairs</option>
              <option value="downstairs">Downstairs</option>
              <option value="garage">Garage</option>
              <option value="basement">Basement</option>
            </select>
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Sensor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSensorModal;