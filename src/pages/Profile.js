import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateProfile, loading } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [activeTab, setActiveTab] = useState('profile');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);
  
  const { name, email, phone, currentPassword, newPassword, confirmPassword } = formData;
  
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
  
  const validateProfileForm = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(newPassword)) {
      errors.newPassword = 'Password must include uppercase, lowercase, number, and special character';
    }
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      setIsSubmitting(true);
      try {
        await updateProfile({
          name,
          email,
          phone
        });
        toast.success('Profile updated successfully');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to update profile');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      setIsSubmitting(true);
      try {
        await updateProfile({
          currentPassword,
          newPassword
        });
        toast.success('Password updated successfully');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to update password');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>My Profile</h1>
      
      <div className={styles.card}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : styles.tabInactive}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'security' ? styles.tabActive : styles.tabInactive}`}
            onClick={() => setActiveTab('security')}
          >
            Security Settings
          </button>
        </div>
        
        <div className={styles.formContainer}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className={formErrors.name ? `${styles.input} ${styles.inputError}` : styles.input}
                />
                {formErrors.name && (
                  <p className={styles.errorMessage}>{formErrors.name}</p>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className={formErrors.email ? `${styles.input} ${styles.inputError}` : styles.input}
                />
                {formErrors.email && (
                  <p className={styles.errorMessage}>{formErrors.email}</p>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                  className={formErrors.phone ? `${styles.input} ${styles.inputError}` : styles.input}
                  placeholder="e.g., +1 (555) 123-4567"
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
          
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordUpdate}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={onChange}
                  className={formErrors.currentPassword ? `${styles.input} ${styles.inputError}` : styles.input}
                />
                {formErrors.currentPassword && (
                  <p className={styles.errorMessage}>{formErrors.currentPassword}</p>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={onChange}
                  className={formErrors.newPassword ? `${styles.input} ${styles.inputError}` : styles.input}
                />
                {formErrors.newPassword && (
                  <p className={styles.errorMessage}>{formErrors.newPassword}</p>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  className={formErrors.confirmPassword ? `${styles.input} ${styles.inputError}` : styles.input}
                />
                {formErrors.confirmPassword && (
                  <p className={styles.errorMessage}>{formErrors.confirmPassword}</p>
                )}
              </div>
              
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;