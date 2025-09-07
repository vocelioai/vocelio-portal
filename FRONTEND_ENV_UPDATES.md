# 🎯 CRITICAL: Add these to your .env file

# Authentication Service
REACT_APP_AUTH_SERVICE_URL=https://auth-service-313373223340.us-central1.run.app

# Multi-Tenant Configuration  
REACT_APP_ENABLE_TENANT_ISOLATION=true
REACT_APP_TENANT_HEADER_NAME=X-Tenant-ID

# Performance Monitoring
REACT_APP_ENABLE_PERFORMANCE_TRACKING=true
REACT_APP_SLOW_REQUEST_THRESHOLD=500

# Your existing microservice URLs (keep these)
REACT_APP_TELEPHONY_ADAPTER_URL=https://telephony-adapter-313373223340.us-central1.run.app
REACT_APP_TTS_ADAPTER_URL=https://tts-adapter-313373223340.us-central1.run.app
REACT_APP_ASR_ADAPTER_URL=https://asr-adapter-313373223340.us-central1.run.app
REACT_APP_FLOW_PROCESSOR_URL=https://flow-processor-313373223340.us-central1.run.app
REACT_APP_REALTIME_CONVERSATION_URL=https://realtime-conversation-313373223340.us-central1.run.app
