import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.heading}>Page Not Found</h2>
        <p className={styles.message}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className={styles.homeButton}>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;