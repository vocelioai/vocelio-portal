import React from 'react';

const FlowDesignerNotifications = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default FlowDesignerNotifications;
