import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import styles from './PrivateRoute.module.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, loadUser } = useContext(AuthContext);
  
  useEffect(() => {
    // Try to load user data if we think we're authenticated but don't have user data
    if (isAuthenticated && !loading) {
      loadUser();
    }
  }, [isAuthenticated, loading, loadUser]);
  
  if (loading) {
    return <div className={styles.loadingContainer}><LoadingSpinner /></div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;