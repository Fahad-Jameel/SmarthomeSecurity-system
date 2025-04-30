import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, Filter, Clock, Search, Shield, Radio, Lock, Bell } from 'lucide-react';
import styles from './ActivityLog.module.css';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
    fetchSecurityLogs();
  }, [filter, currentPage, dateRange]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        eventType: filter !== 'all' ? filter : undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        search: searchQuery || undefined
      };
      
      const res = await axios.get('/api/activities', { params });
      
      // Handle different response formats
      let activitiesData = [];
      if (Array.isArray(res.data)) {
        activitiesData = res.data;
      } else if (res.data && Array.isArray(res.data.activities)) {
        activitiesData = res.data.activities;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        activitiesData = res.data.data;
      } else {
        console.error('Unexpected activities data format:', res.data);
        activitiesData = [];
      }
      
      setActivities(activitiesData);
      
      // Calculate total pages if available in response
      if (res.data && res.data.total) {
        setTotalPages(Math.ceil(res.data.total / itemsPerPage));
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      toast.error('Failed to fetch activity logs');
      setIsLoading(false);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const res = await axios.get('/api/security/logs');
      
      // Handle different response formats
      let logsData = [];
      if (Array.isArray(res.data)) {
        logsData = res.data;
      } else if (res.data && Array.isArray(res.data.logs)) {
        logsData = res.data.logs;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        logsData = res.data.data;
      } else {
        console.error('Unexpected security logs data format:', res.data);
        logsData = [];
      }
      
      setSecurityLogs(logsData);
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
      toast.error('Failed to fetch security logs');
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e, type) => {
    setDateRange({
      ...dateRange,
      [type]: e.target.value
    });
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Combine activities and security logs
  const getAllLogs = () => {
    // Transform security logs to match activity format for display
    const formattedSecurityLogs = securityLogs.map(log => ({
      _id: log._id || `security-${Math.random()}`,
      eventType: log.eventType || 'system',
      description: log.message || log.description || 'System event',
      timestamp: log.timestamp || log.createdAt || new Date(),
      source: 'security',
      isSecurityLog: true
    }));
    
    // Combine both arrays
    const combinedLogs = [...activities, ...formattedSecurityLogs];
    
    // Sort by most recent first
    combinedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply filter if not set to 'all'
    if (filter !== 'all') {
      return combinedLogs.filter(log => 
        log.eventType === filter || 
        (filter === 'system' && log.isSecurityLog)
      );
    }
    
    return combinedLogs;
  };

  const getEventIcon = (log) => {
    // For security logs, use a shield icon
    if (log.isSecurityLog) {
      return <div className={`${styles.eventIcon} ${styles.system}`}><Shield size={18} /></div>;
    }
    
    // For regular activity logs
    switch(log.eventType) {
      case 'arm':
        return <div className={`${styles.eventIcon} ${styles.arm}`}><Lock size={18} /></div>;
      case 'disarm':
        return <div className={`${styles.eventIcon} ${styles.disarm}`}><Lock size={18} /></div>;
      case 'sensor':
        return <div className={`${styles.eventIcon} ${styles.sensor}`}><Radio size={18} /></div>;
      case 'motion':
        return <div className={`${styles.eventIcon} ${styles.motion}`}><Radio size={18} /></div>;
      case 'door':
        return <div className={`${styles.eventIcon} ${styles.door}`}><Radio size={18} /></div>;
      case 'system':
        return <div className={`${styles.eventIcon} ${styles.system}`}><Shield size={18} /></div>;
      case 'user':
        return <div className={`${styles.eventIcon} ${styles.user}`}><Bell size={18} /></div>;
      default:
        return <div className={`${styles.eventIcon} ${styles.other}`}><Bell size={18} /></div>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const allLogs = getAllLogs();

  return (
    <div className={styles.container}>
      <h1>Activity Log</h1>
      
      <div className={styles.filterSection}>
        <div className={styles.filterCard}>
          <div className={styles.filterHeader}>
            <Filter size={16} />
            <h3>Filter Events</h3>
          </div>
          
          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <label>Event Type</label>
              <select value={filter} onChange={handleFilterChange}>
                <option value="all">All Events</option>
                <option value="arm">System Armed</option>
                <option value="disarm">System Disarmed</option>
                <option value="sensor">Sensor Events</option>
                <option value="motion">Motion Detected</option>
                <option value="door">Door/Window Events</option>
                <option value="system">System Events</option>
                <option value="user">User Actions</option>
              </select>
            </div>
            
            <div className={styles.filterGroup}>
              <label>Date Range</label>
              <div className={styles.dateInputs}>
                <div className={styles.dateField}>
                  <label>From</label>
                  <input 
                    type="date" 
                    value={dateRange.startDate} 
                    onChange={(e) => handleDateChange(e, 'startDate')}
                  />
                </div>
                <div className={styles.dateField}>
                  <label>To</label>
                  <input 
                    type="date" 
                    value={dateRange.endDate} 
                    onChange={(e) => handleDateChange(e, 'endDate')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.searchGroup}>
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search activities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className={styles.logSection}>
        {isLoading ? (
          <div className={styles.loading}>Loading activity logs...</div>
        ) : allLogs.length === 0 ? (
          <div className={styles.noActivities}>
            <Calendar size={48} />
            <h3>No activities found</h3>
            <p>Try adjusting your filters or date range to see more results.</p>
          </div>
        ) : (
          <>
            <div className={styles.activityList}>
              <div className={styles.activityHeader}>
                <span>Event</span>
                <span>Description</span>
                <span>Date & Time</span>
              </div>
              
              {allLogs.map((log) => (
                <div key={log._id} className={styles.activityItem}>
                  <div className={styles.eventType}>
                    {getEventIcon(log)}
                    <span>{log.eventType.charAt(0).toUpperCase() + log.eventType.slice(1)}</span>
                  </div>
                  <div className={styles.description}>
                    {log.description}
                  </div>
                  <div className={styles.timestamp}>
                    <Clock size={14} />
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.pagination}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className={styles.pageButton}
              >
                Previous
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className={styles.pageButton}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;