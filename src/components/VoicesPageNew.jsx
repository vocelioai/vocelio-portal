import React, { useState } from 'react';
import VoiceSelector from './VoiceSelector';

const VoicesPageNew = () => {
  const [voiceTier, setVoiceTier] = useState('regular');
  const [selectedVoices, setSelectedVoices] = useState([]);

  const handleVoicesSelect = (voices) => {
    setSelectedVoices(voices);
    console.log('Selected voices:', voices);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎙️ Voice Exploration Center
          </h1>
          <p className="text-gray-600 text-lg">
            Discover and test our comprehensive voice library. Choose from professional voices across multiple languages and tiers.
          </p>
        </div>

        {/* Enhanced Voice Selector in Gallery Mode */}
        <VoiceSelector
          mode="gallery"
          voiceTier={voiceTier}
          setVoiceTier={setVoiceTier}
          multiSelect={true}
          maxSelection={5}
          showAudioPreview={true}
          showLanguageFilter={true}
          showRefresh={true}
          showTierSelection={true}
          showCustomScript={true}
          title="Voice Library"
          description="Select up to 5 voices to compare and test with your custom scripts"
          onVoicesSelect={handleVoicesSelect}
          className="mb-8"
        />

        {/* Selected Voices Summary */}
        {selectedVoices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Voices ({selectedVoices.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedVoices.map((voice) => (
                <div key={voice.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">
                      {voice.name || voice.display_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {voice.tier === 'premium' ? 'Premium' : 'Regular'} • Ready for testing
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoicesPageNew;
