// ScheduleLights.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Clock, Calendar, Plus, Edit2, Trash2, Sun, Moon, Check, X } from 'lucide-react';
import styles from './ScheduleLights.module.css';

const ScheduleLights = () => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    days: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    startTime: '18:00',
    endTime: '22:00',
    enabled: true,
  });
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetchSchedules();
    fetchDevices();
  }, []);

  // In ScheduleLights.js where you fetch schedules
const fetchSchedules = async () => {
  try {
    setIsLoading(true);
    const res = await axios.get('/api/schedules/lights');
    
    // Get schedules from the new response structure
    const schedulesData = res.data.data || [];
    setSchedules(schedulesData);
    
  } catch (error) {
    console.error('Error fetching light schedules:', error);
    toast.error('Failed to load schedules');
  } finally {
    setIsLoading(false);
  }
};

// For light devices
const fetchDevices = async () => {
  try {
    const res = await axios.get('/api/devices/lights');
    setDevices(res.data.data || []);
  } catch (error) {
    console.error('Error fetching devices:', error);
    toast.error('Failed to load devices');
  }
};

// For alarm services


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDayToggle = (day) => {
    setFormData({
      ...formData,
      days: {
        ...formData.days,
        [day]: !formData.days[day]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSchedule) {
        await axios.put(`/api/schedules/lights/${editingSchedule._id}`, formData);
        toast.success('Schedule updated successfully');
      } else {
        await axios.post('/api/schedules/lights', formData);
        toast.success('Schedule created successfully');
      }
      
      fetchSchedules();
      closeModal();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    }
  };

  // When creating a new schedule
// const handleSubmit = async (e) => {
//   e.preventDefault();
  
//   try {
//     const res = await axios.post('/api/schedules/lights', formData);
//     toast.success('Schedule created successfully');
//     // Access the created schedule from the new response structure
//     const newSchedule = res.data.data;
//     // Update your state with the new schedule
//     setSchedules([...schedules, newSchedule]);
//     closeModal();
//   } catch (error) {
//     console.error('Error creating schedule:', error);
//     toast.error('Failed to create schedule');
//   }
// };

  const openCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      deviceId: devices.length > 0 ? devices[0]._id : '',
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      startTime: '18:00',
      endTime: '22:00',
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      deviceId: schedule.deviceId,
      days: { ...schedule.days },
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      enabled: schedule.enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const deleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`/api/schedules/lights/${id}`);
        toast.success('Schedule deleted successfully');
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('Failed to delete schedule');
      }
    }
  };

  const toggleSchedule = async (id, enabled) => {
    try {
      await axios.patch(`/api/schedules/lights/${id}/toggle`, { enabled: !enabled });
      toast.success(`Schedule ${enabled ? 'disabled' : 'enabled'} successfully`);
      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const getDayLabel = (day) => {
    const firstChar = day.charAt(0).toUpperCase();
    return firstChar;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Light Scheduling</h1>
        <button className={styles.addButton} onClick={openCreateModal}>
          <Plus size={18} />
          Add Schedule
        
        </button>
      </div>
      
      <div className={styles.infoCard}>
        <h2 className={styles.infoTitle}>Create the Appearance of Being Home</h2>
        <p className={styles.infoText}>
          Scheduling your lights to turn on and off at specific times helps deter potential intruders by creating the impression that someone is home. You can create multiple schedules for different rooms and different days of the week.
        </p>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className={styles.emptyState}>
          <Clock size={48} />
          <h3 className={styles.emptyTitle}>No light schedules yet</h3>
          <p className={styles.emptyText}>Create your first schedule to automate your lights</p>
          <button className={styles.createButton} onClick={openCreateModal}>
            Create Schedule
          </button>
        </div>
      ) : (
        <div className={styles.scheduleGrid}>
          {schedules.map(schedule => (
            <div key={schedule._id} className={`${styles.scheduleCard} ${!schedule.enabled ? styles.disabled : ''}`}>
              <div className={styles.scheduleHeader}>
                <h3 className={styles.scheduleName}>{schedule.name}</h3>
                <div className={styles.scheduleActions}>
                  <button 
                    className={styles.toggleButton} 
                    onClick={() => toggleSchedule(schedule._id, schedule.enabled)}
                    title={schedule.enabled ? 'Disable' : 'Enable'}
                  >
                    {schedule.enabled ? <Check size={18} /> : <X size={18} />}
                  </button>
                  <button 
                    className={styles.editButton} 
                    onClick={() => openEditModal(schedule)}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className={styles.deleteButton} 
                    onClick={() => deleteSchedule(schedule._id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className={styles.scheduleDetails}>
                <div className={styles.deviceInfo}>
                  <span className={styles.deviceIcon}>
                    {schedule.startTime < schedule.endTime ? <Sun size={18} /> : <Moon size={18} />}
                  </span>
                  <span className={styles.deviceName}>
                    {devices.find(d => d._id === schedule.deviceId)?.name || 'Unknown Device'}
                  </span>
                </div>
                
                <div className={styles.timeInfo}>
                  <Clock size={16} />
                  <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                </div>
                
                <div className={styles.daysInfo}>
                  <Calendar size={16} />
                  <div className={styles.daysList}>
                    {Object.entries(schedule.days).map(([day, isActive]) => (
                      <span 
                        key={day} 
                        className={`${styles.dayBadge} ${isActive ? styles.activeDay : styles.inactiveDay}`}
                        title={day.charAt(0).toUpperCase() + day.slice(1)}
                      >
                        {getDayLabel(day)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</h3>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Schedule Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Living Room Evenings"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="deviceId">Light/Device</label>
                <select
                  id="deviceId"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a device</option>
                  {devices.map(device => (
                    <option key={device._id} value={device._id}>
                      {device.name} ({device.location})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Days</label>
                <div className={styles.daysSelection}>
                  {Object.keys(formData.days).map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.dayButton} ${formData.days[day] ? styles.daySelected : ''}`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.timeInputs}>
                <div className={styles.formGroup}>
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="endTime">End Time</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                  />
                  Enable Schedule
                </label>
              </div>
              
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleLights;