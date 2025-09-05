import React, { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { voiceService } from '../lib/voiceService';

const PricingValidationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  voiceTier, 
  estimatedDuration = 60,
  phoneNumber = '',
  voiceName = ''
}) => {
  const [costEstimation, setCostEstimation] = useState(null);
  const [pricingWarning, setPricingWarning] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (isOpen && voiceTier) {
      const estimation = voiceService.estimateCallCost(estimatedDuration, voiceTier);
      const warning = voiceService.validatePricingWarning(voiceTier, estimatedDuration);
      
      setCostEstimation(estimation);
      setPricingWarning(warning);
      setAcknowledged(false);
    }
  }, [isOpen, voiceTier, estimatedDuration]);

  if (!isOpen || !costEstimation) return null;

  const shouldShowWarning = pricingWarning?.shouldWarn || costEstimation.estimated_cost > 0.25;
  const isHighCost = costEstimation.estimated_cost > 1.0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className={`p-4 rounded-t-lg ${
          isHighCost ? 'bg-red-50' : shouldShowWarning ? 'bg-amber-50' : 'bg-blue-50'
        }`}>
          <div className="flex items-center gap-3">
            {isHighCost ? (
              <XCircle className="h-6 w-6 text-red-500" />
            ) : shouldShowWarning ? (
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            ) : (
              <CheckCircle className="h-6 w-6 text-blue-500" />
            )}
            <div>
              <h3 className={`font-semibold ${
                isHighCost ? 'text-red-900' : shouldShowWarning ? 'text-amber-900' : 'text-blue-900'
              }`}>
                {isHighCost ? 'High Cost Warning' : shouldShowWarning ? 'Premium Voice Cost Notice' : 'Call Cost Confirmation'}
              </h3>
              <p className={`text-sm ${
                isHighCost ? 'text-red-700' : shouldShowWarning ? 'text-amber-700' : 'text-blue-700'
              }`}>
                {phoneNumber && `Calling ${phoneNumber}`} with {voiceName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Cost Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Breakdown
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Voice Tier:</span>
                <span className={`font-medium ${voiceTier === 'premium' ? 'text-amber-600' : 'text-green-600'}`}>
                  {voiceTier.charAt(0).toUpperCase() + voiceTier.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Rate per minute:</span>
                <span className="font-medium">{costEstimation.cost_breakdown.base_rate}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Estimated duration:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {costEstimation.cost_breakdown.duration}
                </span>
              </div>
              
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Estimated total:</span>
                <span className={`${isHighCost ? 'text-red-600' : 'text-gray-900'}`}>
                  {costEstimation.cost_breakdown.total}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Messages */}
          {shouldShowWarning && (
            <div className={`p-3 rounded-lg ${
              isHighCost ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
            }`}>
              <p className={`text-sm font-medium ${
                isHighCost ? 'text-red-800' : 'text-amber-800'
              }`}>
                {pricingWarning?.warning_message || 'This call may be expensive'}
              </p>
              
              {pricingWarning?.cost_comparison && (
                <div className={`text-xs mt-2 ${
                  isHighCost ? 'text-red-700' : 'text-amber-700'
                }`}>
                  Regular: {pricingWarning.cost_comparison.regular} → 
                  Premium: {pricingWarning.cost_comparison.premium} 
                  ({pricingWarning.cost_comparison.difference} more)
                </div>
              )}
              
              {pricingWarning?.recommendation && (
                <p className={`text-xs mt-1 italic ${
                  isHighCost ? 'text-red-600' : 'text-amber-600'
                }`}>
                  💡 {pricingWarning.recommendation}
                </p>
              )}
            </div>
          )}

          {/* Acknowledgment Checkbox */}
          {shouldShowWarning && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                I understand the pricing for this {voiceTier} voice call and want to proceed.
              </span>
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          <button
            onClick={() => onConfirm(costEstimation)}
            disabled={shouldShowWarning && !acknowledged}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              shouldShowWarning && !acknowledged
                ? 'bg-gray-400 cursor-not-allowed'
                : isHighCost
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : shouldShowWarning
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isHighCost ? 'Proceed Anyway' : shouldShowWarning ? 'Confirm & Call' : 'Start Call'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingValidationModal;
