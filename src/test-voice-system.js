/**
 * Voice System Test Script
 * Run this in the browser console to test the enhanced voice system
 */

// Test the voice service
async function testVoiceSystem() {
  try {
    console.log('🎤 Starting Voice System Test...');
    
    // Import the voice service
    const { voiceService } = await import('./lib/voiceService.js');
    
    console.log('✅ Voice service imported successfully');
    
    // Load voices from APIs
    console.log('🔄 Loading voices from TTS APIs...');
    const voices = await voiceService.loadAllVoices();
    
    console.log('✅ Voices loaded:', voices);
    console.log(`📊 Regular voices: ${voices.regular.length}`);
    console.log(`📊 Premium voices: ${voices.premium.length}`);
    
    // Test a regular voice (Azure)
    if (voices.regular.length > 0) {
      console.log('🎵 Testing regular voice preview...');
      const regularVoice = voices.regular[0];
      const testResult = await voiceService.testVoice(
        regularVoice.id, 
        "Hello! This is a test of the regular voice tier using Azure TTS.",
        { speed: 1.0, pitch: 0, volume: 100 }
      );
      
      if (testResult.success) {
        console.log('✅ Regular voice test successful:', testResult);
        // Auto-play the test audio
        const audio = new Audio(testResult.audioUrl);
        audio.play().catch(e => console.log('Audio play blocked by browser policy'));
      } else {
        console.log('❌ Regular voice test failed:', testResult.error);
      }
    }
    
    // Test a premium voice (ElevenLabs) 
    if (voices.premium.length > 0) {
      console.log('🎵 Testing premium voice preview...');
      const premiumVoice = voices.premium[0];
      const testResult = await voiceService.testVoice(
        premiumVoice.id,
        "Hello! This is a test of the premium voice tier using ElevenLabs TTS.", 
        { speed: 1.0, pitch: 0, volume: 100 }
      );
      
      if (testResult.success) {
        console.log('✅ Premium voice test successful:', testResult);
        // Auto-play the test audio  
        setTimeout(() => {
          const audio = new Audio(testResult.audioUrl);
          audio.play().catch(e => console.log('Audio play blocked by browser policy'));
        }, 3000); // Wait 3 seconds after regular voice
      } else {
        console.log('❌ Premium voice test failed:', testResult.error);
      }
    }
    
    // Display voice statistics
    const stats = voiceService.getVoiceStats();
    console.log('📈 Voice Statistics:', stats);
    
    return voices;
    
  } catch (error) {
    console.error('❌ Voice system test failed:', error);
    throw error;
  }
}

// Test call functionality
async function testCallSystem(phoneNumber = "+1234567890") {
  try {
    console.log('📞 Testing call system...');
    
    const { voiceService } = await import('./lib/voiceService.js');
    const voices = await voiceService.loadAllVoices();
    
    if (voices.regular.length > 0) {
      const voice = voices.regular[0];
      const callResult = await voiceService.sendTestCall(
        phoneNumber,
        voice.id,
        "This is a test call from Vocelio to demonstrate our voice system capabilities.",
        { speed: 1.0, pitch: 0, volume: 100 }
      );
      
      if (callResult.success) {
        console.log('✅ Test call initiated:', callResult);
      } else {
        console.log('❌ Test call failed:', callResult.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Call test failed:', error);
  }
}

// Export test functions for browser console use
window.testVoiceSystem = testVoiceSystem;
window.testCallSystem = testCallSystem;

console.log(`
🎤 Voice System Test Available!

Run these commands in the browser console:

1. Test voice loading and preview:
   testVoiceSystem()

2. Test call functionality:
   testCallSystem("+1234567890")

3. Access voice service directly:
   import('./lib/voiceService.js').then(({voiceService}) => {
     // Use voiceService methods
   })
`);

export { testVoiceSystem, testCallSystem };
