import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heading}>Smart Home Security & Monitoring System</h1>
            <p className={styles.subheading}>Protect what matters most with our comprehensive home security solution.</p>
            <div className={styles.buttonContainer}>
              <Link to="/register" className={styles.primaryButton}>
                Get Started
              </Link>
              <Link to="/login" className={styles.secondaryButton}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.featuresSection}>
        <h2 className={styles.featuresHeading}>Key Features</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Real-Time Monitoring</h3>
            <p className={styles.featureText}>Keep an eye on your home from anywhere with live camera feeds and instant alerts.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={`${styles.iconContainer} ${styles.iconSecondary}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Advanced Security</h3>
            <p className={styles.featureText}>Customize security zones, arm/disarm remotely, and receive alerts for suspicious activity.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={`${styles.iconContainer} ${styles.iconTertiary}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Smart Integration</h3>
            <p className={styles.featureText}>Seamlessly integrate with your existing devices and third-party security services.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;