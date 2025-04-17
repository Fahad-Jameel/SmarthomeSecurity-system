import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import styles from './PrivateRoute.module.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user, loadUser } = useContext(AuthContext);
  
  useEffect(() => {
    // Only load user data if authenticated and don't have user data yet
    // and we're not already loading user data
    if (isAuthenticated && !user && !loading) {
      loadUser();
    }
  }, [isAuthenticated, loading, user, loadUser]);
  
  // Check if we're currently loading
  if (loading) {
    return <div className={styles.loadingContainer}><LoadingSpinner /></div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If we reach here, user is authenticated
  return children;
};

export default PrivateRoute;