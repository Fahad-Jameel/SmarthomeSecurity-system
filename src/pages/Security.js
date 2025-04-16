import React, { useContext, useEffect, useState } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import SystemStatus from '../components/dashboard/SystemStatus';
import ActivityLog from '../components/security/ActivityLog';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Security = () => {
  const { 
    systemStatus, 
    logs, 
    loading, 
    getLogs, 
    changeSystemState 
  } = useContext(SecurityContext);
  
  const [logsFilter, setLogsFilter] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState([]);
  
  useEffect(() => {
    getLogs();
    
    // Refresh logs every 30 seconds
    const interval = setInterval(() => {
      getLogs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [getLogs]);
  
  useEffect(() => {
    if (logsFilter === 'all') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.eventType === logsFilter));
    }
  }, [logs, logsFilter]);
  
  const handleArmDisarm = async (action) => {
    await changeSystemState(action);
  };
  
  if (loading && logs.length === 0) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Security Control</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SystemStatus 
            status={systemStatus} 
            onArmDisarm={handleArmDisarm} 
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
          <div className="space-y-4 flex-grow">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <svg className="w-10 h-10 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h3 className="font-medium">Security Company</h3>
                <p className="text-sm text-blue-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <svg className="w-10 h-10 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium">Emergency (911)</h3>
                <p className="text-sm text-red-600">911</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium">
              Call Emergency Services
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Activity Log</h2>
          <div>
            <label htmlFor="logsFilter" className="mr-2 text-sm">Filter:</label>
            <select
              id="logsFilter"
              className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={logsFilter}
              onChange={(e) => setLogsFilter(e.target.value)}
            >
              <option value="all">All events</option>
              <option value="arm">Arm events</option>
              <option value="disarm">Disarm events</option>
              <option value="trigger">Triggers</option>
              <option value="alert">Alerts</option>
              <option value="system">System events</option>
            </select>
          </div>
        </div>
        
        <ActivityLog logs={filteredLogs} />
      </div>
    </div>
  );
};

export default Security;