import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { StopCircle, CheckCircle, PhoneOff, UserX, Edit3, Trash2 } from 'lucide-react';

const EndNode = memo(({ data, selected, id }) => {
  const endType = data.endType || 'hangup';
  
  const getEndTypeConfig = () => {
    switch (endType) {
      case 'hangup':
        return {
          icon: PhoneOff,
          label: 'End Call',
          description: 'Hangup',
          color: 'from-red-500 to-red-600',
          iconBg: 'bg-red-500',
          textColor: 'text-red-100'
        };
      case 'transfer':
        return {
          icon: UserX,
          label: 'Transfer & End',
          description: 'Transfer Call',
          color: 'from-purple-500 to-purple-600',
          iconBg: 'bg-purple-500',
          textColor: 'text-purple-100'
        };
      case 'success':
        return {
          icon: CheckCircle,
          label: 'Success End',
          description: 'Completed',
          color: 'from-green-500 to-green-600',
          iconBg: 'bg-green-500',
          textColor: 'text-green-100'
        };
      default:
        return {
          icon: StopCircle,
          label: 'End',
          description: 'Flow End',
          color: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-500',
          textColor: 'text-gray-100'
        };
    }
  };

  const config = getEndTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className={`relative rounded-xl border bg-gradient-to-br from-white to-gray-50 shadow-lg min-w-[280px] max-w-[320px] transition-all duration-200 ${
      selected 
        ? 'border-red-400 shadow-xl ring-2 ring-red-200 ring-opacity-50 scale-105' 
        : 'border-gray-200 hover:border-red-300 hover:shadow-xl hover:scale-102'
    }`}>
      
      {/* Modern Header with Gradient */}
      <div className={`relative overflow-hidden rounded-t-xl bg-gradient-to-r ${config.color} p-4`}>
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{config.label}</h3>
              <p className={`${config.textColor} text-xs`}>{config.description}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
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
        {/* End Message */}
        {data.message && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="text-sm text-gray-600 mb-1 font-medium">Final Message</div>
            <div className="text-gray-900 leading-relaxed">
              {data.message}
            </div>
          </div>
        )}

        {/* Transfer Settings */}
        {endType === 'transfer' && data.transferNumber && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-sm text-blue-600 mb-1 font-medium">Transfer To</div>
            <div className="text-blue-900 font-mono text-sm">
              {data.transferNumber}
            </div>
          </div>
        )}

        {/* End Reason */}
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 font-medium">End Reason</div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.iconBg}`}></div>
            <span className="text-gray-900 capitalize">
              {endType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Node Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span className="text-xs text-gray-500">Terminal Node</span>
          </div>
          <div className="text-xs text-gray-400">#{id.split('-')[1]}</div>
        </div>
      </div>

      {/* Connection Handle (Input Only) */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 ${config.iconBg} border-2 border-white`}
      />
    </div>
  );
});

EndNode.displayName = 'EndNode';

export default EndNode;
