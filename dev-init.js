// ============================================================================
// DEVELOPMENT ENVIRONMENT INITIALIZATION
// ============================================================================
// Run this script to clean up localStorage and prepare for development

console.log('🧹 Initializing Development Environment...');

// Clean up any corrupted localStorage data
const itemsToClean = [
  'access_token',
  'refresh_token', 
  'user_info',
  'vocilio_auth_token',
  'vocilio_session_token',
  'redux-persist:root'
];

let cleaned = 0;

itemsToClean.forEach(key => {
  const item = localStorage.getItem(key);
  if (item === 'undefined' || item === 'null' || !item) {
    localStorage.removeItem(key);
    cleaned++;
    console.log(`🗑️ Cleaned corrupted item: ${key}`);
  }
});

console.log(`✅ Development environment initialized! Cleaned ${cleaned} corrupted items.`);
console.log('🚀 You can now refresh the page for a clean start.');

// Set development mode flag
localStorage.setItem('dev_mode', 'true');
localStorage.setItem('last_cleanup', new Date().toISOString());
