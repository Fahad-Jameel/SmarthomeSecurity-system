import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './PrivateRoute.module.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;