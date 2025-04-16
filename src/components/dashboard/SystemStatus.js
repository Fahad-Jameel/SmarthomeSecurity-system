import React, { useState } from 'react';
import styles from './SystemStatus.module.css';

const SystemStatus = ({ status, onArmDisarm }) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const getStatusBadgeClass = () => {
    switch (status) {
      case 'armed-home':
      case 'armed-away':
        return styles.statusArmed;
      case 'armed-night':
        return styles.statusPartial;
      case 'alarm':
        return styles.statusAlarm;
      case 'disarmed':
      default:
        return styles.statusDisarmed;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'armed-home':
        return 'Armed (Home)';
      case 'armed-away':
        return 'Armed (Away)';
      case 'armed-night':
        return 'Armed (Night)';
      case 'alarm':
        return 'ALARM TRIGGERED';
      case 'disarmed':
      default:
        return 'Disarmed';
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (status === newStatus) return;
    
    setIsChangingStatus(true);
    try {
      await onArmDisarm(newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>System Status</h2>
        </div>
        <div className={styles.status}>
          <div className={styles.statusLabel}>Current Status</div>
          <div className={`${styles.statusBadge} ${getStatusBadgeClass()}`}>
            {getStatusText()}
          </div>
        </div>
      </div>

      <div className={styles.currentStatusGrid}>
        <div className={`${styles.statusCard} ${styles.disarmedCard} ${status === 'disarmed' ? styles.activeStatus : ''}`}>
          <svg className={styles.statusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          <div className={styles.statusCardLabel}>Disarmed</div>
          <div className={styles.statusDescription}>System is inactive</div>
        </div>

        <div className={`${styles.statusCard} ${styles.homeCard} ${status === 'armed-home' ? styles.activeStatus : ''}`}>
          <svg className={styles.statusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <div className={styles.statusCardLabel}>Armed Home</div>
          <div className={styles.statusDescription}>Perimeter sensors only</div>
        </div>

        <div className={`${styles.statusCard} ${styles.awayCard} ${status === 'armed-away' ? styles.activeStatus : ''}`}>
          <svg className={styles.statusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <div className={styles.statusCardLabel}>Armed Away</div>
          <div className={styles.statusDescription}>Full system protection</div>
        </div>

        <div className={`${styles.statusCard} ${styles.nightCard} ${status === 'armed-night' ? styles.activeStatus : ''}`}>
          <svg className={styles.statusIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <div className={styles.statusCardLabel}>Night Mode</div>
          <div className={styles.statusDescription}>Selected zones active</div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          onClick={() => handleStatusChange('disarmed')}
          disabled={isChangingStatus || status === 'disarmed'}
          className={`${styles.button} ${styles.disarmButton} ${(isChangingStatus || status === 'disarmed') ? styles.disabledButton : ''}`}
        >
          <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Disarm
        </button>

        <button
          onClick={() => handleStatusChange('armed-home')}
          disabled={isChangingStatus || status === 'armed-home'}
          className={`${styles.button} ${styles.armHomeButton} ${(isChangingStatus || status === 'armed-home') ? styles.disabledButton : ''}`}
        >
          <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Arm Home
        </button>

        <button
          onClick={() => handleStatusChange('armed-away')}
          disabled={isChangingStatus || status === 'armed-away'}
          className={`${styles.button} ${styles.armAwayButton} ${(isChangingStatus || status === 'armed-away') ? styles.disabledButton : ''}`}
        >
          <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Arm Away
        </button>
      </div>
    </div>
  );
};

export default SystemStatus;