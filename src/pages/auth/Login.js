import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { email, password } = formData;

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Display error if there is one
    if (error) {
      toast.error(error);
      clearErrors();
    }
  }, [isAuthenticated, error, navigate, clearErrors]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!email) errors.email = 'Email is required';
    
    // Password validation
    if (!password) errors.password = 'Password is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await login({
          email,
          password,
          rememberMe
        });
      } catch (err) {
        console.error('Login error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Login to Your Account</h2>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            className={formErrors.email ? `${styles.input} ${styles.inputError}` : styles.input}
            placeholder="Enter your email"
          />
          {formErrors.email && (
            <p className={styles.errorMessage}>{formErrors.email}</p>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            className={formErrors.password ? `${styles.input} ${styles.inputError}` : styles.input}
            placeholder="Enter your password"
          />
          {formErrors.password && (
            <p className={styles.errorMessage}>{formErrors.password}</p>
          )}
        </div>
        
        <div className={styles.optionsContainer}>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className={styles.checkbox}
            />
            <label htmlFor="rememberMe" className={styles.checkboxLabel}>
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className={styles.forgotPassword}>
            Forgot Password?
          </Link>
        </div>
        
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className={styles.linkContainer}>
        <p className={styles.text}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;