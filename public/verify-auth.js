/**
 * 🎯 QUICK VERIFICATION SCRIPT
 * Run this in the browser console to verify the auth system is working
 */

console.log('🚀 Vocelio Auth System Verification');
console.log('=====================================');

// Test 1: Check if we're on the correct page
console.log('📍 Current URL:', window.location.href);

// Test 2: Check if authManager is available
try {
  if (window.authManager) {
    console.log('✅ AuthManager is globally available');
  } else {
    console.log('⚠️ AuthManager not found globally, trying import...');
    import('./services/authManager.js').then(module => {
      console.log('✅ AuthManager imported successfully');
      window.authManager = module.authManager;
    });
  }
} catch (error) {
  console.log('❌ AuthManager error:', error);
}

// Test 3: Check authentication status
setTimeout(() => {
  try {
    if (window.authManager) {
      const isAuth = window.authManager.isAuthenticated();
      console.log(`🔐 Authentication status: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
      
      if (isAuth) {
        const userInfo = window.authManager.getUserInfo();
        const orgContext = window.authManager.getOrganizationContext();
        console.log('👤 User info:', userInfo);
        console.log('🏢 Organization context:', orgContext);
      } else {
        console.log('👉 Try registering at: http://localhost:3001/register');
        console.log('👉 Or login at: http://localhost:3001/login');
      }
    }
  } catch (error) {
    console.log('❌ Auth check error:', error);
  }
}, 1000);

// Test 4: Check environment variables
console.log('🔧 Environment check:');
const envVars = [
  'REACT_APP_AUTH_SERVICE_URL',
  'REACT_APP_TELEPHONY_ADAPTER_URL',
  'REACT_APP_TTS_ADAPTER_URL'
];

envVars.forEach(varName => {
  const value = import.meta.env[varName];
  console.log(`${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
});

console.log('=====================================');
console.log('🎯 If you see login/register form, everything is working!');
console.log('📧 Test registration with a real email for 2FA');
console.log('🔗 Auth service endpoint:', import.meta.env.REACT_APP_AUTH_SERVICE_URL);
