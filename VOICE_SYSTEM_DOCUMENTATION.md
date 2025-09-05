# 🎤 Enhanced Voice System Documentation

## Overview

The Enhanced Voice System provides a comprehensive two-tier voice selection platform that integrates Azure TTS (Regular tier) and ElevenLabs TTS (Premium tier) for testing pathways, making calls, and serving web clients.

## 🚀 Features

### Two-Tier Voice System
- **Regular Tier**: Azure TTS Neural voices with standard quality
- **Premium Tier**: ElevenLabs TTS voices with superior quality and emotional range

### Dynamic Voice Loading
- Real-time voice loading from TTS adapter APIs
- Automatic fallback to hardcoded voices if APIs are unavailable
- Caching system for improved performance

### Voice Testing & Preview
- Real-time voice preview with custom scripts
- Test call functionality to actual phone numbers
- Advanced voice settings (speed, pitch, volume)

### Enhanced UI Components
- Beautiful voice selection interface with tier-based organization
- Voice search and filtering capabilities
- Provider-specific voice information display
- Real-time voice statistics

## 📁 File Structure

```
src/
├── lib/
│   └── voiceService.js          # Core voice service with API integration
├── components/
│   ├── VoiceSelector.jsx        # Enhanced voice selector component
│   └── VoiceSystemDemo.jsx      # Demo page for voice system
└── test-voice-system.js         # Testing utilities
```

## 🔧 Core Components

### VoiceService (`src/lib/voiceService.js`)

The main service that handles all voice-related operations:

#### Key Methods:
- `loadAllVoices()`: Load voices from both Azure and ElevenLabs APIs
- `testVoice(voiceId, text, options)`: Generate audio preview for a voice
- `sendTestCall(phoneNumber, voiceId, script, options)`: Send test call with selected voice
- `findVoiceById(voiceId)`: Find voice by ID across all tiers
- `getVoiceStats()`: Get voice statistics and availability

#### Configuration:
```javascript
// Environment variables required:
VITE_TTS_ADAPTER_URL=your-tts-adapter-url
VITE_STREAMING_TTS_ADAPTER_URL=your-streaming-tts-url
```

### VoiceSelector Component (`src/components/VoiceSelector.jsx`)

Enhanced voice selection component with:

#### Props:
- `voiceTier`: Current voice tier ('regular' | 'premium')
- `setVoiceTier`: Function to change voice tier
- `selectedVoice`: Currently selected voice ID
- `setSelectedVoice`: Function to change selected voice
- `showTestCall`: Enable test call functionality
- `testPhoneNumber`: Phone number for test calls
- `onEnableAudio`: Function to enable audio context

#### Features:
- Tier-based voice organization
- Voice search and filtering
- Real-time voice preview
- Test call integration
- Advanced voice settings

## 🎯 Integration Guide

### In FlowDesigner

Replace the basic voice settings with the enhanced VoiceSelector:

```jsx
import VoiceSelector from './VoiceSelector';

// In your component:
<VoiceSelector
  voiceTier={nodeForm.voiceTier}
  setVoiceTier={(tier) => setNodeForm({...nodeForm, voiceTier: tier})}
  selectedVoice={nodeForm.voice}
  setSelectedVoice={(voice) => setNodeForm({...nodeForm, voice: voice})}
  showTestCall={true}
  testPhoneNumber="+1234567890"
  onEnableAudio={enableAudioContext}
/>
```

### Direct API Usage

```javascript
import { voiceService } from './lib/voiceService';

// Load all available voices
const voices = await voiceService.loadAllVoices();
console.log('Regular voices:', voices.regular);
console.log('Premium voices:', voices.premium);

// Test a voice with custom text
const testResult = await voiceService.testVoice(
  'voice-id-here',
  'Hello! This is a voice test.',
  { speed: 1.0, pitch: 0, volume: 100 }
);

if (testResult.success) {
  // Play the audio
  const audio = new Audio(testResult.audioUrl);
  audio.play();
}

// Send a test call
const callResult = await voiceService.sendTestCall(
  '+1234567890',
  'voice-id-here',
  'This is a test call script.',
  { speed: 1.0, pitch: 0, volume: 100 }
);

if (callResult.success) {
  console.log('Call initiated:', callResult.callId);
}
```

## 🔌 API Integration

### TTS Adapter Endpoints

The voice service expects your TTS adapter to provide these endpoints:

#### Get Azure Voices
```http
GET /voices/azure
Response: { voices: [...azureVoiceObjects] }
```

#### Get ElevenLabs Voices
```http
GET /voices/elevenlabs
Response: { voices: [...elevenLabsVoiceObjects] }
```

#### Synthesize Speech
```http
POST /synthesize
Body: {
  voice_id: string,
  text: string,
  provider: 'azure' | 'elevenlabs',
  speed: number,
  pitch: number,
  volume: number
}
Response: Audio blob
```

