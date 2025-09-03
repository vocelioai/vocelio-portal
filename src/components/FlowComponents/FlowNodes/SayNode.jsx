import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageCircle, Play, Settings, Volume2, X } from 'lucide-react';

const SayNode = memo(({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMessage, setTempMessage] = useState(data.message || '');

  const handleSave = () => {
    data.onUpdate(id, { message: tempMessage });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempMessage(data.message || '');
    setIsEditing(false);
  };

  return (
    <div className={`rounded-lg border-2 bg-white shadow-lg min-w-[200px] ${
      selected 
        ? 'border-blue-500 shadow-blue-200' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-t-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-500 rounded">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-blue-900 text-sm">Say Message</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => data.onPlay?.(data.message)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Test Message"
          >
            <Play className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Edit Message"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button
            onClick={() => data.onDelete?.(id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Delete Node"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Message Text
              </label>
              <textarea
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                rows={3}
                placeholder="Enter message to speak..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Voice Settings
              </label>
              <div className="flex items-center gap-2">
                <select 
                  value={data.voice || 'default'}
                  onChange={(e) => setTempMessage(prev => ({ ...prev, voice: e.target.value }))}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="default">Default Voice</option>
                  <option value="male">Male Voice</option>
                  <option value="female">Female Voice</option>
                  <option value="custom">Custom Voice</option>
                </select>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={data.speed || 1}
                  className="flex-1"
                  title="Speech Speed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-900 mb-2">
              {data.message || 'Click to add message...'}
            </div>
            {data.message && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Volume2 className="w-3 h-3" />
                <span>{data.voice || 'Default'} • {data.speed || 1}x speed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation */}
      {!data.message && (
        <div className="px-3 pb-2">
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            ⚠️ Message required
          </div>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

SayNode.displayName = 'SayNode';

export default SayNode;
