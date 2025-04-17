import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import styles from './PrivateRoute.module.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user, loadUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authCheckAttempted, setAuthCheckAttempted] = useState(false);
  
  useEffect(() => {
    console.log('PrivateRoute: auth check starting');
    
    // Only attempt to load user if we haven't already tried
    const checkAuth = async () => {
      if (!authCheckAttempted) {
        setAuthCheckAttempted(true);
        console.log('PrivateRoute: loading user');
        
        if (isAuthenticated && !user) {
          try {
            await loadUser();
          } catch (error) {
            console.error('Error loading user in PrivateRoute:', error);
          }
        }
        
        setAuthChecked(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // If we already know we're not authenticated, stop loading immediately
    if (!isAuthenticated && !loading) {
      console.log('PrivateRoute: not authenticated, no need to load');
      setIsLoading(false);
      setAuthChecked(true);
    }
    
    // If we have user data, we're already authenticated
    if (isAuthenticated && user) {
      console.log('PrivateRoute: already have user data');
      setIsLoading(false);
      setAuthChecked(true);
    }
    
  }, [isAuthenticated, loading, user, loadUser, authCheckAttempted]);
  
  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('PrivateRoute: Loading timed out after 5 seconds');
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  // Show loading spinner while authentication is being checked
  if (isLoading && !authChecked) {
    return <div className={styles.loadingContainer}><LoadingSpinner /></div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('PrivateRoute: Redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // If we reach here, user is authenticated
  console.log('PrivateRoute: Authenticated, rendering children');
  return children;
};

export default PrivateRoute;