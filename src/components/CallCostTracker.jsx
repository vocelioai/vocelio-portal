import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { voiceService } from '../lib/voiceService';

const CallCostTracker = ({ 
  isActive = false, 
  voiceTier = 'regular', 
  startTime = null,
  onCostUpdate = null,
  showEstimate = true,
  estimatedDuration = 60
}) => {
  const [currentCost, setCurrentCost] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pricingInfo, setPricingInfo] = useState(null);

  // Load pricing information
  useEffect(() => {
    const loadPricing = async () => {
      try {
        await voiceService.loadPricingTiers();
        const pricing = voiceService.getTierPricing(voiceTier);
        setPricingInfo(pricing);
      } catch (error) {
        console.error('Failed to load pricing info:', error);
      }
    };
    loadPricing();
  }, [voiceTier]);

  // Update duration and cost when call is active
  useEffect(() => {
    if (!isActive || !startTime || !pricingInfo) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - startTime) / 1000);
      setDuration(elapsed);
      
      const cost = voiceService.calculateCallCost(elapsed, voiceTier);
      setCurrentCost(cost);
      
      if (onCostUpdate) {
        onCostUpdate({ cost, duration: elapsed, tier: voiceTier });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, voiceTier, pricingInfo, onCostUpdate]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCost = (cost) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(4)}`;
  };

  const getEstimatedCost = () => {
    if (!pricingInfo) return null;
    return voiceService.estimateCallCost(estimatedDuration, voiceTier);
  };

  const estimatedCost = showEstimate ? getEstimatedCost() : null;
  const isExpensive = currentCost > 0.50 || (estimatedCost && estimatedCost.estimated_cost > 0.50);

  if (!pricingInfo) {
    return (
      <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
        <DollarSign className="h-3 w-3" />
        Loading pricing...
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 px-3 py-2 rounded-lg border ${
      isActive 
        ? isExpensive 
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-gray-50 border-gray-200 text-gray-600'
    }`}>
      {/* Live Cost (when active) */}
      {isActive && (
        <>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span className="font-mono text-sm font-medium">
              {formatCost(currentCost)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-mono text-xs">
              {formatDuration(duration)}
            </span>
          </div>
          
          {isExpensive && (
            <AlertTriangle className="h-3 w-3 text-red-500" />
          )}
        </>
      )}

      {/* Estimated Cost (when not active) */}
      {!isActive && estimatedCost && (
        <>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">
              Est: {formatCost(estimatedCost.estimated_cost)}
            </span>
          </div>
          
          <div className="text-xs opacity-75">
            ({estimatedCost.duration_minutes.toFixed(1)}min @ {estimatedCost.cost_breakdown.base_rate})
          </div>
        </>
      )}

      {/* Tier Badge */}
      <div className={`px-2 py-0.5 rounded text-xs font-medium ${
        voiceTier === 'premium' 
          ? 'bg-yellow-100 text-yellow-700' 
          : 'bg-green-100 text-green-700'
      }`}>
        {voiceTier}
      </div>
    </div>
  );
};

export default CallCostTracker;