#### Send Test Call
```http
POST /call/test
Body: {
  to: string,
  voice_settings: object,
  script: string,
  flow_id: string,
  metadata: object
}
Response: { call_id: string }
```

### Voice Object Format

#### Azure Voice
```javascript
{
  id: 'en-US-AriaNeural',
  name: 'Aria',
  language: 'en-US',
  gender: 'female',
  tier: 'regular',
  provider: 'azure',
  neural: true,
  description: 'Aria - Natural female voice'
}
```

#### ElevenLabs Voice
```javascript
{
  id: 'voice-id-here',
  name: 'Bella',
  language: 'en-US',
  gender: 'female',
  tier: 'premium',
  provider: 'elevenlabs',
  category: 'conversational',
  description: 'Bella - Premium conversational voice',
  settings: {
    stability: 0.5,
    similarity_boost: 0.8
  }
}
```

## 🧪 Testing

### Browser Console Testing

Load the test script and run:

```javascript
// Test voice loading and preview
await testVoiceSystem();

// Test call functionality
await testCallSystem('+1234567890');

// Access voice service directly
import('./lib/voiceService.js').then(({voiceService}) => {
  // Use voiceService methods
});
```

### Demo Page

Access the voice system demo at `/voice-demo` (if route is configured) to:
- Test voice selection across both tiers
- Preview voices with custom scripts
- Send test calls to phone numbers
- View voice statistics and system status

## 🚨 Error Handling

The voice service includes comprehensive error handling:

- **API Unavailable**: Falls back to hardcoded voice lists
- **Network Errors**: Graceful degradation with user notifications
- **Audio Playback**: Browser policy handling with user interaction requirements
- **Invalid Voices**: Validation and error reporting

## 🔧 Configuration

### Environment Variables

```env
# TTS Adapter URLs
VITE_TTS_ADAPTER_URL=https://your-tts-adapter.com
VITE_STREAMING_TTS_ADAPTER_URL=https://your-streaming-tts.com

# Telephony Integration
VITE_TELEPHONY_ADAPTER_URL=https://your-telephony-adapter.com
VITE_VOICE_ROUTER_URL=https://your-voice-router.com
```

### Voice Service Configuration

```javascript
// Customize voice tiers
const voiceTiers = {
  regular: 'azure',
  premium: 'elevenlabs',
  // Add more tiers as needed
};

// Customize fallback voices
const getFallbackRegularVoices = () => [
  // Your custom fallback voices
];
```

## 📈 Performance Optimization

- **Voice Caching**: Loaded voices are cached to reduce API calls
- **Lazy Loading**: Voices are loaded on-demand
- **Request Debouncing**: Multiple rapid requests are debounced
- **Audio Cleanup**: Audio URLs are properly cleaned up to prevent memory leaks

## 🔐 Security Considerations

- **API Authentication**: Include proper authentication headers
- **Rate Limiting**: Implement rate limiting for voice preview requests
- **Phone Number Validation**: Validate phone numbers before test calls
- **CORS Configuration**: Ensure proper CORS setup for TTS adapters

## 🎛️ Advanced Configuration

### Custom Voice Providers

Add support for additional TTS providers:

```javascript
// In voiceService.js
async loadCustomProviderVoices() {
  const response = await fetch(`${this.customProviderUrl}/voices`);
  const data = await response.json();
  return data.voices.map(voice => ({
    ...voice,
    tier: 'custom',
    provider: 'custom-provider'
  }));
}
```

### Voice Analytics

Track voice usage and performance:

```javascript
// Track voice usage
const trackVoiceUsage = (voiceId, action) => {
  analytics.track('voice_action', {
    voice_id: voiceId,
    action: action, // 'preview', 'test_call', 'selected'
    timestamp: Date.now()
  });
};
```

## 🚀 Future Enhancements

- **Voice Cloning**: Integration with voice cloning APIs
- **Emotion Control**: Advanced emotional expression controls
- **Voice Mixing**: Combine multiple voices for conversations
- **Real-time Synthesis**: Streaming TTS for live conversations
- **Voice Analytics**: Usage tracking and optimization suggestions

## 💡 Best Practices

1. **Always enable audio context** before voice preview
2. **Implement proper error handling** for API failures
3. **Cache voice data** to improve performance
4. **Validate phone numbers** before test calls
5. **Provide user feedback** during voice operations
6. **Clean up audio resources** to prevent memory leaks
7. **Test across different browsers** for compatibility

## 🤝 Contributing

To extend the voice system:

1. Add new providers in `voiceService.js`
2. Update voice object formats as needed
3. Enhance UI components for new features
4. Add comprehensive error handling
5. Update documentation and tests

## 📞 Support

For issues with the enhanced voice system:

1. Check browser console for detailed error logs
2. Verify TTS adapter endpoints are accessible
3. Ensure proper environment variable configuration
4. Test with fallback voices to isolate API issues

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Compatibility**: React 18+, Modern Browsers
