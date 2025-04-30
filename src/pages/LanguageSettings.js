// LanguageSettings.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Globe, Check, ChevronDown } from 'lucide-react';
import axios from 'axios';
import styles from './LanguageSettings.module.css';

const LanguageSettings = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  useEffect(() => {
    // Get user's language preference from profile or browser
    const fetchUserLanguage = async () => {
      try {
        const res = await axios.get('/api/users/profile');
        if (res.data && res.data.language) {
          setCurrentLanguage(res.data.language);
        } else {
          // Default to browser language if no preference is set
          const browserLang = navigator.language.split('-')[0];
          if (languages.some(lang => lang.code === browserLang)) {
            setCurrentLanguage(browserLang);
          }
        }
      } catch (error) {
        console.error('Error fetching user language preference:', error);
      }
    };

    fetchUserLanguage();
  }, []);

  const changeLanguage = async (langCode) => {
    if (langCode === currentLanguage) {
      setIsDropdownOpen(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update user preference in backend
      await axios.patch('/api/users/language', { language: langCode });
      
      setCurrentLanguage(langCode);
      toast.success(`Language changed to ${languages.find(l => l.code === langCode).name}`);
      
      // In a real app, this would trigger a language change in the UI
      // For example, by using i18next or a similar library
      
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Failed to change language. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLanguageInfo = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Language Settings</h1>
      
      <div className={styles.languageCard}>
        <div className={styles.cardHeader}>
          <Globe size={24} />
          <h2 className={styles.cardTitle}>Select Your Preferred Language</h2>
        </div>
        
        <p className={styles.description}>
          Choose the language you want to use throughout the application. This setting will be saved to your profile.
        </p>
        
        <div className={styles.languageSelector}>
          <div className={styles.currentLanguage} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className={styles.flag}>{getCurrentLanguageInfo().flag}</span>
            <span className={styles.languageName}>{getCurrentLanguageInfo().name}</span>
            <ChevronDown size={18} className={`${styles.chevron} ${isDropdownOpen ? styles.open : ''}`} />
          </div>
          
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownList}>
                {languages.map(language => (
                  <div
                    key={language.code}
                    className={`${styles.languageOption} ${language.code === currentLanguage ? styles.active : ''}`}
                    onClick={() => changeLanguage(language.code)}
                  >
                    <span className={styles.optionFlag}>{language.flag}</span>
                    <span className={styles.optionName}>{language.name}</span>
                    {language.code === currentLanguage && <Check size={16} className={styles.checkIcon} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>What gets translated?</h3>
        <ul className={styles.infoList}>
          <li>Navigation menus and interface elements</li>
          <li>Button labels and form fields</li>
          <li>Notification messages and alerts</li>
          <li>Help documentation and guides</li>
          <li>System status messages</li>
        </ul>
        <p className={styles.note}>
          <strong>Note:</strong> Custom names you've given to sensors, zones, and other devices will remain in their original language.
        </p>
      </div>
      
      <div className={styles.feedbackCard}>
        <h3 className={styles.feedbackTitle}>Help us improve translations</h3>
        <p className={styles.feedbackText}>
          Found an issue with translation quality? Let us know by submitting feedback. We're constantly working to improve language support.
        </p>
        <button className={styles.feedbackButton}>Submit Translation Feedback</button>
      </div>
    </div>
  );
};

export default LanguageSettings;