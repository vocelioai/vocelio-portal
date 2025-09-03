import { useState, useCallback, useRef } from 'react';

// Notification system hook - simplified version without JSX
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const nextIdRef = useRef(1);

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = nextIdRef.current++;
    
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: Date.now(),
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    // For development, also log to console
    const logLevel = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
    console[logLevel](`[${type.toUpperCase()}] ${message}`);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Specialized notification methods
  const showSuccess = useCallback((message, duration) => {
    return showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, duration = 6000) => {
    return showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration) => {
    return showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration) => {
    return showNotification(message, 'info', duration);
  }, [showNotification]);

  // Flow-specific notifications
  const showFlowSuccess = useCallback((action, flowName) => {
    return showSuccess(`Flow "${flowName}" ${action} successfully`);
  }, [showSuccess]);

  const showFlowError = useCallback((action, flowName, error) => {
    return showError(`Failed to ${action} flow "${flowName}": ${error}`);
  }, [showError]);

  const showCallProgress = useCallback((phoneNumber, status) => {
    const messages = {
      'initiated': `Call initiated to ${phoneNumber}`,
      'ringing': `Calling ${phoneNumber}...`,
      'answered': `Call answered by ${phoneNumber}`,
      'completed': `Call to ${phoneNumber} completed`,
      'failed': `Call to ${phoneNumber} failed`
    };

    const type = status === 'failed' ? 'error' : 
                 status === 'completed' ? 'success' : 'info';

    return showNotification(messages[status] || `Call ${status}: ${phoneNumber}`, type);
  }, [showNotification]);

  return {
    // Core methods
    showNotification,
    removeNotification,
    clearAllNotifications,
    
    // Specialized methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Flow-specific methods
    showFlowSuccess,
    showFlowError,
    showCallProgress,
    
    // State
    notifications,
    
    // Utilities
    hasNotifications: notifications.length > 0,
    unreadCount: notifications.length
  };
};
