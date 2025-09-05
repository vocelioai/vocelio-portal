import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Mic, Play, Edit3, Trash2, Phone, MessageSquare, Clock, Hash } from 'lucide-react';

const CollectNode = memo(({ data, selected, id }) => {

  return (
    <div className={`relative rounded-xl border bg-gradient-to-br from-white to-gray-50 shadow-lg min-w-[280px] max-w-[320px] transition-all duration-200 ${
      selected 
        ? 'border-green-400 shadow-xl ring-2 ring-green-200 ring-opacity-50 scale-105' 
        : 'border-gray-200 hover:border-green-300 hover:shadow-xl hover:scale-102'
    }`}>
      
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Collect Input</h3>
              <p className="text-green-100 text-xs">User Input Collection</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => data.onTest?.(data)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Test Input"
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
        {/* Input Prompt */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 font-medium">Input Prompt</div>
          <div className="text-gray-900 leading-relaxed">
            {data.prompt || data.plainText || data.content || 'No prompt configured'}
          </div>
        </div>

        {/* Input Settings Preview */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              {data.inputType === 'speech' ? <MessageSquare className="w-3 h-3" /> : 
               data.inputType === 'dtmf' ? <Hash className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
              <span className="font-medium">Input Type</span>
            </div>
            <div className="text-gray-900 capitalize">
              {data.inputType || 'DTMF'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <Clock className="w-3 h-3" />
              <span className="font-medium">Timeout</span>
            </div>
            <div className="text-gray-900">
              {data.timeout || 5}s
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        {(data.retries || data.maxLength || data.validationPattern) && (
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            {data.retries && <span>Retries: {data.retries}</span>}
            {data.maxLength && <span>Max: {data.maxLength}</span>}
            {data.validationPattern && <span>Pattern: ✓</span>}
          </div>
        )}

        {/* Node Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              (data.prompt || data.plainText || data.content) ? 'bg-green-400' : 'bg-yellow-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {(data.prompt || data.plainText || data.content) ? 'Configured' : 'Needs Setup'}
            </span>
          </div>
          <div className="text-xs text-gray-400">#{id.split('-')[1]}</div>
        </div>
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
        id="success"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-red-500 border-2 border-white"
        id="timeout"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 !bg-yellow-500 border-2 border-white"
        id="invalid"
      />
    </div>
  );
});

CollectNode.displayName = 'CollectNode';

export default CollectNode;
