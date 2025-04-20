import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Unlock, Plus, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, Settings, Power } from 'lucide-react';
import styles from './SmartLock.module.css';

const SmartLock = () => {
  const [locks, setLocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLockId, setExpandedLockId] = useState(null);
  const [showAddLock, setShowAddLock] = useState(false);
  const [availableLocks, setAvailableLocks] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selectedLock, setSelectedLock] = useState(null);

  useEffect(() => {
    fetchLocks();
  }, []);

  const fetchLocks = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/smart-locks');
      setLocks(res.data);
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to fetch smart locks');
      setIsLoading(false);
    }
  };

  const scanForLocks = async () => {
    try {
      setScanning(true);
      const res = await axios.get('/api/smart-locks/discover');
      setAvailableLocks(res.data);
      setScanning(false);
      if (res.data.length === 0) {
        toast.info('No new smart locks found');
      }
    } catch (err) {
      toast.error('Failed to scan for new locks');
      setScanning(false);
    }
  };

  const addLock = async () => {
    try {
      if (!selectedLock) {
        toast.error('Please select a lock to add');
        return;
      }

      const res = await axios.post('/api/smart-locks', {
        deviceId: selectedLock.deviceId,
        name: selectedLock.name
      });
      
      setLocks([...locks, res.data]);
      setShowAddLock(false);
      setSelectedLock(null);
      setAvailableLocks([]);
      toast.success('Smart lock added successfully');
    } catch (err) {
      toast.error('Failed to add smart lock');
    }
  };

  const toggleLock = async (lockId, currentState) => {
    const action = currentState === 'locked' ? 'unlock' : 'lock';
    try {
      await axios.post(`/api/smart-locks/${lockId}/${action}`);
      
      setLocks(locks.map(lock => {
        if (lock._id === lockId) {
          return {
            ...lock,
            state: action === 'lock' ? 'locked' : 'unlocked'
          };
        }
        return lock;
      }));
      
      toast.success(`Lock ${action === 'lock' ? 'locked' : 'unlocked'} successfully`);
    } catch (err) {
      toast.error(`Failed to ${action} smart lock`);
    }
  };

  const toggleLockExpand = (lockId) => {
    setExpandedLockId(expandedLockId === lockId ? null : lockId);
  };

  const formatBatteryLevel = (level) => {
    if (level < 20) {
      return { text: 'Low', color: '#ff3b30' };
    } else if (level < 50) {
      return { text: 'Medium', color: '#ffcc00' };
    } else {
      return { text: 'Good', color: '#34c759' };
    }
  };

  const getLockStatusClass = (state) => {
    switch (state) {
      case 'locked':
        return styles.locked;
      case 'unlocked':
        return styles.unlocked;
      case 'jammed':
        return styles.jammed;
      case 'offline':
        return styles.offline;
      default:
        return '';
    }
  };

  const renderLockStatus = (lock) => {
    if (lock.state === 'locked') {
      return (
        <div className={`${styles.statusBadge} ${styles.locked}`}>
          <Lock size={14} />
          <span>Locked</span>
        </div>
      );
    } else if (lock.state === 'unlocked') {
      return (
        <div className={`${styles.statusBadge} ${styles.unlocked}`}>
          <Unlock size={14} />
          <span>Unlocked</span>
        </div>
      );
    } else if (lock.state === 'jammed') {
      return (
        <div className={`${styles.statusBadge} ${styles.jammed}`}>
          <AlertTriangle size={14} />
          <span>Jammed</span>
        </div>
      );
    } else if (lock.state === 'offline') {
      return (
        <div className={`${styles.statusBadge} ${styles.offline}`}>
          <Power size={14} />
          <span>Offline</span>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Smart Locks</h1>
        <button 
          className={styles.addButton} 
          onClick={() => setShowAddLock(true)}
        >
          <Plus size={16} />
          <span>Add Smart Lock</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Loading smart locks...</div>
      ) : (
        <div className={styles.content}>
          {locks.length === 0 && !showAddLock ? (
            <div className={styles.noLocks}>
              <Lock size={48} />
              <h3>No smart locks found</h3>
              <p>Connect your smart locks to control them remotely and integrate with your security system.</p>
              <button 
                className={styles.scanButton} 
                onClick={() => setShowAddLock(true)}
              >
                <Plus size={16} />
                <span>Add your first smart lock</span>
              </button>
            </div>
          ) : (
            <div className={styles.locksList}>
              {locks.map((lock) => (
                <div key={lock._id} className={styles.lockCard}>
                  <div className={styles.lockHeader}>
                    <div className={styles.lockInfo}>
                      <h3>{lock.name}</h3>
                      {renderLockStatus(lock)}
                    </div>
                    <div className={styles.lockActions}>
                      {lock.state !== 'offline' && lock.state !== 'jammed' && (
                        <button 
                          className={`${styles.toggleButton} ${getLockStatusClass(lock.state)}`}
                          onClick={() => toggleLock(lock._id, lock.state)}
                          disabled={lock.state === 'offline' || lock.state === 'jammed'}
                        >
                          {lock.state === 'locked' ? (
                            <>
                              <Unlock size={16} />
                              <span>Unlock</span>
                            </>
                          ) : (
                            <>
                              <Lock size={16} />
                              <span>Lock</span>
                            </>
                          )}
                        </button>
                      )}
                      <button 
                        className={styles.expandButton}
                        onClick={() => toggleLockExpand(lock._id)}
                      >
                        {expandedLockId === lock._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedLockId === lock._id && (
                    <div className={styles.lockDetails}>
                      <div className={styles.detailSection}>
                        <h4>Device Info</h4>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Model:</span>
                          <span>{lock.model || 'Unknown'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Firmware:</span>
                          <span>{lock.firmware || 'Unknown'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Battery:</span>
                          <span 
                            className={styles.batteryLevel}
                            style={{ color: formatBatteryLevel(lock.batteryLevel).color }}
                          >
                            {lock.batteryLevel}% ({formatBatteryLevel(lock.batteryLevel).text})
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Last Activity:</span>
                          <span>{lock.lastActivity ? new Date(lock.lastActivity).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailSection}>
                        <h4>Settings</h4>
                        <div className={styles.settingItem}>
                          <label>
                            <input 
                              type="checkbox" 
                              checked={lock.autoLock} 
                              onChange={() => {}} 
                            />
                            <span>Auto-lock after 30 seconds</span>
                          </label>
                        </div>
                        <div className={styles.settingItem}>
                          <label>
                            <input 
                              type="checkbox" 
                              checked={lock.armOnLock} 
                              onChange={() => {}} 
                            />
                            <span>Arm system when locked</span>
                          </label>
                        </div>
                        <div className={styles.settingItem}>
                          <label>
                            <input 
                              type="checkbox" 
                              checked={lock.notifyOnUnlock} 
                              onChange={() => {}} 
                            />
                            <span>Notify on unlock</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className={styles.detailActions}>
                        <button className={styles.settingsButton}>
                          <Settings size={16} />
                          <span>Advanced Settings</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Add Smart Lock Modal */}
      {showAddLock && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add Smart Lock</h2>
              <button 
                className={styles.closeButton} 
                onClick={() => {
                  setShowAddLock(false);
                  setAvailableLocks([]);
                  setSelectedLock(null);
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.scanSection}>
                <p>Scan for available smart locks on your network.</p>
                <button 
                  className={styles.scanButton}
                  onClick={scanForLocks}
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <RefreshCw size={16} className={styles.spinning} />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Scan for Locks</span>
                    </>
                  )}
                </button>
              </div>
              
              {availableLocks.length > 0 && (
                <div className={styles.availableLocks}>
                  <h3>Available Locks</h3>
                  <div className={styles.lockOptions}>
                    {availableLocks.map((lock) => (
                      <div 
                        key={lock.deviceId} 
                        className={`${styles.lockOption} ${selectedLock && selectedLock.deviceId === lock.deviceId ? styles.selected : ''}`}
                        onClick={() => setSelectedLock(lock)}
                      >
                        <Lock size={18} />
                        <div className={styles.lockOptionInfo}>
                          <span className={styles.lockName}>{lock.name}</span>
                          <span className={styles.lockModel}>{lock.model}</span>
                        </div>
                        <div className={styles.lockOptionCheck}>
                          {selectedLock && selectedLock.deviceId === lock.deviceId && '✓'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {availableLocks.length === 0 && !scanning && (
                <div className={styles.noLocksFound}>
                  <AlertTriangle size={24} />
                  <p>No locks found. Make sure your locks are in pairing mode and try again.</p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={() => {
                  setShowAddLock(false);
                  setAvailableLocks([]);
                  setSelectedLock(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.addButton}
                onClick={addLock}
                disabled={!selectedLock}
              >
                Add Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartLock;