import React, { useState, useContext } from 'react';
import { SecurityContext } from '../../context/SecurityContext';
import { toast } from 'react-toastify';

const SensorCard = ({ sensor, onDelete }) => {
  const { updateSensor } = useContext(SecurityContext);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const getStatusColor = () => {
    switch (sensor.status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'triggered':
        return 'bg-red-500';
      case 'offline':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getSensorIcon = () => {
    switch (sensor.type) {
      case 'motion':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'door':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        );
      case 'window':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'camera':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'smoke':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'temperature':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              sensor.type === 'motion' ? 'bg-blue-100 text-blue-600' :
              sensor.type === 'door' ? 'bg-green-100 text-green-600' :
              sensor.type === 'window' ? 'bg-purple-100 text-purple-600' :
              sensor.type === 'camera' ? 'bg-red-100 text-red-600' : 
              'bg-gray-100 text-gray-600'
            } mr-3`}>
              {getSensorIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{sensor.name}</h3>
              <p className="text-gray-600 text-sm">{sensor.location}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-1`}></div>
            <span className="text-xs font-medium capitalize">{sensor.status}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Battery</span>
            <span className="text-sm font-medium">{sensor.batteryLevel}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                sensor.batteryLevel > 70 ? 'bg-green-500' : 
                sensor.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${sensor.batteryLevel}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div>
            <span className="text-xs text-gray-500">Zone</span>
            <p className="text-sm font-medium capitalize">{sensor.zone}</p>
          </div>
          {sensor.lastTriggered && (
            <div>
              <span className="text-xs text-gray-500">Last Triggered</span>
              <p className="text-sm font-medium">
                {new Date(sensor.lastTriggered).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4 flex">
        <button
          onClick={toggleStatus}
          className={`flex-1 flex justify-center items-center text-sm py-2 ${
            isUpdating ? 'bg-gray-100 text-gray-400' : 
            sensor.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
          }`}
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : sensor.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
        <div className="w-px bg-gray-200"></div>
        <button
          onClick={onDelete}
          className="flex-1 flex justify-center items-center text-sm text-gray-600 py-2 hover:bg-gray-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SensorCard;