/**
 * Quick test script to verify voice loading
 */
import { voiceService } from './src/lib/voiceService.js';

console.log('🧪 Testing Voice Service...');

// Test voice loading
voiceService.loadAllVoices()
  .then(result => {
    console.log('✅ Voice loading successful!');
    console.log('Regular voices:', result.regular.length);
    console.log('Premium voices:', result.premium.length);
    console.log('Pricing tiers:', result.pricing);
  })
  .catch(error => {
    console.error('❌ Voice loading failed:', error);
  });
