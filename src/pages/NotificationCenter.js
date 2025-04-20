import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bell, Settings, Trash, Check, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './NotificationCenter.module.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedNotifId, setExpandedNotifId] = useState(null);
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    emailAddress: 'user@example.com',
    phoneNumber: '',
    notifyOnArm: true,
    notifyOnDisarm: true,
    notifyOnMotion: true,
    notifyOnDoor: true,
    notifyOnWindow: true,
    notifyOnBattery: true,
    notifyOnOffline: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/notifications');
      
      // Debug the response structure
      console.log('Notification response:', res.data);
      
      // Handle different response formats to extract the notifications array
      let notificationArray = [];
      if (Array.isArray(res.data)) {
        notificationArray = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        notificationArray = res.data.data;
      } else if (res.data.notifications && Array.isArray(res.data.notifications)) {
        notificationArray = res.data.notifications;
      } else {
        console.error('Unexpected notifications format:', res.data);
        notificationArray = []; // Default to empty array
      }
      
      setNotifications(notificationArray);
      
      // Handle unreadCount from response or calculate it
      if (res.data.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      } else {
        const unread = notificationArray.filter(notif => !notif.read).length;
        setUnreadCount(unread);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast.error('Failed to fetch notifications');
      setNotifications([]);
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(notifications.map(notif => {
        if (notif._id === notificationId) {
          return { ...notif, read: true };
        }
        return notif;
      }));
      
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all');
      
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      
      // Update local state
      const updatedNotifications = notifications.filter(notif => notif._id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const deletedNotif = notifications.find(notif => notif._id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }
    
    try {
      await axios.delete('/api/notifications');
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
    }
  };

  const saveNotificationSettings = async () => {
    try {
      await axios.post('/api/notifications/settings', notificationSettings);
      setShowSettings(false);
      toast.success('Notification settings saved');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      toast.error('Failed to save notification settings');
    }
  };

  const toggleNotifExpand = (notifId) => {
    setExpandedNotifId(expandedNotifId === notifId ? null : notifId);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'alert':
        return <AlertCircle size={20} className={styles.alertIcon} />;
      case 'info':
        return <Bell size={20} className={styles.infoIcon} />;
      case 'success':
        return <Check size={20} className={styles.successIcon} />;
      default:
        return <Bell size={20} />;
    }
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If it's today, just show the time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show the full date
    return date.toLocaleString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Notification Center</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.settingsButton} 
            onClick={() => setShowSettings(true)}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Loading notifications...</div>
      ) : (
        <div className={styles.content}>
          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <div className={styles.noNotifications}>
              <Bell size={48} />
              <h3>No notifications</h3>
              <p>You don't have any notifications at the moment.</p>
            </div>
          ) : (
            <>
              <div className={styles.notificationActions}>
                <button 
                  className={styles.markAllButton}
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check size={16} />
                  <span>Mark all as read</span>
                </button>
                <button 
                  className={styles.clearAllButton}
                  onClick={clearAllNotifications}
                >
                  <Trash size={16} />
                  <span>Clear all</span>
                </button>
              </div>
              
              <div className={styles.notificationList}>
                {notifications.map((notification) => (
                  <div 
                    key={notification._id || `temp-${Math.random()}`} 
                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                  >
                    <div className={styles.notificationHeader}>
                      <div className={styles.notificationInfo}>
                        {getNotificationIcon(notification.type)}
                        <div className={styles.notificationContent}>
                          <h3>{notification.title || 'Notification'}</h3>
                          <p className={styles.notificationSummary}>
                            {notification.message && notification.message.length > 100 && expandedNotifId !== notification._id
                              ? `${notification.message.substring(0, 100)}...`
                              : notification.message || 'No message content'}
                          </p>
                        </div>
                      </div>
                      <div className={styles.notificationActions}>
                        <span className={styles.timestamp}>
                          <Clock size={14} />
                          {formatNotificationTime(notification.timestamp)}
                        </span>
                        <button 
                          className={styles.expandButton}
                          onClick={() => toggleNotifExpand(notification._id)}
                        >
                          {expandedNotifId === notification._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    {expandedNotifId === notification._id && (
                      <div className={styles.notificationDetails}>
                        <p className={styles.notificationMessage}>
                          {notification.message || 'No message content'}
                        </p>
                        {notification.details && (
                          <div className={styles.notificationExtra}>
                            <p>{notification.details}</p>
                          </div>
                        )}
                        <div className={styles.notificationItemActions}>
                          {!notification.read && (
                            <button 
                              className={styles.markReadButton}
                              onClick={() => markAsRead(notification._id)}
                            >
                              <Check size={14} />
                              <span>Mark as read</span>
                            </button>
                          )}
                          <button 
                            className={styles.deleteButton}
                            onClick={() => deleteNotification(notification._id)}
                          >
                            <Trash size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Notification Settings Modal */}
      {showSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Notification Settings</h2>
              <button 
                className={styles.closeButton} 
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.settingsSection}>
                <h3>Notification Methods</h3>
                <div className={styles.settingItem}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.pushEnabled} 
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        pushEnabled: e.target.checked
                      })} 
                    />
                    <span>Push Notifications</span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.emailEnabled} 
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        emailEnabled: e.target.checked
                      })} 
                    />
                    <span>Email Notifications</span>
                  </label>
                  {notificationSettings.emailEnabled && (
                    <div className={styles.settingSubItem}>
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={notificationSettings.emailAddress} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          emailAddress: e.target.value
                        })} 
                      />
                    </div>
                  )}
                </div>
                <div className={styles.settingItem}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.smsEnabled} 
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        smsEnabled: e.target.checked
                      })} 
                    />
                    <span>SMS Notifications</span>
                  </label>
                  {notificationSettings.smsEnabled && (
                    <div className={styles.settingSubItem}>
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        value={notificationSettings.phoneNumber} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          phoneNumber: e.target.value
                        })} 
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h3>Event Types</h3>
                <p className={styles.settingDescription}>
                  Select which events you want to be notified about:
                </p>
                <div className={styles.settingGrid}>
                  <div className={styles.settingItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.notifyOnArm} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          notifyOnArm: e.target.checked
                        })} 
                      />
                      <span>System Armed</span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.notifyOnDisarm} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          notifyOnDisarm: e.target.checked
                        })} 
                      />
                      <span>System Disarmed</span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.notifyOnMotion} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          notifyOnMotion: e.target.checked
                        })} 
                      />
                      <span>Motion Detected</span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.notifyOnDoor} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          notifyOnDoor: e.target.checked
                        })} 
                      />
                      <span>Door Opened</span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.notifyOnWindow} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          notifyOnWindow: e.target.checked
                        })} 
                      />
                      <span>Window Opened</span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.notifyOnBattery} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          notifyOnBattery: e.target.checked
                        })} 
                      />
                      <span>Low Battery</span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.notifyOnOffline} 
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings, 
                          notifyOnOffline: e.target.checked
                        })} 
                      />
                      <span>Device Offline</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h3>Quiet Hours</h3>
                <div className={styles.settingItem}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.quietHoursEnabled} 
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings, 
                        quietHoursEnabled: e.target.checked
                      })} 
                    />
                    <span>Enable Quiet Hours</span>
                  </label>
                  {notificationSettings.quietHoursEnabled && (
                    <div className={styles.timeRange}>
                      <div className={styles.timeField}>
                        <label>From</label>
                        <input 
                          type="time" 
                          value={notificationSettings.quietHoursStart} 
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings, 
                            quietHoursStart: e.target.value
                          })} 
                        />
                      </div>
                      <div className={styles.timeField}>
                        <label>To</label>
                        <input 
                          type="time" 
                          value={notificationSettings.quietHoursEnd} 
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings, 
                            quietHoursEnd: e.target.value
                          })} 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <p className={styles.settingNote}>
                  During quiet hours, you'll only receive critical security alerts.
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton} 
                onClick={saveNotificationSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;