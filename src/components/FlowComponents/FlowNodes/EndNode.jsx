import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { StopCircle, CheckCircle, PhoneOff, UserX, Edit3, Trash2, Zap, Cpu, Flag } from 'lucide-react';

const EndNode = memo(({ data, selected, id }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // Simulate live flow activity
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleExecute = () => {
    setIsAnimating(true);
    data.onExecute?.(data.endType);
    setTimeout(() => setIsAnimating(false), 800);
  };

  const endType = data.endType || 'hangup';
  
  const getEndTypeConfig = () => {
    switch (endType) {
      case 'hangup':
        return {
          icon: PhoneOff,
          label: 'End Call',
          description: 'Call Hangup',
          color: 'from-red-500 to-red-600',
          bgColor: 'to-red-50/90',
          ringColor: 'from-red-400 via-red-500 to-red-600',
          particleColor: 'from-red-400/20 to-pink-400/20',
          statusColor: 'red'
        };
      case 'transfer':
        return {
          icon: UserX,
          label: 'Transfer & End',
          description: 'Call Transfer',
          color: 'from-purple-500 to-purple-600',
          bgColor: 'to-purple-50/90',
          ringColor: 'from-purple-400 via-purple-500 to-purple-600',
          particleColor: 'from-purple-400/20 to-indigo-400/20',
          statusColor: 'purple'
        };
      case 'success':
        return {
          icon: CheckCircle,
          label: 'Success End',
          description: 'Successful Completion',
          color: 'from-green-500 to-green-600',
          bgColor: 'to-green-50/90',
          ringColor: 'from-green-400 via-green-500 to-green-600',
          particleColor: 'from-green-400/20 to-emerald-400/20',
          statusColor: 'green'
        };
      default:
        return {
          icon: StopCircle,
          label: 'End Flow',
          description: 'Flow Termination',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'to-gray-50/90',
          ringColor: 'from-gray-400 via-gray-500 to-gray-600',
          particleColor: 'from-gray-400/20 to-slate-400/20',
          statusColor: 'gray'
        };
    }
  };

  const config = getEndTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className={`relative group rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 via-white/80 ${config.bgColor} border border-white/50 shadow-2xl min-w-[300px] max-w-[350px] transition-all duration-500 ease-out transform ${
      selected 
        ? `scale-110 shadow-${config.statusColor}-500/30 ring-4 ring-${config.statusColor}-400/50 bg-gradient-to-br from-${config.statusColor}-50/95 to-white/95` 
        : `hover:scale-105 hover:shadow-${config.statusColor}-500/20 hover:bg-gradient-to-br hover:from-${config.statusColor}-50/90 hover:to-white/90`
    }`}>
      
      {/* Live Flow Animation Ring */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${config.ringColor} opacity-20 transition-all duration-1000 ${
        pulseActive ? 'animate-pulse scale-105' : 'scale-100'
      }`}></div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br ${config.particleColor} rounded-full filter blur-xl transition-all duration-2000 ${
          isAnimating ? 'animate-ping' : ''
        }`}></div>
        <div className={`absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br ${config.particleColor} rounded-full filter blur-xl animate-pulse`}></div>
      </div>
      
      {/* Modern Glass Header with Live Status */}
      <div className={`relative overflow-hidden rounded-t-2xl bg-gradient-to-r ${config.color} p-5`}>
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
        
        {/* Live activity indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-500 ${
          pulseActive ? `bg-${config.statusColor}-400 animate-pulse shadow-lg shadow-${config.statusColor}-400/50` : `bg-${config.statusColor}-300`
        }`}></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Modern Icon Container */}
            <div className={`p-3 bg-white/25 rounded-2xl backdrop-blur-lg border border-white/30 transition-all duration-300 ${
              isAnimating ? 'animate-bounce bg-white/40' : ''
            }`}>
              <IconComponent className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg drop-shadow-sm">{config.label}</h3>
              <div className={`flex items-center gap-2 text-${config.statusColor}-100`}>
                <Flag className="w-4 h-4" />
                <span className="text-sm font-medium">{config.description}</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecute}
              className={`p-3 text-white hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 group/btn ${
                isAnimating ? 'bg-white/40 animate-pulse' : 'bg-white/20'
              }`}
              title="Execute End Action"
            >
              <Zap className={`w-5 h-5 group-hover/btn:scale-110 transition-transform ${
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
        {/* End Action Details with Live Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${pulseActive ? `text-${config.statusColor}-500` : 'text-gray-400'} transition-colors`} />
              End Action Details
            </span>
            <span className={`px-3 py-1 bg-gradient-to-r from-${config.statusColor}-100 to-${config.statusColor}-200 text-${config.statusColor}-700 rounded-full text-xs font-medium border border-${config.statusColor}-300`}>
              {endType}
            </span>
          </div>
          
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            isAnimating 
              ? `bg-gradient-to-r from-${config.statusColor}-50 to-white border-${config.statusColor}-300 shadow-lg` 
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
          }`}>
            <p className="text-gray-800 text-sm leading-relaxed font-medium">
              {data.message || config.description}
            </p>
            {data.transferNumber && endType === 'transfer' && (
              <p className="text-gray-600 text-xs mt-2">
                Transfer to: <span className="font-mono font-medium">{data.transferNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Configuration */}
        <div className="grid grid-cols-2 gap-3">
          {/* End Type */}
          <div className={`p-3 rounded-xl bg-gradient-to-br from-${config.statusColor}-50/50 to-white border border-${config.statusColor}-100 backdrop-blur-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className={`w-4 h-4 text-${config.statusColor}-600`} />
              <span className={`text-xs font-semibold text-${config.statusColor}-700`}>Action Type</span>
            </div>
            <p className="text-xs text-gray-600 font-medium capitalize">{endType}</p>
          </div>
          
          {/* Status Indicator */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50/50 to-white border border-gray-100 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className={`w-4 h-4 transition-colors ${pulseActive ? 'text-gray-600' : 'text-gray-400'}`} />
              <span className="text-xs font-semibold text-gray-700">Status</span>
            </div>
            <p className={`text-xs font-medium transition-colors ${pulseActive ? 'text-gray-700' : 'text-gray-500'}`}>
              {pulseActive ? 'Executing' : 'Ready'}
            </p>
          </div>
        </div>

        {/* Execution Metrics */}
        {endType === 'transfer' && data.transferNumber && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <UserX className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Transfer Details</span>
            </div>
            <p className="text-xs text-gray-600 font-mono">{data.transferNumber}</p>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Terminal Node</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-colors ${
                pulseActive ? `bg-${config.statusColor}-500` : 'bg-gray-300'
              }`}></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          
          {/* Completion Indicator */}
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className={`w-1 h-3 rounded-full transition-all duration-300 ${
                  i <= 5 ? `bg-gradient-to-t from-${config.statusColor}-400 to-${config.statusColor}-600` : 'bg-gray-200'
                }`}></div>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">Final</span>
          </div>
        </div>
      </div>

      {/* Enhanced Handle with Live Flow Animation - Input Only */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-4 h-4 !bg-gradient-to-r from-${config.statusColor}-400 to-${config.statusColor}-600 !border-2 !border-white shadow-lg transition-all duration-300 ${
          pulseActive ? `animate-pulse !border-${config.statusColor}-300 shadow-${config.statusColor}-400/50` : ''
        }`}
      />
    </div>
  );
});

EndNode.displayName = 'EndNode';

export default EndNode;
