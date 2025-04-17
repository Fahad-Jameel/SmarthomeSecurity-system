import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, email, password, confirmPassword, phone } = formData;

  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      toast.success('Registration successful!');
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
    
    // Name validation
    if (!name.trim()) errors.name = 'Name is required';
    else if (name.length < 2) errors.name = 'Name must be at least 2 characters';
    else if (name.length > 50) errors.name = 'Name cannot exceed 50 characters';
    
    // Email validation
    if (!email) errors.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    // Confirm password validation
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    // Phone validation (optional)
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        console.log('Submitting registration with:', { name, email, password, phone });
        
        await register({
          name,
          email,
          password,
          phone
        });
      } catch (err) {
        console.error('Registration error:', err);
        toast.error('Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create an Account</h2>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            className={formErrors.name ? `${styles.input} ${styles.inputError}` : styles.input}
            placeholder="Enter your name"
          />
          {formErrors.name && (
            <p className={styles.errorMessage}>{formErrors.name}</p>
          )}
        </div>
        
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
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            className={formErrors.confirmPassword ? `${styles.input} ${styles.inputError}` : styles.input}
            placeholder="Confirm your password"
          />
          {formErrors.confirmPassword && (
            <p className={styles.errorMessage}>{formErrors.confirmPassword}</p>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="phone">
            Phone (optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={onChange}
            className={formErrors.phone ? `${styles.input} ${styles.inputError}` : styles.input}
            placeholder="Enter your phone number"
          />
          {formErrors.phone && (
            <p className={styles.errorMessage}>{formErrors.phone}</p>
          )}
        </div>
        
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className={styles.linkContainer}>
        <p className={styles.text}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;