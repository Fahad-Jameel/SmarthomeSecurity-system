import React, { useContext, useEffect, useState } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import AddSensorModal from '../components/sensors/AddSensorModal.js';
import SensorCard from '../components/sensors/SensorCard.js';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SensorManagement = () => {
  const { sensors, loading, getSensors, deleteSensor } = useContext(SecurityContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filteredSensors, setFilteredSensors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    getSensors();
  }, [getSensors]);
  
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
  
  const handleDeleteSensor = async (id) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      await deleteSensor(id);
    }
  };
  
  if (loading && sensors.length === 0) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sensor Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Sensor
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search sensors</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search sensors by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <label htmlFor="filter" className="mr-2">Filter by type:</label>
            <select
              id="filter"
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No sensors found</h3>
          <p className="text-gray-500 mb-4">
            {sensors.length === 0
              ? "You haven't added any sensors yet."
              : "No sensors match your current filters."}
          </p>
          {sensors.length === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Add Your First Sensor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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