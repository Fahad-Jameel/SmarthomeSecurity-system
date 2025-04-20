import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, Filter, Clock, Search } from 'lucide-react';
import styles from './ActivityLog.module.css';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
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
      setActivities(res.data.activities);
      setTotalPages(Math.ceil(res.data.total / itemsPerPage));
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to fetch activity logs');
      setIsLoading(false);
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

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'arm':
        return <div className={`${styles.eventIcon} ${styles.arm}`}><span className={styles.iconSymbol}>🔒</span></div>;
      case 'disarm':
        return <div className={`${styles.eventIcon} ${styles.disarm}`}><span className={styles.iconSymbol}>🔓</span></div>;
      case 'sensor':
        return <div className={`${styles.eventIcon} ${styles.sensor}`}><span className={styles.iconSymbol}>📡</span></div>;
      case 'motion':
        return <div className={`${styles.eventIcon} ${styles.motion}`}><span className={styles.iconSymbol}>👣</span></div>;
      case 'door':
        return <div className={`${styles.eventIcon} ${styles.door}`}><span className={styles.iconSymbol}>🚪</span></div>;
      case 'system':
        return <div className={`${styles.eventIcon} ${styles.system}`}><span className={styles.iconSymbol}>⚙️</span></div>;
      case 'user':
        return <div className={`${styles.eventIcon} ${styles.user}`}><span className={styles.iconSymbol}>👤</span></div>;
      default:
        return <div className={`${styles.eventIcon} ${styles.other}`}><span className={styles.iconSymbol}>📝</span></div>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

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
        ) : activities.length === 0 ? (
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
              
              {activities.map((activity) => (
                <div key={activity._id} className={styles.activityItem}>
                  <div className={styles.eventType}>
                    {getEventIcon(activity.eventType)}
                    <span>{activity.eventType.charAt(0).toUpperCase() + activity.eventType.slice(1)}</span>
                  </div>
                  <div className={styles.description}>
                    {activity.description}
                  </div>
                  <div className={styles.timestamp}>
                    <Clock size={14} />
                    <span>{formatDate(activity.timestamp)}</span>
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