import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEmailSent(true);
      toast.success('Password reset instructions sent to your email');
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Forgot Password</h2>
      
      {isEmailSent ? (
        <div className={styles.messageCentered}>
          <div className={styles.successContainer}>
            <svg className={styles.successIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={styles.successMessage}>Reset instructions sent!</p>
          </div>
          <p className={styles.message}>
            We've sent password reset instructions to your email. Please check your inbox and follow the link to reset your password.
          </p>
          <Link to="/login" className={styles.link}>
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className={styles.message}>
            Enter your email address below and we'll send you instructions to reset your password.
          </p>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
          </button>
          
          <div className={styles.linkContainer}>
            <Link to="/login" className={styles.link}>
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;