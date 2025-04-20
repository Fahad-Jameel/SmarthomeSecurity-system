import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <svg
            className={styles.logoIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>HomeSafe</span>
        </Link>

        <div className={styles.navToggle}>
          <button 
            className={styles.toggleButton} 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg
              className={styles.menuIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <div className={styles.navItem}>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Dashboard
                </NavLink>
              </div>
              <div className={styles.navItem}>
                <NavLink 
                  to="/security" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Security
                </NavLink>
              </div>
              <div className={styles.navItem}>
                <NavLink 
                  to="/sensors" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Sensors
                </NavLink>
              </div>
              <div className={styles.navItem}>
                <NavLink 
                  to="/cameras" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Cameras
                </NavLink>
              </div>
              <div className={styles.navItem}>
                <NavLink 
                  to="/activity" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Activity
                </NavLink>
              </div>
              <div className={styles.profileDropdown} ref={dropdownRef}>
                <button 
                  className={styles.dropdownButton} 
                  onClick={toggleDropdown}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <div className={styles.userAvatar}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className={styles.userName}>{user?.name || 'User'}</span>
                  <svg
                    className={styles.dropdownIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className={isDropdownOpen ? styles.dropdownMenu : `${styles.dropdownMenu} ${styles.dropdownMenuHidden}`}>
                  <Link 
                    to="/profile" 
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/notifications" 
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Notifications
                  </Link>
                  <Link 
                    to="/zones" 
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Zones
                  </Link>
                  <Link 
                    to="/guests" 
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Guest Access
                  </Link>
                  <Link 
                    to="/smart-locks" 
                    className={styles.dropdownItem}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Smart Locks
                  </Link>
                  <div className={styles.divider}></div>
                  <button 
                    onClick={handleLogout} 
                    className={styles.logoutButton}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.navItem}>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Login
                </NavLink>
              </div>
              <div className={styles.navItem}>
                <NavLink 
                  to="/register" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Register
                </NavLink>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={isMobileMenuOpen ? styles.mobileMenu : `${styles.mobileMenu} ${styles.mobileMenuHidden}`}>
        <div className={styles.mobileMenuContainer}>
          <div className={styles.mobileMenuHeader}>
            <h2 className={styles.mobileMenuTitle}>Menu</h2>
            <button 
              className={styles.closeButton} 
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <svg
                className={styles.closeIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div>
            {isAuthenticated ? (
              <div>
                {/* Main Features */}
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                </NavLink>

                <NavLink 
                  to="/security" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Security
                </NavLink>

                <NavLink 
                  to="/sensors" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  Sensors
                </NavLink>

                {/* Sprint 2 Features */}
                <NavLink 
                  to="/cameras" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Cameras
                </NavLink>

                <NavLink 
                  to="/activity" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Activity Log
                </NavLink>

                <NavLink 
                  to="/zones" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Zones
                </NavLink>

                <NavLink 
                  to="/guests" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Guest Access
                </NavLink>

                <NavLink 
                  to="/smart-locks" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Smart Locks
                </NavLink>

                <NavLink 
                  to="/notifications" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Notifications
                </NavLink>

                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </NavLink>

                <div className={styles.divider}></div>

                <button 
                  onClick={handleLogout} 
                  className={styles.navLink}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login
                </NavLink>

                <NavLink 
                  to="/register" 
                  className={({ isActive }) => 
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                  onClick={closeMobileMenu}
                >
                  <svg
                    className={styles.linkIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;