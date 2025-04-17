import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Explicitly navigate to home after logout
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Enhanced navigation function that ensures proper navigation
  const handleNavigation = (e, path) => {
    e.preventDefault(); // Prevent default link behavior
    console.log(`Navigating to: ${path}`);
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    
    // Only navigate if we're not already on that page
    if (location.pathname !== path) {
      navigate(path);
    }
  };
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logoContainer}>
          <svg className={styles.logo} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={styles.logoText}>HomeSafe</span>
        </Link>
        
        {/* Mobile menu button */}
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
        >
          <svg className={styles.menuIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Desktop navigation */}
        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <a
                href="/dashboard"
                onClick={(e) => handleNavigation(e, '/dashboard')}
                className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}
              >
                Dashboard
              </a>
              <a
                href="/security"
                onClick={(e) => handleNavigation(e, '/security')}
                className={`${styles.navLink} ${isActive('/security') ? styles.activeLink : ''}`}
              >
                Security
              </a>
              <a
                href="/sensors"
                onClick={(e) => handleNavigation(e, '/sensors')}
                className={`${styles.navLink} ${isActive('/sensors') ? styles.activeLink : ''}`}
              >
                Sensors
              </a>
              <div className={styles.profileDropdown}>
                <button className={styles.profileButton}>
                  <div className={styles.userAvatar}>
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className={styles.userName}>{user?.name || 'User'}</span>
                  <svg className={styles.dropdownIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={styles.dropdownContent}>
                  <a
                    href="/profile"
                    onClick={(e) => handleNavigation(e, '/profile')}
                    className={styles.dropdownItem}
                  >
                    Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className={styles.dropdownItem}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <a
                href="/login"
                onClick={(e) => handleNavigation(e, '/login')}
                className={`${styles.navLink} ${isActive('/login') ? styles.activeLink : ''}`}
              >
                Login
              </a>
              <a
                href="/register"
                onClick={(e) => handleNavigation(e, '/register')}
                className={`${styles.navButton}`}
              >
                Register
              </a>
            </>
          )}
        </div>
        
        {/* Mobile navigation */}
        <div className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ''}`}>
          {isAuthenticated ? (
            <>
              <div className={styles.mobileUserInfo}>
                <div className={styles.mobileAvatar}>
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={styles.mobileUserName}>{user?.name || 'User'}</span>
              </div>
              <a
                href="/dashboard"
                onClick={(e) => handleNavigation(e, '/dashboard')}
                className={`${styles.mobileNavLink} ${isActive('/dashboard') ? styles.activeLink : ''}`}
              >
                Dashboard
              </a>
              <a
                href="/security"
                onClick={(e) => handleNavigation(e, '/security')}
                className={`${styles.mobileNavLink} ${isActive('/security') ? styles.activeLink : ''}`}
              >
                Security
              </a>
              <a
                href="/sensors"
                onClick={(e) => handleNavigation(e, '/sensors')}
                className={`${styles.mobileNavLink} ${isActive('/sensors') ? styles.activeLink : ''}`}
              >
                Sensors
              </a>
              <a
                href="/profile"
                onClick={(e) => handleNavigation(e, '/profile')}
                className={`${styles.mobileNavLink} ${isActive('/profile') ? styles.activeLink : ''}`}
              >
                Profile
              </a>
              <button
                onClick={handleLogout}
                className={styles.mobileLogoutButton}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                onClick={(e) => handleNavigation(e, '/login')}
                className={`${styles.mobileNavLink} ${isActive('/login') ? styles.activeLink : ''}`}
              >
                Login
              </a>
              <a
                href="/register"
                onClick={(e) => handleNavigation(e, '/register')}
                className={styles.mobileRegisterButton}
              >
                Register
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;