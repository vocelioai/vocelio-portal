import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Mic, Play, Settings, Clock, X } from 'lucide-react';

const CollectNode = memo(({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    prompt: data.prompt || '',
    inputType: data.inputType || 'speech',
    maxLength: data.maxLength || 30,
    timeout: data.timeout || 5,
    retries: data.retries || 3,
    validationPattern: data.validationPattern || ''
  });

  const handleSave = () => {
    data.onUpdate(id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      prompt: data.prompt || '',
      inputType: data.inputType || 'speech',
      maxLength: data.maxLength || 30,
      timeout: data.timeout || 5,
      retries: data.retries || 3,
      validationPattern: data.validationPattern || ''
    });
    setIsEditing(false);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`rounded-lg border-2 bg-white shadow-lg min-w-[220px] ${
      selected 
        ? 'border-green-500 shadow-green-200' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-t-lg border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-green-500 rounded">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-green-900 text-sm">Collect Input</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => data.onTest?.(formData)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Test Input"
          >
            <Play className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Edit Settings"
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
                Prompt Message
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) => updateFormData('prompt', e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                rows={2}
                placeholder="What would you like the caller to do?"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Input Type
                </label>
                <select 
                  value={formData.inputType}
                  onChange={(e) => updateFormData('inputType', e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="speech">Speech</option>
                  <option value="dtmf">DTMF (Keypad)</option>
                  <option value="both">Both</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max Length (sec)
                </label>
                <input
                  type="number"
                  value={formData.maxLength}
                  onChange={(e) => updateFormData('maxLength', parseInt(e.target.value))}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  min="1"
                  max="60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Timeout (sec)
                </label>
                <input
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => updateFormData('timeout', parseInt(e.target.value))}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  min="1"
                  max="30"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max Retries
                </label>
                <input
                  type="number"
                  value={formData.retries}
                  onChange={(e) => updateFormData('retries', parseInt(e.target.value))}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  min="0"
                  max="5"
                />
              </div>
            </div>

            {formData.inputType !== 'speech' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Validation Pattern (Optional)
                </label>
                <input
                  type="text"
                  value={formData.validationPattern}
                  onChange={(e) => updateFormData('validationPattern', e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  placeholder="e.g., \\d{4} for 4 digits"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-900 mb-2">
              {data.prompt || 'Click to configure input...'}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mic className="w-3 h-3" />
              <span>{data.inputType || 'speech'}</span>
              <Clock className="w-3 h-3 ml-2" />
              <span>{data.timeout || 5}s timeout</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation */}
      {!data.prompt && (
        <div className="px-3 pb-2">
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            ⚠️ Prompt message required
          </div>
        </div>
      )}

      {/* Handles */}
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

      {/* Handle Labels */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
        Success
      </div>
      <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 text-xs text-gray-500 ml-1">
        Timeout
      </div>
      <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 text-xs text-gray-500 mr-1">
        Invalid
      </div>
    </div>
  );
});

CollectNode.displayName = 'CollectNode';

export default CollectNode;
