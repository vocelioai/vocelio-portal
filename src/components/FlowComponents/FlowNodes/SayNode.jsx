import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageCircle, Play, Edit3, Trash2, Volume2, Clock } from 'lucide-react';

const SayNode = memo(({ data, selected, id }) => {

  return (
    <div className={`relative rounded-xl border bg-gradient-to-br from-white to-gray-50 shadow-lg min-w-[280px] max-w-[320px] transition-all duration-200 ${
      selected 
        ? 'border-blue-400 shadow-xl ring-2 ring-blue-200 ring-opacity-50 scale-105' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-102'
    }`}>
      
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Say Message</h3>
              <p className="text-blue-100 text-xs">Speech Output</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => data.onPlay?.(data.message)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Test Message"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onEdit?.(id);
              }}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Edit Node"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.(id);
              }}
              className="p-2 text-red-200 hover:bg-red-500 hover:bg-opacity-30 rounded-lg transition-colors"
              title="Delete Node"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {/* Message Content */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 font-medium">Message Content</div>
          <div className="text-gray-900 leading-relaxed">
            {data.message || data.plainText || data.content || 'No message configured'}
          </div>
        </div>

        {/* Voice Settings Preview */}
        {(data.voice || data.speed || data.pitch) && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {data.voice && (
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                <span className="capitalize">{data.voice}</span>
              </div>
            )}
            {data.speed && data.speed !== 1.0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{data.speed}x</span>
              </div>
            )}
          </div>
        )}

        {/* Node Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              (data.message || data.plainText || data.content) ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {(data.message || data.plainText || data.content) ? 'Configured' : 'Needs Setup'}
            </span>
          </div>
          <div className="text-xs text-gray-400">#{id.split('-')[1]}</div>
        </div>
      </div>

      {/* Connection Handles */}
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
