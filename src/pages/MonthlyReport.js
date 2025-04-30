// MonthlyReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar, ChevronLeft, ChevronRight, Download, BarChart2, Clock, FileText, Bell, Shield } from 'lucide-react';
import styles from './MonthlyReport.module.css';

const MonthlyReport = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reportData, setReportData] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  useEffect(() => {
    fetchReportsList();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchReportData(selectedMonth);
    }
  }, [selectedMonth]);

  const fetchReportsList = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/reports');
      setReports(res.data);
    } catch (error) {
      console.error('Error fetching reports list:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchReportData = async (month) => {
  //   try {
  //     setIsLoading(true);
  //     setReportData(null);
  //     const res = await axios.get(`/api/reports/${month}`);
  //     setReportData(res.data);
  //   } catch (error) {
  //     console.error('Error fetching report data:', error);
  //     toast.error('Failed to load report for this month');
  //     setReportData(null);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    }
  };
  
  // For a specific report
  const fetchReportData = async (month) => {
    try {
      const res = await axios.get(`/api/reports/${month}`);
      setReportData(res.data.data || null);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report');
    }
  };
  const downloadReport = async (format = 'pdf') => {
    try {
      const res = await axios.get(`/api/reports/${selectedMonth}/download?format=${format}`, {
        responseType: 'blob'
      });
      
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HomeSafe_Report_${monthName}_${year}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success(`Report downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const handleMonthChange = (offset) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newDate = new Date(year, month - 1 + offset, 1);
    
    // Don't allow selecting future months
    const today = new Date();
    if (newDate > today) {
      return;
    }
    
    // Don't allow selecting months before the oldest report
    if (reports.length > 0) {
      const oldestReport = reports[reports.length - 1];
      const [oldestYear, oldestMonth] = oldestReport.month.split('-').map(Number);
      const oldestDate = new Date(oldestYear, oldestMonth - 1, 1);
      
      if (newDate < oldestDate) {
        return;
      }
    }
    
    setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatMonthYear = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const renderEventTypeChart = () => {
    if (!reportData || !reportData.eventTypeSummary) return null;
    
    const eventTypes = Object.keys(reportData.eventTypeSummary);
    const maxCount = Math.max(...Object.values(reportData.eventTypeSummary));
    
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>Event Types</h3>
        <div className={styles.barChart}>
          {eventTypes.map(type => {
            const count = reportData.eventTypeSummary[type];
            const percentage = (count / maxCount) * 100;
            
            return (
              <div key={type} className={styles.barGroup}>
                <div className={styles.barLabel}>{type}</div>
                <div className={styles.barWrapper}>
                  <div 
                    className={styles.bar} 
                    style={{ width: `${percentage}%` }}
                    title={`${count} events`}
                  />
                </div>
                <div className={styles.barValue}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getEventIcon = (eventType) => {
    switch(eventType.toLowerCase()) {
      case 'arm':
      case 'disarm':
        return <Shield size={16} />;
      case 'motion':
      case 'door':
      case 'window':
      case 'sensor':
        return <Bell size={16} />;
      case 'system':
        return <FileText size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Monthly Activity Report</h1>
      
      <div className={styles.reportSelection}>
        <div className={styles.monthNavigator}>
          <button
            className={styles.navButton}
            onClick={() => handleMonthChange(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <div className={styles.currentMonth}>
            <Calendar size={18} />
            <span>{formatMonthYear(selectedMonth)}</span>
          </div>
          <button
            className={styles.navButton}
            onClick={() => handleMonthChange(1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className={styles.actions}>
          <div className={styles.downloadDropdown}>
            <button className={styles.downloadButton}>
              <Download size={18} />
              <span>Download</span>
            </button>
            <div className={styles.dropdownContent}>
              <button onClick={() => downloadReport('pdf')}>PDF Format</button>
              <button onClick={() => downloadReport('csv')}>CSV Format</button>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Loading report data...</div>
      ) : !reportData ? (
        <div className={styles.noReportData}>
          <FileText size={48} />
          <h3>No report data available for {formatMonthYear(selectedMonth)}</h3>
          <p>Try selecting a different month or check back later</p>
        </div>
      ) : (
        <div className={styles.reportContent}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h2 className={styles.summaryTitle}>Monthly Summary</h2>
              <p className={styles.summaryPeriod}>{formatMonthYear(selectedMonth)}</p>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Bell size={24} /></div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statTitle}>Total Events</h3>
                  <p className={styles.statValue}>{reportData.totalEvents}</p>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Shield size={24} /></div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statTitle}>Security Alerts</h3>
                  <p className={styles.statValue}>{reportData.securityAlerts}</p>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Clock size={24} /></div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statTitle}>System Armed</h3>
                  <p className={styles.statValue}>{reportData.systemArmedPercentage}% of time</p>
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statIcon}><BarChart2 size={24} /></div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statTitle}>Most Active</h3>
                  <p className={styles.statValue}>{reportData.mostActiveSensor || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {reportData.insights && reportData.insights.length > 0 && (
              <div className={styles.insightsSection}>
                <h3 className={styles.insightsTitle}>Monthly Insights</h3>
                <ul className={styles.insightsList}>
                  {reportData.insights.map((insight, index) => (
                    <li key={index} className={styles.insightItem}>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className={styles.chartsSection}>
            {renderEventTypeChart()}
            
            {reportData.activityByDay && (
              // Continuing MonthlyReport.js
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>Activity by Day</h3>
                <div className={styles.calendarChart}>
                  <div className={styles.daysHeader}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className={styles.dayHeader}>{day}</div>
                    ))}
                  </div>
                  
                  <div className={styles.calendarGrid}>
                    {reportData.activityByDay.map((day, index) => {
                      // Calculate intensity based on event count
                      let intensityClass = '';
                      if (day.count > 0) {
                        const maxEvents = Math.max(...reportData.activityByDay.map(d => d.count));
                        const intensity = Math.ceil((day.count / maxEvents) * 4);
                        intensityClass = styles[`intensity${intensity}`];
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className={`${styles.calendarDay} ${day.count > 0 ? intensityClass : ''} ${!day.inMonth ? styles.outsideMonth : ''}`}
                          title={day.count > 0 ? `${day.date}: ${day.count} events` : ''}
                        >
                          <div className={styles.dayNumber}>{new Date(day.date).getDate()}</div>
                          {day.count > 0 && <div className={styles.eventCount}>{day.count}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.activitySection}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>Recent Activity Log</h3>
              <button 
                className={styles.viewToggle}
                onClick={() => setShowFullReport(!showFullReport)}
              >
                {showFullReport ? 'Show Less' : 'Show All'}
              </button>
            </div>
            
            <div className={styles.activityTable}>
              <div className={styles.tableHeader}>
                <div className={styles.timeColumn}>Time</div>
                <div className={styles.typeColumn}>Type</div>
                <div className={styles.descriptionColumn}>Description</div>
              </div>
              
              <div className={styles.tableBody}>
                {(showFullReport ? reportData.events : reportData.events.slice(0, 10)).map((event, index) => (
                  <div key={index} className={styles.tableRow}>
                    <div className={styles.timeColumn}>
                      {new Date(event.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className={styles.typeColumn}>
                      <span className={`${styles.eventType} ${styles[event.eventType.toLowerCase()]}`}>
                        {getEventIcon(event.eventType)}
                        <span>{event.eventType}</span>
                      </span>
                    </div>
                    <div className={styles.descriptionColumn}>
                      {event.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {!showFullReport && reportData.events.length > 10 && (
              <div className={styles.viewMoreContainer}>
                <button 
                  className={styles.viewMoreButton}
                  onClick={() => setShowFullReport(true)}
                >
                  View All {reportData.events.length} Events
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;