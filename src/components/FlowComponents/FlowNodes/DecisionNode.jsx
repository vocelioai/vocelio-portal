import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch, Edit3, Trash2, CheckCircle, XCircle, AlertCircle, Zap, Cpu, Target } from 'lucide-react';

const DecisionNode = memo(({ data, selected, id }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // Simulate live flow activity
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleEvaluate = () => {
    setIsAnimating(true);
    data.onEvaluate?.(data.variable);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const conditions = data.conditions || [
    { label: 'Yes', operator: 'equals', value: 'yes' },
    { label: 'No', operator: 'equals', value: 'no' }
  ];

  return (
    <div className={`relative group rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/90 via-white/80 to-purple-50/90 border border-white/50 shadow-2xl min-w-[300px] max-w-[350px] transition-all duration-500 ease-out transform ${
      selected 
        ? 'scale-110 shadow-purple-500/30 ring-4 ring-purple-400/50 bg-gradient-to-br from-purple-50/95 to-white/95' 
        : 'hover:scale-105 hover:shadow-purple-500/20 hover:bg-gradient-to-br hover:from-purple-50/90 hover:to-white/90'
    }`}>
      
      {/* Live Flow Animation Ring */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 opacity-20 transition-all duration-1000 ${
        pulseActive ? 'animate-pulse scale-105' : 'scale-100'
      }`}></div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className={`absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full filter blur-xl transition-all duration-2000 ${
          isAnimating ? 'animate-ping' : ''
        }`}></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full filter blur-xl animate-pulse"></div>
      </div>
      
      {/* Modern Glass Header with Live Status */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 p-5">
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
        
        {/* Live activity indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-500 ${
          pulseActive ? 'bg-purple-400 animate-pulse shadow-lg shadow-purple-400/50' : 'bg-purple-300'
        }`}></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Modern Icon Container */}
            <div className={`p-3 bg-white/25 rounded-2xl backdrop-blur-lg border border-white/30 transition-all duration-300 ${
              isAnimating ? 'animate-bounce bg-white/40' : ''
            }`}>
              <GitBranch className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg drop-shadow-sm">Decision</h3>
              <div className="flex items-center gap-2 text-purple-100">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Conditional Branching</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEvaluate}
              className={`p-3 text-white hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 group/btn ${
                isAnimating ? 'bg-white/40 animate-pulse' : 'bg-white/20'
              }`}
              title="Test Evaluation"
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
        {/* Decision Variable with Live Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${pulseActive ? 'text-purple-500' : 'text-gray-400'} transition-colors`} />
              Decision Variable
            </span>
            {data.operator && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                {data.operator}
              </span>
            )}
          </div>
          
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            isAnimating 
              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 shadow-lg' 
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
          }`}>
            <p className="text-gray-800 text-sm leading-relaxed font-medium">
              {data.variable || 'No variable configured'}
            </p>
          </div>
        </div>

        {/* Conditions Grid */}
        <div className="space-y-3">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Cpu className={`w-4 h-4 transition-colors ${pulseActive ? 'text-purple-600' : 'text-purple-400'}`} />
            Conditions
          </span>
          
          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={index} className="p-3 rounded-xl bg-gradient-to-br from-purple-50/50 to-white border border-purple-100 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {condition.value === 'yes' || condition.value === 'true' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : condition.value === 'no' || condition.value === 'false' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{condition.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {condition.operator} "{condition.value}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Status */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className={`w-4 h-4 transition-colors ${pulseActive ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <span className="text-xs font-semibold text-indigo-700">Evaluation Status</span>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium transition-colors ${pulseActive ? 'text-indigo-700' : 'text-indigo-500'}`}>
              {pulseActive ? 'Evaluating Conditions' : 'Ready to Evaluate'}
            </p>
            <div className={`w-2 h-2 rounded-full transition-colors ${
              pulseActive ? 'bg-indigo-500' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">{conditions.length} conditions</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-colors ${
                pulseActive ? 'bg-purple-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          
          {/* Node Status */}
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`w-1 h-3 rounded-full transition-all duration-300 ${
                  i <= (data.quality || 3) ? 'bg-gradient-to-t from-purple-400 to-purple-600' : 'bg-gray-200'
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
        className={`w-4 h-4 !bg-gradient-to-r from-purple-400 to-purple-600 !border-2 !border-white shadow-lg transition-all duration-300 ${
          pulseActive ? 'animate-pulse !border-purple-300 shadow-purple-400/50' : ''
        }`}
      />
      
      {/* Multiple output handles for different conditions */}
      {conditions.map((condition, index) => (
        <Handle
          key={`condition-${index}`}
          type="source"
          position={index % 2 === 0 ? Position.Right : Position.Bottom}
          className={`w-4 h-4 !bg-gradient-to-r ${
            condition.value === 'yes' || condition.value === 'true' 
              ? 'from-green-400 to-green-600' 
              : condition.value === 'no' || condition.value === 'false'
              ? 'from-red-400 to-red-600'
              : 'from-orange-400 to-orange-600'
          } !border-2 !border-white shadow-lg transition-all duration-300 ${
            pulseActive ? 'animate-pulse shadow-lg' : ''
          }`}
          id={condition.label.toLowerCase()}
          style={{
            [index % 2 === 0 ? 'top' : 'left']: `${20 + (index * 25)}%`
          }}
        />
      ))}
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';

export default DecisionNode;
