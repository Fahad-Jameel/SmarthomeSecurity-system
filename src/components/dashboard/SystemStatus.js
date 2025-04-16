import React, { useState } from 'react';

const SystemStatus = ({ status, onArmDisarm }) => {
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [countdown, setCountdown] = useState(0);
  
  const getStatusColor = () => {
    switch (status) {
      case 'armed':
        return 'bg-red-500';
      case 'disarmed':
        return 'bg-green-500';
      default:
        return 'bg-yellow-500';
    }
  };
  
  const startCountdown = (action, seconds = 30) => {
    setPendingAction(action);
    setIsConfirmingAction(true);
    setCountdown(seconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          executeAction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };
  
  const cancelAction = () => {
    setIsConfirmingAction(false);
    setPendingAction(null);
    setCountdown(0);
  };
  
  const executeAction = () => {
    if (pendingAction) {
      onArmDisarm(pendingAction);
      setIsConfirmingAction(false);
      setPendingAction(null);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">System Status</h2>
      
      <div className="flex items-center mb-6">
        <div className={`w-4 h-4 rounded-full ${getStatusColor()} mr-2`}></div>
        <span className="text-lg font-medium capitalize">
          {status === 'armed' ? 'Armed' : status === 'disarmed' ? 'Disarmed' : 'Transitioning...'}
        </span>
      </div>
      
      {isConfirmingAction ? (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="mb-2">
            {pendingAction === 'arm' 
              ? 'System will arm in:' 
              : 'System will disarm in:'}
          </p>
          <div className="font-bold text-3xl mb-3">{countdown}s</div>
          <button
            onClick={cancelAction}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => startCountdown('arm')}
            className={`flex-1 ${
              status === 'armed'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } py-3 px-6 rounded-lg font-medium transition-colors`}
            disabled={status === 'armed'}
          >
            Arm System
          </button>
          
          <button
            onClick={() => startCountdown('disarm')}
            className={`flex-1 ${
              status === 'disarmed'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } py-3 px-6 rounded-lg font-medium transition-colors`}
            disabled={status === 'disarmed'}
          >
            Disarm System
          </button>
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Panic Alert
        </button>
        
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Night Mode
        </button>
      </div>
    </div>
  );
};

export default SystemStatus;