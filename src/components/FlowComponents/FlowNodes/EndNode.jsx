import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { StopCircle, CheckCircle, X } from 'lucide-react';

const EndNode = memo(({ data, selected, id }) => {
  const endType = data.endType || 'hangup';
  
  const getEndTypeConfig = () => {
    switch (endType) {
      case 'hangup':
        return {
          icon: StopCircle,
          label: 'End Call',
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-900',
          borderColor: 'border-red-500'
        };
      case 'transfer':
        return {
          icon: StopCircle,
          label: 'Transfer & End',
          color: 'bg-purple-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-900',
          borderColor: 'border-purple-500'
        };
      case 'success':
        return {
          icon: CheckCircle,
          label: 'Success End',
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-900',
          borderColor: 'border-green-500'
        };
      default:
        return {
          icon: StopCircle,
          label: 'End',
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-500'
        };
    }
  };

  const config = getEndTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className={`rounded-lg border-2 bg-white shadow-lg min-w-[160px] ${
      selected 
        ? `${config.borderColor} shadow-lg` 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${config.bgColor} rounded-t-lg border-b border-gray-200`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 ${config.color} rounded-full`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <span className={`font-medium ${config.textColor} text-sm`}>
            {config.label}
          </span>
        </div>
        <button
          onClick={() => data.onDelete?.(id)}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
          title="Delete Node"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 text-center">
        <div className="text-xs text-gray-600 mb-2">
          {data.message || 'Flow ends here'}
        </div>
        
        {data.analytics && (
          <div className="text-xs text-gray-500">
            Analytics: {data.analytics}
          </div>
        )}
      </div>

      {/* Statistics (if available) */}
      {data.stats && (
        <div className="px-3 pb-3">
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span>Calls ended:</span>
              <span className="font-medium">{data.stats.calls || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg duration:</span>
              <span className="font-medium">{data.stats.duration || '0s'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Handle Only */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-4 h-4 border-2 border-white`}
        style={{ backgroundColor: config.color.replace('bg-', '#') === 'bg-red-500' ? '#ef4444' : 
                config.color.replace('bg-', '#') === 'bg-green-500' ? '#10b981' : 
                config.color.replace('bg-', '#') === 'bg-purple-500' ? '#8b5cf6' : '#6b7280' }}
      />
    </div>
  );
});

EndNode.displayName = 'EndNode';

export default EndNode;
