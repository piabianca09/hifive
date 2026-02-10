'use client';

import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);
    
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-100 to-green-50 border-green-500 text-green-800 shadow-lg';
      case 'error':
        return 'bg-gradient-to-r from-red-100 to-red-50 border-red-500 text-red-800 shadow-lg';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-500 text-yellow-800 shadow-lg';
      case 'info':
        return 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-500 text-blue-800 shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-500 text-gray-800 shadow-lg';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md p-4 rounded-xl border-2 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getTypeStyles()}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-xl mr-3">
          {getTypeIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-lg hover:opacity-70 focus:outline-none rounded-full hover:bg-black hover:bg-opacity-10 p-1 transition-colors duration-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;