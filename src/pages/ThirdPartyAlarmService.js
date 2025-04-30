// ThirdPartyAlarmService.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bell, PhoneCall, Shield, Link2, Check, AlertTriangle, Info, Lock, X } from 'lucide-react';
import styles from './ThirdPartyAlarmService.module.css';

const ThirdPartyAlarmService = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableServices, setAvailableServices] = useState([]);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    apiKey: '',
    accountId: '',
    pin: '',
    callCenter: true,
    policeDispatch: true,
    fireDispatch: true,
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    fetchConnections();
    fetchAvailableServices();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/integrations/alarm-services');
      
      // Get connections from the new response structure
      const connectionsData = res.data.data || [];
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error fetching alarm service connections:', error);
      toast.error('Failed to load alarm service connections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const res = await axios.get('/api/integrations/available-alarm-services');
      
      // Get available services from the new response structure
      const servicesData = res.data.data || [];
      setAvailableServices(servicesData);
    } catch (error) {
      console.error('Error fetching available alarm services:', error);
      toast.error('Failed to load available services');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData({
      apiKey: '',
      accountId: '',
      pin: '',
      callCenter: true,
      policeDispatch: true,
      fireDispatch: true,
    });
    setIsConnectModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) return;
    
    try {
      setIsAuthenticating(true);
      
      const connectionData = {
        serviceId: selectedService.id,
        ...formData
      };
      
      await axios.post('/api/integrations/alarm-services', connectionData);
      
      toast.success(`Successfully connected to ${selectedService.name}`);
      fetchConnections();
      closeConnectModal();
    } catch (error) {
      console.error('Error connecting to alarm service:', error);
      toast.error(error.response?.data?.message || 'Failed to connect to alarm service');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const disconnectService = async (connectionId) => {
    if (window.confirm('Are you sure you want to disconnect this alarm service?')) {
      try {
        await axios.delete(`/api/integrations/alarm-services/${connectionId}`);
        toast.success('Alarm service disconnected successfully');
        fetchConnections();
      } catch (error) {
        console.error('Error disconnecting alarm service:', error);
        toast.error('Failed to disconnect alarm service');
      }
    }
  };

  const toggleServiceOption = async (connectionId, option, currentValue) => {
    try {
      await axios.patch(`/api/integrations/alarm-services/${connectionId}/options`, {
        [option]: !currentValue
      });
      toast.success('Preference updated successfully');
      fetchConnections();
    } catch (error) {
      console.error('Error updating alarm service option:', error);
      toast.error('Failed to update preference');
    }
  };

  const testConnection = async (connectionId) => {
    try {
      const res = await axios.post(`/api/integrations/alarm-services/${connectionId}/test`);
      toast.success(res.data.message || 'Test successful');
    } catch (error) {
      console.error('Error testing alarm service connection:', error);
      toast.error(error.response?.data?.message || 'Connection test failed');
    }
  };

  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Third-Party Alarm Services</h1>
      
      <div className={styles.infoCard}>
        <div className={styles.infoIcon}><Info size={24} /></div>
        <div className={styles.infoContent}>
          <h3 className={styles.infoTitle}>Professional Monitoring</h3>
          <p className={styles.infoText}>
            Connect to professional monitoring services to receive emergency dispatch and 24/7 monitoring. When an alarm is triggered, these services can contact emergency responders on your behalf.
          </p>
        </div>
      </div>
      
      <div className={styles.sectionTitle}>
        <h2>Connected Services</h2>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Loading connected services...</div>
      ) : connections.length === 0 ? (
        <div className={styles.emptyState}>
          <Shield size={48} />
          <h3 className={styles.emptyTitle}>No alarm services connected</h3>
          <p className={styles.emptyText}>Connect to a third-party alarm service for professional monitoring</p>
        </div>
      ) : (
        <div className={styles.connectionsGrid}>
          {connections.map(connection => (
            <div key={connection._id} className={styles.connectionCard}>
              <div className={styles.connectionHeader}>
                <img 
                  src={availableServices.find(s => s.id === connection.serviceId)?.logo || 'https://www.eaglesecurity.biz/wp-content/uploads/2016/01/2000px-ADT_Security_Services_Logo.svg_-1024x1024.png'} 
                  alt={connection.serviceName}
                  className={styles.serviceLogo}
                />
                <div className={styles.serviceInfo}>
                  <h3 className={styles.serviceName}>{connection.serviceName}</h3>
                  <div className={styles.serviceStatus}>
                    <span className={`${styles.statusIndicator} ${connection.status === 'connected' ? styles.connected : styles.disconnected}`}></span>
                    <span className={styles.statusText}>{connection.status === 'connected' ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
                <button 
                  className={styles.disconnectButton}
                  onClick={() => disconnectService(connection._id)}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className={styles.accountInfo}>
                <div className={styles.accountDetail}>
                  <span className={styles.accountLabel}>Account ID:</span>
                  <span className={styles.accountValue}>{connection.accountId.slice(0, 4) + '••••'}</span>
                </div>
                <div className={styles.accountDetail}>
                  <span className={styles.accountLabel}>Last Verified:</span>
                  <span className={styles.accountValue}>{new Date(connection.lastVerified).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className={styles.optionsSection}>
                <h4 className={styles.optionsTitle}>Dispatch Options</h4>
                <div className={styles.optionsList}>
                  <div className={styles.optionItem}>
                    <label className={styles.optionLabel}>
                      <input
                        type="checkbox"
                        checked={connection.callCenter}
                        onChange={() => toggleServiceOption(connection._id, 'callCenter', connection.callCenter)}
                      />
                      <span>Call Center Notification</span>
                    </label>
                    <span className={styles.optionDescription}>Receive calls from monitoring center</span>
                  </div>
                  
                  <div className={styles.optionItem}>
                    <label className={styles.optionLabel}>
                      <input
                        type="checkbox"
                        checked={connection.policeDispatch}
                        onChange={() => toggleServiceOption(connection._id, 'policeDispatch', connection.policeDispatch)}
                      />
                      <span>Police Dispatch</span>
                    </label>
                    <span className={styles.optionDescription}>Allow police to be dispatched on alarms</span>
                  </div>
                  
                  <div className={styles.optionItem}>
                    <label className={styles.optionLabel}>
                      <input
                        type="checkbox"
                        checked={connection.fireDispatch}
                        onChange={() => toggleServiceOption(connection._id, 'fireDispatch', connection.fireDispatch)}
                      />
                      <span>Fire Department Dispatch</span>
                    </label>
                    <span className={styles.optionDescription}>Allow fire department to be dispatched</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <button className={styles.testButton} onClick={() => testConnection(connection._id)}>
                  Test Connection
                </button>
                <a href={connection.portalUrl} target="_blank" rel="noopener noreferrer" className={styles.portalLink}>
                  Open Customer Portal
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.sectionTitle}>
        <h2>Available Services</h2>
        <p className={styles.sectionSubtitle}>Select a service to connect to your HomeSafe system</p>
      </div>
      
      <div className={styles.servicesGrid}>
        {availableServices.map(service => {
          const isConnected = connections.some(c => c.serviceId === service.id);
          
          return (
            <div key={service.id} className={`${styles.serviceCard} ${isConnected ? styles.connectedService : ''}`}>
              <div className={styles.serviceCardHeader}>
                <img src={service.logo || '/default-service-logo.png'} alt={service.name} className={styles.serviceCardLogo} />
                {isConnected && (
                  <div className={styles.connectedBadge}>
                    <Check size={12} />
                    <span>Connected</span>
                  </div>
                )}
              </div>
              
              <div className={styles.serviceCardContent}>
                <h3 className={styles.serviceCardName}>{service.name}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
                
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, index) => (
                    <li key={index} className={styles.serviceFeature}>
                      <Check size={14} className={styles.featureIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.serviceCardFooter}>
                <button 
                  className={styles.connectButton}
                  onClick={() => handleServiceSelect(service)}
                  disabled={isConnected}
                >
                  {isConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {isConnectModalOpen && selectedService && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Connect to {selectedService.name}</h3>
              <button className={styles.closeButton} onClick={closeConnectModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.serviceModalInfo}>
                <img src={selectedService.logo || '/default-service-logo.png'} alt={selectedService.name} className={styles.modalLogo} />
                <p className={styles.modalDescription}>{selectedService.description}</p>
              </div>
              
              <form onSubmit={handleSubmit} className={styles.connectForm}>
                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>
                    <Lock size={16} />
                   
                    <span>Authentication Details</span>
                  </h4>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="accountId">Account ID</label>
                    <input
                      type="text"
                      id="accountId"
                      name="accountId"
                      value={formData.accountId}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your account ID"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="apiKey">API Key / Access Token</label>
                    <input
                      type="password"
                      id="apiKey"
                      name="apiKey"
                      value={formData.apiKey}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your API key"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="pin">Security PIN</label>
                    <input
                      type="password"
                      id="pin"
                      name="pin"
                      value={formData.pin}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your security PIN"
                    />
                    <span className={styles.fieldHint}>This PIN may be requested by the monitoring service to verify your identity</span>
                  </div>
                </div>
                
                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>
                    <Bell size={16} />
                    <span>Dispatch Preferences</span>
                  </h4>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="callCenter"
                        checked={formData.callCenter}
                        onChange={handleInputChange}
                      />
                      <span>Call Center Notification</span>
                    </label>
                    <span className={styles.fieldHint}>Monitoring center will call your contacts when alarms are triggered</span>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="policeDispatch"
                        checked={formData.policeDispatch}
                        onChange={handleInputChange}
                      />
                      <span>Police Dispatch</span>
                    </label>
                    <span className={styles.fieldHint}>Allow police to be automatically dispatched for security alarms</span>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="fireDispatch"
                        checked={formData.fireDispatch}
                        onChange={handleInputChange}
                      />
                      <span>Fire Department Dispatch</span>
                    </label>
                    <span className={styles.fieldHint}>Allow fire department to be dispatched for fire/smoke alarms</span>
                  </div>
                </div>
                
                <div className={styles.legalText}>
                  <AlertTriangle size={14} />
                  <p>
                    By connecting this service, you authorize {selectedService.name} to receive alarm data from your HomeSafe system and to dispatch emergency services when appropriate. Additional fees may apply from your service provider.
                  </p>
                </div>
                
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={closeConnectModal}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.connectSubmitButton} disabled={isAuthenticating}>
                    {isAuthenticating ? 'Connecting...' : 'Connect Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyAlarmService;