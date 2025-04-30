// VoiceAssistant.js
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Mic, MicOff, Volume2, Settings, HelpCircle } from 'lucide-react';
import { useContext } from 'react';
import { SecurityContext } from '../context/SecurityContext';
import styles from './VoiceAssistant.module.css';

const VoiceAssistant = () => {
  const { systemStatus, changeSystemState } = useContext(SecurityContext);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [commands, setCommands] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Fetch available commands
    const fetchCommands = async () => {
      try {
        const res = await fetch('/api/voice-assistant/commands');
        const data = await res.json();
        setCommands(data);
      } catch (error) {
        console.error('Error fetching voice commands:', error);
      }
    };

    fetchCommands();

    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        processCommand(result);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setResponse('');
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const processCommand = async (command) => {
    try {
      const cleanCommand = command.toLowerCase().trim();
      
      // Simple command processing
      if (cleanCommand.includes('arm') && cleanCommand.includes('away')) {
        await changeSystemState('arm_away');
        setResponse('System armed in away mode');
        speak('System armed in away mode');
      } else if (cleanCommand.includes('arm') && cleanCommand.includes('home')) {
        await changeSystemState('arm_home');
        setResponse('System armed in home mode');
        speak('System armed in home mode');
      } else if (cleanCommand.includes('disarm')) {
        await changeSystemState('disarm');
        setResponse('System disarmed');
        speak('System disarmed');
      } else if (cleanCommand.includes('status')) {
        const status = systemStatus.state || 'unknown';
        setResponse(`System is currently ${status}`);
        speak(`System is currently ${status}`);
      } else if (cleanCommand.includes('help')) {
        const helpText = 'You can say: arm away, arm home, disarm, check status, or help';
        setResponse(helpText);
        speak(helpText);
      } else {
        setResponse("I didn't understand that command. Try saying 'help' for available commands.");
        speak("I didn't understand that command. Try saying 'help' for available commands.");
      }
    } catch (error) {
      console.error('Error processing command:', error);
      setResponse('Sorry, there was an error processing your command');
      speak('Sorry, there was an error processing your command');
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Voice Assistant</h1>
      
      <div className={styles.assistantCard}>
        <div className={styles.statusIndicator}>
          <div className={`${styles.indicator} ${isListening ? styles.active : ''}`}></div>
          <span>{isListening ? 'Listening...' : 'Ready'}</span>
        </div>
        
        <div className={styles.transcriptBox}>
          {transcript ? (
            <>
              <p className={styles.transcriptLabel}>You said:</p>
              <p className={styles.transcript}>{transcript}</p>
            </>
          ) : (
            <p className={styles.placeholder}>
              {isListening ? 'Listening for command...' : 'Press the microphone to speak a command'}
            </p>
          )}
        </div>
        
        {response && (
          <div className={styles.responseBox}>
            <p className={styles.responseLabel}>Response:</p>
            <p className={styles.response}>{response}</p>
          </div>
        )}
        
        <div className={styles.controls}>
          <button 
            className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
            onClick={toggleListening}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>
      </div>
      
      <div className={styles.helpSection}>
        <h2 className={styles.helpTitle}>
          <HelpCircle size={18} />
          Available Commands
        </h2>
        <ul className={styles.commandList}>
          <li className={styles.command}>"Arm away" - Fully arm the system when nobody is home</li>
          <li className={styles.command}>"Arm home" - Arm perimeter sensors only</li>
          <li className={styles.command}>"Disarm" - Disarm the security system</li>
          <li className={styles.command}>"What's the status" - Check current system status</li>
          <li className={styles.command}>"Help" - List available commands</li>
        </ul>
      </div>
      
      <div className={styles.settingsSection}>
        <h2 className={styles.settingsTitle}>
          <Settings size={18} />
          Voice Settings
        </h2>
        <div className={styles.settingRow}>
          <label htmlFor="voiceLanguage">Language:</label>
          <select id="voiceLanguage" className={styles.select}>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <label htmlFor="wakeTrigger">Wake Word:</label>
          <select id="wakeTrigger" className={styles.select} disabled>
            <option value="homesafe">HomeSafe</option>
            <option value="assistant">Assistant</option>
          </select>
          <span className={styles.comingSoon}>Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;