import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.copyright}>
            &copy; {currentYear} HomeSafe Security System. All rights reserved.
          </div>
          <div className={styles.linksList}>
            <Link to="/" className={styles.link}>
              Home
            </Link>
            <Link to="#" className={styles.link}>
              Privacy Policy
            </Link>
            <Link to="#" className={styles.link}>
              Terms of Service
            </Link>
            <Link to="#" className={styles.link}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;