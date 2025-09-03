import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, Settings, Plus, X } from 'lucide-react';

const DecisionNode = memo(({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    variable: data.variable || '',
    conditions: data.conditions || [
      { label: 'Yes', operator: 'equals', value: 'yes' },
      { label: 'No', operator: 'equals', value: 'no' }
    ]
  });

  const handleSave = () => {
    data.onUpdate(id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      variable: data.variable || '',
      conditions: data.conditions || [
        { label: 'Yes', operator: 'equals', value: 'yes' },
        { label: 'No', operator: 'equals', value: 'no' }
      ]
    });
    setIsEditing(false);
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormData(prev => ({ ...prev, conditions: newConditions }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { label: 'New Path', operator: 'equals', value: '' }]
    }));
  };

  const removeCondition = (index) => {
    if (formData.conditions.length > 1) {
      setFormData(prev => ({
        ...prev,
        conditions: prev.conditions.filter((_, i) => i !== index)
      }));
    }
  };

  const getHandleStyle = (index) => {
    const colors = [
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#f97316'  // orange
    ];
    return { backgroundColor: colors[index % colors.length] };
  };

  return (
    <div className={`rounded-lg border-2 bg-white shadow-lg min-w-[240px] ${
      selected 
        ? 'border-orange-500 shadow-orange-200' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-t-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-orange-500 rounded">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-orange-900 text-sm">Decision</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-orange-600 hover:bg-orange-100 rounded"
            title="Edit Decision"
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
                Variable to Check
              </label>
              <input
                type="text"
                value={formData.variable}
                onChange={(e) => setFormData(prev => ({ ...prev, variable: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-300 rounded"
                placeholder="e.g., user_input, caller_id, etc."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">
                  Conditions
                </label>
                <button
                  onClick={addCondition}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                >
                  <Plus className="w-3 h-3" />
                  Add Path
                </button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={condition.label}
                        onChange={(e) => updateCondition(index, 'label', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        placeholder="Label"
                      />
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="startswith">Starts With</option>
                        <option value="endswith">Ends With</option>
                        <option value="greater">Greater Than</option>
                        <option value="less">Less Than</option>
                        <option value="regex">Regex Match</option>
                      </select>
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        placeholder="Value"
                      />
                    </div>
                    {formData.conditions.length > 1 && (
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
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
                className="px-3 py-1 text-xs text-white bg-orange-600 rounded hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-900 mb-2">
              {data.variable ? `Check: ${data.variable}` : 'Click to configure decision...'}
            </div>
            <div className="space-y-1">
              {(data.conditions || []).slice(0, 3).map((condition, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={getHandleStyle(index)}
                  />
                  <span>{condition.label}: {condition.operator} "{condition.value}"</span>
                </div>
              ))}
              {(data.conditions || []).length > 3 && (
                <div className="text-xs text-gray-500">
                  +{(data.conditions || []).length - 3} more paths...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation */}
      {!data.variable && (
        <div className="px-3 pb-2">
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            ⚠️ Variable to check required
          </div>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
      />
      
      {/* Dynamic source handles based on conditions */}
      {(data.conditions || formData.conditions).map((condition, index) => {
        const totalConditions = (data.conditions || formData.conditions).length;
        const angle = (index / totalConditions) * 360;
        const isBottom = angle >= 315 || angle < 45;
        const isRight = angle >= 45 && angle < 135;
        const isLeft = angle >= 225 && angle < 315;
        
        let position = Position.Bottom;
        if (isRight) position = Position.Right;
        else if (isLeft) position = Position.Left;
        
        return (
          <Handle
            key={`condition-${index}`}
            type="source"
            position={position}
            id={`condition-${index}`}
            className="w-3 h-3 border-2 border-white"
            style={getHandleStyle(index)}
          />
        );
      })}

      {/* Default/Else handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="w-3 h-3 !bg-gray-500 border-2 border-white"
        style={{ marginLeft: '20px' }}
      />
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
        Default
      </div>
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';

export default DecisionNode;
