import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Mic, Play, Edit3, Trash2, Phone, MessageSquare, Clock, Hash, Zap, Cpu, Users } from 'lucide-react';

const CollectNode = memo(({ data, selected, id }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // Simulate live flow activity
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handlePlayTest = () => {
    setIsAnimating(true);
    data.onTest?.(data);
    setTimeout(() => setIsAnimating(false), 1200);
  };

  return (
    <div className={`relative group rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 via-white/80 to-green-50/90 border border-white/50 shadow-2xl min-w-[300px] max-w-[350px] transition-all duration-500 ease-out transform ${
      selected 
        ? 'scale-110 shadow-green-500/30 ring-4 ring-green-400/50 bg-gradient-to-br from-green-50/95 to-white/95' 
        : 'hover:scale-105 hover:shadow-green-500/20 hover:bg-gradient-to-br hover:from-green-50/90 hover:to-white/90'
    }`}>
      
      {/* Live Flow Animation Ring */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 opacity-20 transition-all duration-1000 ${
        pulseActive ? 'animate-pulse scale-105' : 'scale-100'
      }`}></div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full filter blur-xl transition-all duration-2000 ${
          isAnimating ? 'animate-ping' : ''
        }`}></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full filter blur-xl animate-pulse"></div>
      </div>
      
      {/* Modern Glass Header with Live Status */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-5">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
        
        {/* Live activity indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-500 ${
          pulseActive ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-green-300'
        }`}></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Modern Icon Container */}
            <div className={`p-3 bg-white/25 rounded-2xl backdrop-blur-lg border border-white/30 transition-all duration-300 ${
              isAnimating ? 'animate-bounce bg-white/40' : ''
            }`}>
              <Mic className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg drop-shadow-sm">Collect Input</h3>
              <div className="flex items-center gap-2 text-green-100">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">User Input Collection</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayTest}
              className={`p-3 text-white hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 group/btn ${
                isAnimating ? 'bg-white/40 animate-pulse' : 'bg-white/20'
              }`}
              title="Test Input Collection"
            >
              <Play className={`w-5 h-5 group-hover/btn:scale-110 transition-transform ${
                isAnimating ? 'animate-spin' : ''
              }`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onEdit?.(id);
              }}
              className="p-3 text-white hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 group/btn bg-white/20"
              title="Edit Configuration"
            >
              <Edit3 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.(id);
              }}
              className="p-3 text-white hover:bg-red-500/80 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 group/btn bg-white/20"
              title="Delete Node"
            >
              <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="relative p-6 space-y-4">
        {/* Input Prompt with Live Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${pulseActive ? 'text-green-500' : 'text-gray-400'} transition-colors`} />
              Input Prompt
            </span>
            {data.inputType && (
              <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                {data.inputType}
              </span>
            )}
          </div>
          
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            isAnimating 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
          }`}>
            <p className="text-gray-800 text-sm leading-relaxed font-medium">
              {data.prompt || data.plainText || 'No prompt configured'}
            </p>
          </div>
        </div>

        {/* Input Configuration Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Input Type */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-50/50 to-white border border-green-100 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              {data.inputType === 'speech' ? <MessageSquare className="w-4 h-4 text-green-600" /> : <Hash className="w-4 h-4 text-green-600" />}
              <span className="text-xs font-semibold text-green-700">Input Type</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">{data.inputType || 'DTMF'}</p>
          </div>
          
          {/* Timeout/Max Length */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">
                {data.inputType === 'speech' ? 'Timeout' : 'Max Length'}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {data.inputType === 'speech' 
                ? `${data.timeout || 5}s` 
                : `${data.maxLength || 10} digits`
              }
            </p>
          </div>
        </div>

        {/* Processing Status */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50/50 to-white border border-purple-100 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className={`w-4 h-4 transition-colors ${pulseActive ? 'text-purple-600' : 'text-purple-400'}`} />
            <span className="text-xs font-semibold text-purple-700">Collection Status</span>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium transition-colors ${pulseActive ? 'text-purple-700' : 'text-purple-500'}`}>
              {pulseActive ? 'Collecting Input' : 'Ready to Collect'}
            </p>
            <div className={`w-2 h-2 rounded-full transition-colors ${
              pulseActive ? 'bg-purple-500' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">~{data.timeout || '5'}s timeout</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-colors ${
                pulseActive ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          
          {/* Node Status */}
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`w-1 h-3 rounded-full transition-all duration-300 ${
                  i <= (data.quality || 3) ? 'bg-gradient-to-t from-green-400 to-green-600' : 'bg-gray-200'
                }`}></div>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">Quality</span>
          </div>
        </div>
      </div>

      {/* Enhanced Handles with Live Flow Animation */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-4 h-4 !bg-gradient-to-r from-green-400 to-green-600 !border-2 !border-white shadow-lg transition-all duration-300 ${
          pulseActive ? 'animate-pulse !border-green-300 shadow-green-400/50' : ''
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`w-4 h-4 !bg-gradient-to-r from-emerald-400 to-emerald-600 !border-2 !border-white shadow-lg transition-all duration-300 ${
          pulseActive ? 'animate-pulse !border-emerald-300 shadow-emerald-400/50' : ''
        }`}
        id="success"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-3 h-3 !bg-gradient-to-r from-orange-400 to-orange-600 !border-2 !border-white shadow-lg transition-all duration-300 ${
          pulseActive ? 'animate-pulse !border-orange-300 shadow-orange-400/50' : ''
        }`}
        id="timeout"
      />
    </div>
  );
});

CollectNode.displayName = 'CollectNode';

export default CollectNode;
