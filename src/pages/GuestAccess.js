import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, UserPlus, Clock, Copy, Trash, RefreshCw, Key, Check } from 'lucide-react';
import styles from './GuestAccess.module.css';

const GuestAccess = () => {
  const [accessCodes, setAccessCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCode, setShowAddCode] = useState(false);
  const [newCode, setNewCode] = useState({
    name: '',
    expiry: getDefaultExpiryDate(),
    limit: 10, // Default value
    permissions: ['disarm', 'arm_home'] // Default permissions
  });
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  function getDefaultExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 1 week from now
    return date.toISOString().split('T')[0];
  }

  const fetchAccessCodes = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/access-codes');
      setAccessCodes(res.data);
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to fetch access codes');
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      if (!newCode.name.trim()) {
        toast.error('Guest name is required');
        return;
      }

      const res = await axios.post('/api/access-codes/generate', newCode);
      setGeneratedCode(res.data);
    } catch (err) {
      toast.error('Failed to generate access code');
    }
  };

  const handleSaveCode = async () => {
    try {
      const res = await axios.post('/api/access-codes', generatedCode);
      setAccessCodes([...accessCodes, res.data]);
      setNewCode({
        name: '',
        expiry: getDefaultExpiryDate(),
        limit: 10,
        permissions: ['disarm', 'arm_home']
      });
      setGeneratedCode(null);
      setShowAddCode(false);
      toast.success('Access code created successfully');
    } catch (err) {
      toast.error('Failed to save access code');
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!window.confirm('Are you sure you want to delete this access code?')) {
      return;
    }

    try {
      await axios.delete(`/api/access-codes/${codeId}`);
      setAccessCodes(accessCodes.filter(code => code._id !== codeId));
      toast.success('Access code deleted successfully');
    } catch (err) {
      toast.error('Failed to delete access code');
    }
  };

  const handleTogglePermission = (permission) => {
    const updatedPermissions = newCode.permissions.includes(permission)
      ? newCode.permissions.filter(p => p !== permission)
      : [...newCode.permissions, permission];
    
    setNewCode({
      ...newCode,
      permissions: updatedPermissions
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied to clipboard');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculateDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatPermissions = (permissions) => {
    return permissions.map(permission => {
      switch(permission) {
        case 'arm_home': return 'Arm Home';
        case 'arm_away': return 'Arm Away';
        case 'disarm': return 'Disarm';
        case 'view_cameras': return 'View Cameras';
        default: return permission;
      }
    }).join(', ');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Guest Access</h1>
        <button 
          className={styles.addButton} 
          onClick={() => setShowAddCode(true)}
        >
          <UserPlus size={16} />
          <span>Add Guest Access</span>
        </button>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Loading access codes...</div>
      ) : (
        <div className={styles.content}>
          {accessCodes.length === 0 && !showAddCode ? (
            <div className={styles.noCodes}>
              <Users size={48} />
              <h3>No guest access codes</h3>
              <p>Create temporary access codes for guests, service providers, or family members.</p>
              <button 
                className={styles.createButton} 
                onClick={() => setShowAddCode(true)}
              >
                <UserPlus size={16} />
                <span>Create access code</span>
              </button>
            </div>
          ) : (
            <div className={styles.codesGrid}>
              {accessCodes.map((code) => (
                <div key={code._id} className={styles.codeCard}>
                  <div className={styles.codeHeader}>
                    <h3>{code.name}</h3>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteCode(code._id)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                  <div className={styles.codeContent}>
                    <div className={styles.codeDisplay}>
                      <span>{code.code}</span>
                      <button 
                        className={styles.copyButton}
                        onClick={() => handleCopyCode(code.code)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className={styles.codeDetails}>
                      <div className={styles.detailItem}>
                        <Clock size={16} />
                        <span>Expires: {formatDate(code.expiry)}</span>
                        <span className={styles.daysRemaining}>
                          {calculateDaysRemaining(code.expiry)} days left
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <Key size={16} />
                        <span>Access: {formatPermissions(code.permissions)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <RefreshCw size={16} />
                        <span>Uses left: {code.limit - code.usedCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Add Access Code Modal */}
      {showAddCode && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Guest Access</h2>
              <button 
                className={styles.closeButton} 
                onClick={() => {
                  setShowAddCode(false);
                  setGeneratedCode(null);
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {!generatedCode ? (
                <>
                  <div className={styles.formGroup}>
                    <label>Guest Name *</label>
                    <input 
                      type="text" 
                      value={newCode.name} 
                      onChange={(e) => setNewCode({...newCode, name: e.target.value})}
                      placeholder="e.g. John Smith, Cleaning Service"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Expiry Date</label>
                    <input 
                      type="date" 
                      value={newCode.expiry} 
                      onChange={(e) => setNewCode({...newCode, expiry: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Usage Limit</label>
                    <div className={styles.limitSelector}>
                      <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={newCode.limit} 
                        onChange={(e) => setNewCode({...newCode, limit: parseInt(e.target.value)})}
                      />
                      <span>{newCode.limit} uses</span>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Permissions</label>
                    <div className={styles.permissionOptions}>
                      <div 
                        className={`${styles.permissionOption} ${newCode.permissions.includes('disarm') ? styles.selected : ''}`}
                        onClick={() => handleTogglePermission('disarm')}
                      >
                        <div className={styles.permissionCheck}>
                          {newCode.permissions.includes('disarm') && <Check size={16} />}
                        </div>
                        <span>Disarm System</span>
                      </div>
                      <div 
                        className={`${styles.permissionOption} ${newCode.permissions.includes('arm_home') ? styles.selected : ''}`}
                        onClick={() => handleTogglePermission('arm_home')}
                      >
                        <div className={styles.permissionCheck}>
                          {newCode.permissions.includes('arm_home') && <Check size={16} />}
                        </div>
                        <span>Arm Home</span>
                      </div>
                      <div 
                        className={`${styles.permissionOption} ${newCode.permissions.includes('arm_away') ? styles.selected : ''}`}
                        onClick={() => handleTogglePermission('arm_away')}
                      >
                        <div className={styles.permissionCheck}>
                          {newCode.permissions.includes('arm_away') && <Check size={16} />}
                        </div>
                        <span>Arm Away</span>
                      </div>
                      <div 
                        className={`${styles.permissionOption} ${newCode.permissions.includes('view_cameras') ? styles.selected : ''}`}
                        onClick={() => handleTogglePermission('view_cameras')}
                      >
                        <div className={styles.permissionCheck}>
                          {newCode.permissions.includes('view_cameras') && <Check size={16} />}
                        </div>
                        <span>View Cameras</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.generatedCodeContainer}>
                  <h3>Access Code Generated</h3>
                  <div className={styles.generatedCode}>
                    <span>{generatedCode.code}</span>
                    <button 
                      className={styles.copyButton}
                      onClick={() => handleCopyCode(generatedCode.code)}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className={styles.codeDetails}>
                    <div className={styles.detailItem}>
                      <span>Guest: </span>
                      <strong>{generatedCode.name}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Expires: </span>
                      <strong>{formatDate(generatedCode.expiry)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Usage Limit: </span>
                      <strong>{generatedCode.limit} times</strong>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Permissions: </span>
                      <strong>{formatPermissions(generatedCode.permissions)}</strong>
                    </div>
                  </div>
                  <p className={styles.codeInstructions}>
                    Share this code with your guest. They'll need to enter it when accessing your security system.
                  </p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              {!generatedCode ? (
                <>
                  <button 
                    className={styles.cancelButton} 
                    onClick={() => setShowAddCode(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.generateButton} 
                    onClick={handleGenerateCode}
                  >
                    Generate Code
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.cancelButton} 
                    onClick={() => setGeneratedCode(null)}
                  >
                    Back
                  </button>
                  <button 
                    className={styles.saveButton} 
                    onClick={handleSaveCode}
                  >
                    Save Code
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestAccess;