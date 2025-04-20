import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Camera, Play, Pause, Video, Calendar } from 'lucide-react';
import styles from './LiveCameraFeed.module.css';

const LiveCameraFeed = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecordings, setShowRecordings] = useState(false);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/cameras');
      setCameras(res.data);
      if (res.data.length > 0) {
        setSelectedCamera(res.data[0]);
      }
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to fetch cameras');
      setIsLoading(false);
    }
  };

  const fetchRecordings = async (cameraId) => {
    try {
      const res = await axios.get(`/api/cameras/${cameraId}/recordings`);
      setRecordings(res.data);
      setShowRecordings(true);
    } catch (err) {
      toast.error('Failed to fetch recordings');
    }
  };

  const handleCameraSelect = (camera) => {
    setSelectedCamera(camera);
    setIsPlaying(true);
    setShowRecordings(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleRecordings = () => {
    if (!showRecordings && selectedCamera) {
      fetchRecordings(selectedCamera._id);
    } else {
      setShowRecordings(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className={styles.container}>
      <h1>Live Camera Feed</h1>
      
      {isLoading ? (
        <div className={styles.loading}>Loading cameras...</div>
      ) : cameras.length === 0 ? (
        <div className={styles.noCameras}>
          <Camera size={48} />
          <h3>No cameras found</h3>
          <p>Please add cameras to your system to use this feature.</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.cameraList}>
            <h3>Your Cameras</h3>
            {cameras.map((camera) => (
              <div 
                key={camera._id} 
                className={`${styles.cameraItem} ${selectedCamera && selectedCamera._id === camera._id ? styles.selected : ''}`}
                onClick={() => handleCameraSelect(camera)}
              >
                <Camera size={18} />
                <span>{camera.name}</span>
                <span className={camera.isOnline ? styles.statusOnline : styles.statusOffline}>
                  {camera.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
          
          <div className={styles.feedContainer}>
            {selectedCamera ? (
              <>
                <div className={styles.feedHeader}>
                  <h3>{selectedCamera.name}</h3>
                  <div className={styles.feedControls}>
                    <button 
                      className={styles.controlButton} 
                      onClick={togglePlayPause}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button 
                      className={`${styles.controlButton} ${showRecordings ? styles.active : ''}`} 
                      onClick={toggleRecordings}
                      title="Recordings"
                    >
                      <Video size={18} />
                    </button>
                  </div>
                </div>
                
                {!showRecordings ? (
                  <div className={styles.videoFeed}>
                    {isPlaying ? (
                      <div className={styles.liveIndicator}>LIVE</div>
                    ) : (
                      <div className={styles.pausedIndicator}>PAUSED</div>
                    )}
                    <img 
                      src={`/api/placeholder/640/480`} 
                      alt={`${selectedCamera.name} feed`} 
                      className={!isPlaying ? styles.paused : ''}
                    />
                  </div>
                ) : (
                  <div className={styles.recordingsList}>
                    <h4>Recorded Footage</h4>
                    {recordings.length === 0 ? (
                      <p>No recordings found for this camera.</p>
                    ) : (
                      <div className={styles.recordings}>
                        {recordings.map((recording) => (
                          <div key={recording._id} className={styles.recordingItem}>
                            <Calendar size={16} />
                            <span>{formatDate(recording.timestamp)}</span>
                            <span className={styles.duration}>{recording.duration}s</span>
                            <button className={styles.viewButton}>View</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noSelection}>
                <Camera size={48} />
                <h3>No camera selected</h3>
                <p>Please select a camera from the list to view its feed.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCameraFeed;