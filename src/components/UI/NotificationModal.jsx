// src/components/UI/NotificationModal.jsx
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import Modal from './Modal';

const NotificationModal = ({ isOpen, onClose, type = 'info', title, message, autoClose = true, duration = 3000, children }) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    if (isOpen && autoClose) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, autoClose, duration, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(duration / 1000);
    }
  }, [isOpen, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-success text-4xl" />;
      case 'warning':
        return <FaExclamationTriangle className="text-secondary text-4xl" />;
      case 'error':
        return <FaTimes className="text-danger text-4xl" />;
      default:
        return <FaInfoCircle className="text-primary text-4xl" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success-light/10 border-success-light/30';
      case 'warning':
        return 'bg-secondary-light/10 border-secondary-light/30';
      case 'error':
        return 'bg-danger-light/10 border-danger-light/30';
      default:
        return 'bg-primary-light/10 border-primary-light/30';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success hover:bg-success-dark';
      case 'warning':
        return 'bg-secondary hover:bg-secondary-dark';
      case 'error':
        return 'bg-danger hover:bg-danger-dark';
      default:
        return 'bg-primary hover:bg-primary-dark';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`p-6 ${getBgColor()} border rounded-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="mr-4">
              {getIcon()}
            </div>
            <h3 className="text-xl font-semibold dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {message}
        </p>
        
        {children || (
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-white rounded-lg transition-all duration-300 transform hover:scale-105 ${getButtonColor()}`}
            >
              Понятно
            </button>
            {autoClose && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Автоматически закроется через {Math.ceil(timeLeft)} сек
              </span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotificationModal;