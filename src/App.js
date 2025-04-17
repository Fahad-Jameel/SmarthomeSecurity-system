import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { SecurityProvider } from './context/SecurityContext.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login.js';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SensorManagement from './pages/SensorManagement';
import Security from './pages/Security.js';
import Profile from './pages/Profile.js';
import NotFound from './pages/NotFound';
import './utils/axiosConfig';
// Private Route Component
import PrivateRoute from './components/routing/PrivateRoute';

// CSS Modules
import styles from './App.module.css';

const App = () => {
  return (
    <AuthProvider>
      <SecurityProvider>
        <Router>
          <div className={styles.container}>
            <Navbar />
            <main className={styles.main}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/sensors" 
                  element={
                    <PrivateRoute>
                      <SensorManagement />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/security" 
                  element={
                    <PrivateRoute>
                      <Security />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        <ToastContainer />
      </SecurityProvider>
    </AuthProvider>
  );
};

export default App;