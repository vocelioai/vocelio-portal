import React, { memo, useState, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { Mic, Play, Edit3, Trash2, Phone, MessageSquare, Clock, Hash, Users } from 'lucide-react';

// Performance-optimized CollectNode for production scale
const CollectNode = memo(({ data, selected, id }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePlayTest = useCallback(() => {
    setIsAnimating(true);
    data.onTest?.(data);
    requestAnimationFrame(() => {
      setTimeout(() => setIsAnimating(false), 1200);
    });
  }, [data]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    data.onEdit?.(id);
  }, [data.onEdit, id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    data.onDelete?.(id);
  }, [data.onDelete, id]);

  const nodeStyles = useMemo(() => ({
    base: 'relative group rounded-2xl bg-gradient-to-br from-white via-white to-green-50 border border-green-200 shadow-xl min-w-[280px] max-w-[320px] transition-transform duration-300 ease-out',
    selected: selected 
      ? 'scale-105 shadow-green-500/20 ring-2 ring-green-400/30 border-green-300' 
      : 'hover:scale-102 hover:shadow-green-500/10',
    animating: isAnimating ? 'animate-pulse' : ''
  }), [selected, isAnimating]);

  const inputConfig = useMemo(() => ({
    type: data.inputType || 'DTMF',
    timeout: data.timeout || 5,
    maxLength: data.maxLength || 10,
    prompt: data.prompt || data.plainText || 'No prompt configured'
  }), [data.inputType, data.timeout, data.maxLength, data.prompt, data.plainText]);

  return (
    <div className={`${nodeStyles.base} ${nodeStyles.selected} ${nodeStyles.animating}`}>
      
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-300"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white/20 rounded-xl transition-transform duration-200 ${
              isAnimating ? 'scale-110' : ''
            }`}>
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Collect Input</h3>
              <div className="flex items-center gap-2 text-green-100">
                <Users className="w-3 h-3" />
                <span className="text-xs">User Input Collection</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlayTest}
              className={`p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200 ${
                isAnimating ? 'bg-white/30' : ''
              }`}
              title="Test Input Collection"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Edit Configuration"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-white hover:bg-red-500/60 rounded-lg transition-colors duration-200"
              title="Delete Node"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Input Prompt</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              {inputConfig.type}
            </span>
          </div>
          
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-gray-800 text-sm leading-relaxed">
              {inputConfig.prompt}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center gap-1 text-green-600 mb-1">
              {inputConfig.type === 'speech' ? <MessageSquare className="w-3 h-3" /> : <Hash className="w-3 h-3" />}
              <span className="font-medium">Type</span>
            </div>
            <p className="text-gray-600">{inputConfig.type}</p>
          </div>
          
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Clock className="w-3 h-3" />
              <span className="font-medium">
                {inputConfig.type === 'speech' ? 'Timeout' : 'Max Length'}
              </span>
            </div>
            <p className="text-gray-600">
              {inputConfig.type === 'speech' 
                ? `${inputConfig.timeout}s` 
                : `${inputConfig.maxLength} digits`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span>Collection timeout: {inputConfig.timeout}s</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-400"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-sm"
        id="success"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500 !border-2 !border-white shadow-sm"
        id="timeout"
      />
    </div>
  );
});

CollectNode.displayName = 'CollectNode';

export default CollectNode;
