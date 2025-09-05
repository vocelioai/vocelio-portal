import React, { memo, useState, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageCircle, Play, Edit3, Trash2, Volume2, Clock, Zap, Cpu } from 'lucide-react';

// Performance-optimized SayNode for production scale (10k+ customers)
const SayNode = memo(({ data, selected, id }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoized handlers to prevent recreation on every render
  const handlePlayTest = useCallback(() => {
    setIsAnimating(true);
    data.onPlay?.(data.message);
    // Use requestAnimationFrame for better performance than setTimeout
    requestAnimationFrame(() => {
      setTimeout(() => setIsAnimating(false), 1500);
    });
  }, [data.onPlay, data.message]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    data.onEdit?.(id);
  }, [data.onEdit, id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    data.onDelete?.(id);
  }, [data.onDelete, id]);

  // Memoized computed values to avoid recalculation
  const nodeStyles = useMemo(() => ({
    base: `relative group rounded-2xl bg-gradient-to-br from-white via-white to-blue-50 border border-blue-200 shadow-xl min-w-[280px] max-w-[320px] transition-transform duration-300 ease-out`,
    selected: selected 
      ? 'scale-105 shadow-blue-500/20 ring-2 ring-blue-400/30 border-blue-300' 
      : 'hover:scale-102 hover:shadow-blue-500/10',
    animating: isAnimating ? 'animate-pulse' : ''
  }), [selected, isAnimating]);

  const messageContent = useMemo(() => 
    data.message || data.plainText || 'No message configured',
    [data.message, data.plainText]
  );

  const voiceConfig = useMemo(() => 
    data.voice || 'Default',
    [data.voice]
  );

  return (
    <div className={`${nodeStyles.base} ${nodeStyles.selected} ${nodeStyles.animating}`}>
      
      {/* Simplified header - removed heavy blur/particle effects */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        {/* Status indicator - CSS only, no JS animations */}
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Simplified icon container */}
            <div className={`p-2 bg-white/20 rounded-xl transition-transform duration-200 ${
              isAnimating ? 'scale-110' : ''
            }`}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Say Message</h3>
              <div className="flex items-center gap-2 text-blue-100">
                <Volume2 className="w-3 h-3" />
                <span className="text-xs">Speech Output</span>
              </div>
            </div>
          </div>
          
          {/* Optimized action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlayTest}
              className={`p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200 ${
                isAnimating ? 'bg-white/30' : ''
              }`}
              title="Test Speech"
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

      {/* Optimized content section */}
      <div className="p-4 space-y-3">
        {/* Message preview - simplified styling */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-gray-400" />
              Message Content
            </span>
            {data.voice && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {voiceConfig}
              </span>
            )}
          </div>
          
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-gray-800 text-sm leading-relaxed">
              {messageContent}
            </p>
          </div>
        </div>

        {/* Simplified stats grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Volume2 className="w-3 h-3" />
              <span className="font-medium">Voice</span>
            </div>
            <p className="text-gray-600">{voiceConfig}</p>
          </div>
          
          <div className="p-2 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-center gap-1 text-green-600 mb-1">
              <Cpu className="w-3 h-3" />
              <span className="font-medium">Status</span>
            </div>
            <p className="text-gray-600">Ready</p>
          </div>
        </div>

        {/* Simple metrics footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>~{data.duration || '2.5'}s</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-400"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Optimized handles - removed heavy animations */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-sm"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-sm"
      />
    </div>
  );
});

SayNode.displayName = 'SayNode';

export default SayNode;
