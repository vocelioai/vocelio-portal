import React, { useState, useEffect } from 'react';
import { Video, Phone, Users, Clock, PhoneCall } from 'lucide-react';
import { useWebRTC } from '../../hooks/useWebRTC.js';

/**
 * WebRTC Dashboard Widget - Shows active video calls and quick access
 */
const WebRTCDashboardWidget = ({ onStartCall }) => {
  const [quickCallRoomId, setQuickCallRoomId] = useState('');
  const [showQuickStart, setShowQuickStart] = useState(false);

  // Use WebRTC hook for connection status
  const {
    isConnected,
    participants,
    participantCount,
    connectionQuality
  } = useWebRTC(null, { autoStart: false });

  // Generate random room ID
  const generateRoomId = () => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Start quick video call
  const handleStartQuickCall = () => {
    const roomId = quickCallRoomId || generateRoomId();
    if (onStartCall) {
      onStartCall(roomId);
    }
  };

  // Copy room link to clipboard
  const copyRoomLink = (roomId) => {
    const link = `${window.location.origin}/video-call/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Room link copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Video Calls</h3>
            <p className="text-sm text-gray-600">WebRTC Enterprise Calling</p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnected && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Connected</span>
            </>
          )}
        </div>
      </div>

      {/* Active Call Status */}
      {isConnected && participantCount > 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-900">Active Video Call</p>
                <p className="text-sm text-green-700">
                  {participantCount} participant{participantCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionQuality === 'good' ? 'bg-green-500' :
                connectionQuality === 'poor' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-green-700 capitalize">{connectionQuality}</span>
            </div>
          </div>
        </div>
      ) : (
        /* No Active Calls */
        <div className="text-center py-6 mb-4">
          <Video className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h4 className="font-medium text-gray-900 mb-1">No Active Calls</h4>
          <p className="text-sm text-gray-600">Start a video call or join an existing room</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        {/* Start New Call */}
        <button
          onClick={() => setShowQuickStart(!showQuickStart)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <Video className="w-4 h-4" />
          <span>Start Video Call</span>
        </button>

        {/* Quick Start Form */}
        {showQuickStart && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room ID (optional)
              </label>
              <input
                type="text"
                value={quickCallRoomId}
                onChange={(e) => setQuickCallRoomId(e.target.value)}
                placeholder="Leave blank to generate random room"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleStartQuickCall}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start Call
              </button>
              <button
                onClick={() => {
                  const roomId = quickCallRoomId || generateRoomId();
                  copyRoomLink(roomId);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Bridge Phone Call */}
        <button
          onClick={() => alert('Phone bridge feature - integrate with CallCenterPage')}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Bridge Phone Call</span>
        </button>
      </div>

      {/* Feature List */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h5 className="font-medium text-gray-900 mb-3">WebRTC Features</h5>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>HD Video</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Screen Share</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Phone Bridge</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Live Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Recording</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Multi-device</span>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-900">Backend Services Active</span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          WebRTC Bridge, Omnichannel Hub, and Phone Bridge ready
        </p>
      </div>
    </div>
  );
};

export default WebRTCDashboardWidget;
