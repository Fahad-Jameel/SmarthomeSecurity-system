import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Map, Plus, Edit, Trash, Home, Check, X, Camera, Radio } from 'lucide-react';
import styles from './ZoneManagement.module.css';

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showEditZone, setShowEditZone] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [newZone, setNewZone] = useState({
    name: '',
    description: '',
    color: '#4169E1',
    sensors: []
  });

  useEffect(() => {
    fetchZones();
    fetchSensors();
  }, []);

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
      
      console.log('Processed zones data:', zonesData);
      
      setZones(zonesData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching zones:', err);
      toast.error('Failed to fetch zones');
      setIsLoading(false);
      setZones([]);
    }
  };

  const fetchSensors = async () => {
    try {
      const res = await axios.get('/api/sensors');
      
      console.log('Sensors API response:', res.data);
      
      // Handle different response formats to extract the sensors array
      let sensorsData = [];
      if (Array.isArray(res.data)) {
        sensorsData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        sensorsData = res.data.data;
      } else if (res.data && Array.isArray(res.data.sensors)) {
        sensorsData = res.data.sensors;
      } else {
        console.error('Unexpected sensors data format:', res.data);
        sensorsData = [];
      }
      
      console.log('Processed sensors data:', sensorsData);
      
      setSensors(sensorsData);
    } catch (err) {
      console.error('Error fetching sensors:', err);
      toast.error('Failed to fetch sensors');
      setSensors([]);
    }
  };

  const handleAddZone = async () => {
    try {
      if (!newZone.name.trim()) {
        toast.error('Zone name is required');
        return;
      }

      const res = await axios.post('/api/zones', newZone);
      console.log('Add zone response:', res.data);
      
      // Handle different response formats
      let newZoneData = res.data;
      if (res.data && res.data.data) {
        newZoneData = res.data.data;
      }
      
      // Refresh all zones after adding a new one
      await fetchZones();
      
      setNewZone({
        name: '',
        description: '',
        color: '#4169E1',
        sensors: []
      });
      setShowAddZone(false);
      toast.success('Zone created successfully');
    } catch (err) {
      console.error('Error creating zone:', err);
      toast.error('Failed to create zone');
    }
  };

  const handleUpdateZone = async () => {
    try {
      if (!editingZone.name.trim()) {
        toast.error('Zone name is required');
        return;
      }

      // Make a copy of the editing zone to ensure clean data
      const zoneToUpdate = { ...editingZone };
      
      // Ensure sensors is an array of IDs
      if (zoneToUpdate.sensors) {
        if (Array.isArray(zoneToUpdate.sensors)) {
          zoneToUpdate.sensors = zoneToUpdate.sensors.map(sensor => 
            typeof sensor === 'object' && sensor._id ? sensor._id : sensor
          );
        } else {
          zoneToUpdate.sensors = [];
        }
      }

      console.log('Sending zone update:', zoneToUpdate);
      const res = await axios.put(`/api/zones/${zoneToUpdate._id}`, zoneToUpdate);
      console.log('Update zone response:', res.data);
      
      // Refresh zones to get the latest data with populated sensors
      await fetchZones();
      
      setShowEditZone(false);
      setEditingZone(null);
      toast.success('Zone updated successfully');
    } catch (err) {
      console.error('Error updating zone:', err);
      toast.error('Failed to update zone');
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) {
      return;
    }

    try {
      await axios.delete(`/api/zones/${zoneId}`);
      setZones(zones.filter(zone => zone._id !== zoneId));
      toast.success('Zone deleted successfully');
    } catch (err) {
      console.error('Error deleting zone:', err);
      toast.error('Failed to delete zone');
    }
  };

  const handleSensorToggle = (sensorId) => {
    if (showAddZone) {
      const updatedSensors = newZone.sensors.includes(sensorId)
        ? newZone.sensors.filter(id => id !== sensorId)
        : [...newZone.sensors, sensorId];
      
      setNewZone({
        ...newZone,
        sensors: updatedSensors
      });
    } else if (showEditZone && editingZone) {
      // Initialize sensors array if it doesn't exist
      const currentSensors = Array.isArray(editingZone.sensors) ? editingZone.sensors : [];
      
      // Convert current sensors to strings for comparison
      const currentSensorIds = currentSensors.map(sensor => 
        typeof sensor === 'object' && sensor._id ? sensor._id : sensor
      );
      
      // Check if sensor is already in the array
      const sensorExists = currentSensorIds.includes(sensorId);
      
      // Update the sensors array
      const updatedSensors = sensorExists
        ? currentSensorIds.filter(id => id !== sensorId)
        : [...currentSensorIds, sensorId];
      
      setEditingZone({
        ...editingZone,
        sensors: updatedSensors
      });
    }
  };

  // Helper function to check if a sensor is in a zone
  const isSensorInZone = (sensor, zone) => {
    if (!zone || !zone.sensors || !Array.isArray(zone.sensors)) {
      return false;
    }
    
    return zone.sensors.some(zoneSensor => {
      // If zoneSensor is a string ID
      if (typeof zoneSensor === 'string') {
        return zoneSensor === sensor._id;
      }
      // If zoneSensor is an object with _id
      if (typeof zoneSensor === 'object' && zoneSensor._id) {
        return zoneSensor._id === sensor._id;
      }
      return false;
    });
  };

  const getSensorIcon = (type) => {
    if (!type) return <Radio size={18} />;
    
    switch (type.toLowerCase()) {
      case 'motion':
        return <Radio size={18} />;
      case 'door':
      case 'window':
        return <Home size={18} />;
      case 'camera':
        return <Camera size={18} />;
      default:
        return <Radio size={18} />;
    }
  };

  const getSensorTypeLabel = (type) => {
    if (!type) return 'Unknown';
    
    switch (type.toLowerCase()) {
      case 'motion':
        return 'Motion Sensor';
      case 'door':
        return 'Door Sensor';
      case 'window':
        return 'Window Sensor';
      case 'camera':
        return 'Camera';
      default:
        return type;
    }
  };

  const getSensorsForZone = (zone) => {
    if (!Array.isArray(sensors) || sensors.length === 0 || !zone.sensors) {
      return [];
    }
    
    // Convert all zone.sensors to strings for comparison
    const zoneSensorIds = Array.isArray(zone.sensors) 
      ? zone.sensors.map(s => typeof s === 'object' && s._id ? s._id : s.toString())
      : [];
    
    // Filter sensors that belong to this zone
    return sensors.filter(sensor => {
      if (!sensor || !sensor._id) return false;
      return zoneSensorIds.includes(sensor._id.toString());
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Zone Management</h1>
        <button 
          className={styles.addButton} 
          onClick={() => setShowAddZone(true)}
        >
          <Plus size={16} />
          <span>Add Zone</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Loading zones...</div>
      ) : (
        <div className={styles.content}>
          {zones.length === 0 && !showAddZone ? (
            <div className={styles.noZones}>
              <Map size={48} />
              <h3>No zones created yet</h3>
              <p>Create zones to group your sensors by areas of your home.</p>
              <button 
                className={styles.createButton} 
                onClick={() => setShowAddZone(true)}
              >
                <Plus size={16} />
                <span>Create your first zone</span>
              </button>
            </div>
          ) : (
            <div className={styles.zoneGrid}>
              {zones.map((zone) => {
                // Get sensors for this zone
                const zoneSensors = getSensorsForZone(zone);
                console.log(`Zone ${zone.name} sensors:`, zoneSensors);
                
                return (
                  <div key={zone._id || `zone-${Math.random()}`} className={styles.zoneCard}>
                    <div 
                      className={styles.zoneHeader} 
                      style={{ backgroundColor: zone.color }}
                    >
                      <h3>{zone.name}</h3>
                      <div className={styles.zoneActions}>
                        <button 
                          className={styles.editButton}
                          onClick={() => {
                            setEditingZone(zone);
                            setShowEditZone(true);
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleDeleteZone(zone._id)}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.zoneContent}>
                      {zone.description && (
                        <p className={styles.zoneDescription}>{zone.description}</p>
                      )}
                      <div className={styles.zoneSensors}>
                        <h4>Sensors in this zone</h4>
                        {zoneSensors.length === 0 ? (
                          <p className={styles.noSensors}>No sensors assigned to this zone.</p>
                        ) : (
                          <div className={styles.sensorList}>
                            {zoneSensors.map(sensor => (
                              <div key={sensor._id || `sensor-${Math.random()}`} className={styles.sensorItem}>
                                {getSensorIcon(sensor.type)}
                                <span>{sensor.name || 'Unnamed Sensor'}</span>
                                <span className={styles.sensorType}>
                                  {getSensorTypeLabel(sensor.type)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Add Zone Modal */}
      {showAddZone && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add New Zone</h2>
              <button className={styles.closeButton} onClick={() => setShowAddZone(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Zone Name *</label>
                <input 
                  type="text" 
                  value={newZone.name} 
                  onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                  placeholder="e.g. Upstairs, Living Room"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  value={newZone.description} 
                  onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                  placeholder="Optional description of this zone"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Color</label>
                <div className={styles.colorPicker}>
                  <input 
                    type="color" 
                    value={newZone.color} 
                    onChange={(e) => setNewZone({...newZone, color: e.target.value})}
                  />
                  <span>{newZone.color}</span>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Assign Sensors</label>
                {!Array.isArray(sensors) || sensors.length === 0 ? (
                  <p className={styles.noSensors}>No sensors available. Add sensors first.</p>
                ) : (
                  <div className={styles.sensorSelection}>
                    {sensors.map((sensor) => (
                      <div 
                        key={sensor._id || `sens-${Math.random()}`} 
                        className={`${styles.sensorOption} ${newZone.sensors.includes(sensor._id) ? styles.selected : ''}`}
                        onClick={() => handleSensorToggle(sensor._id)}
                      >
                        <div className={styles.sensorCheck}>
                          {newZone.sensors.includes(sensor._id) && <Check size={16} />}
                        </div>
                        <div className={styles.sensorInfo}>
                          {getSensorIcon(sensor.type)}
                          <span>{sensor.name || 'Unnamed Sensor'}</span>
                          <span className={styles.sensorType}>
                            {getSensorTypeLabel(sensor.type)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={() => setShowAddZone(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton} 
                onClick={handleAddZone}
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Zone Modal */}
      {showEditZone && editingZone && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Edit Zone</h2>
              <button className={styles.closeButton} onClick={() => {
                setShowEditZone(false);
                setEditingZone(null);
              }}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Zone Name *</label>
                <input 
                  type="text" 
                  value={editingZone.name} 
                  onChange={(e) => setEditingZone({...editingZone, name: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  value={editingZone.description || ''} 
                  onChange={(e) => setEditingZone({...editingZone, description: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Color</label>
                <div className={styles.colorPicker}>
                  <input 
                    type="color" 
                    value={editingZone.color || '#4169E1'} 
                    onChange={(e) => setEditingZone({...editingZone, color: e.target.value})}
                  />
                  <span>{editingZone.color || '#4169E1'}</span>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Assign Sensors</label>
                {!Array.isArray(sensors) || sensors.length === 0 ? (
                  <p className={styles.noSensors}>No sensors available. Add sensors first.</p>
                ) : (
                  <div className={styles.sensorSelection}>
                    {sensors.map((sensor) => {
                      // Check if this sensor is in the zone
                      const isSelected = isSensorInZone(sensor, editingZone);
                      
                      return (
                        <div 
                          key={sensor._id || `s-edit-${Math.random()}`} 
                          className={`${styles.sensorOption} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSensorToggle(sensor._id)}
                        >
                          <div className={styles.sensorCheck}>
                            {isSelected && <Check size={16} />}
                          </div>
                          <div className={styles.sensorInfo}>
                            {getSensorIcon(sensor.type)}
                            <span>{sensor.name || 'Unnamed Sensor'}</span>
                            <span className={styles.sensorType}>
                              {getSensorTypeLabel(sensor.type)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={() => {
                  setShowEditZone(false);
                  setEditingZone(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton} 
                onClick={handleUpdateZone}
              >
                Update Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManagement;