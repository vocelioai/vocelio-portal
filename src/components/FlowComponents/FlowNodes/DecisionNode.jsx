import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, Edit3, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DecisionNode = memo(({ data, selected, id }) => {

  const conditions = data.conditions || [
    { label: 'Yes', operator: 'equals', value: 'yes' },
    { label: 'No', operator: 'equals', value: 'no' }
  ];

  return (
    <div className={`relative rounded-xl border bg-gradient-to-br from-white to-gray-50 shadow-lg min-w-[280px] max-w-[320px] transition-all duration-200 ${
      selected 
        ? 'border-purple-400 shadow-xl ring-2 ring-purple-200 ring-opacity-50 scale-105' 
        : 'border-gray-200 hover:border-purple-300 hover:shadow-xl hover:scale-102'
    }`}>
      
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-purple-500 to-purple-600 p-4">
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Decision</h3>
              <p className="text-purple-100 text-xs">Conditional Branching</p>
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
        {/* Variable Being Evaluated */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="text-sm text-gray-600 mb-1 font-medium">Variable</div>
          <div className="text-gray-900 leading-relaxed font-mono text-sm">
            {data.variable || 'No variable specified'}
          </div>
        </div>

        {/* Conditions Preview */}
        <div className="space-y-2">
          <div className="text-sm text-gray-600 font-medium">Conditions</div>
          {conditions.slice(0, 3).map((condition, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
              {condition.label === 'Yes' || condition.value === 'true' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : condition.label === 'No' || condition.value === 'false' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm text-gray-900 font-medium">{condition.label}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {condition.operator} "{condition.value}"
              </span>
            </div>
          ))}
          {conditions.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{conditions.length - 3} more conditions
            </div>
          )}
        </div>

        {/* Node Status Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              data.variable && conditions.length > 0 ? 'bg-purple-400' : 'bg-yellow-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {data.variable && conditions.length > 0 ? 'Configured' : 'Needs Setup'}
            </span>
          </div>
          <div className="text-xs text-gray-400">#{id.split('-')[1]}</div>
        </div>
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
      
      {/* Dynamic handles for each condition */}
      {conditions.map((condition, index) => {
        const colors = ['!bg-green-500', '!bg-red-500', '!bg-blue-500', '!bg-yellow-500', '!bg-orange-500'];
        const positions = [Position.Bottom, Position.Right, Position.Left];
        const position = positions[index % positions.length] || Position.Bottom;
        
        return (
          <Handle
            key={`condition-${index}`}
            type="source"
            position={position}
            id={condition.label.toLowerCase().replace(/\s+/g, '-')}
            className={`w-3 h-3 ${colors[index % colors.length]} border-2 border-white`}
          />
        );
      })}
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';

export default DecisionNode;
