// ============================================================================
// NOTIFICATION SERVICE - Advanced User Notifications & Alerts
// ============================================================================

class NotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Set();
    this.maxNotifications = 50;
    this.defaultDuration = 5000; // 5 seconds
    this.permission = 'default';
    this.soundEnabled = true;
    this.audioContext = null;
    this.audioInitialized = false;
    
    this.requestPermission();
    this.initializeAudioOnUserGesture();
  }

  // Initialize AudioContext after user gesture to comply with autoplay policy
  initializeAudioOnUserGesture() {
    const initAudio = () => {
      if (!this.audioContext && typeof window !== 'undefined') {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.audioInitialized = true;
          console.log('🔊 AudioContext initialized for notifications');
          
          // Remove listeners after first initialization
          ['click', 'keydown', 'touchstart'].forEach(event => {
            document.removeEventListener(event, initAudio, { once: true });
          });
        } catch (error) {
          console.warn('🔇 AudioContext initialization failed:', error.message);
        }
      }
    };

    // Listen for various user interaction events
    if (typeof document !== 'undefined') {
      ['click', 'keydown', 'touchstart'].forEach(event => {
        document.addEventListener(event, initAudio, { once: true });
      });
    }
  }

  // Request browser notification permission
  async requestPermission() {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
  }

  // Show toast notification
  showToast(message, type = 'info', options = {}) {
    const notification = {
      id: this.generateId(),
      message,
      type, // success, error, warning, info
      timestamp: new Date().toISOString(),
      duration: options.duration || this.defaultDuration,
      persistent: options.persistent || false,
      actions: options.actions || [],
      data: options.data || {}
    };

    this.addNotification(notification);

    // Auto-dismiss non-persistent notifications
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        body: options.message,
        icon: options.icon || '/vocilio-icon.png',
        tag: options.tag || 'vocilio-notification',
        requireInteraction: options.requireInteraction || false,
        ...options
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (options.onClick) {
          options.onClick(notification);
        }
        notification.close();
      };

      return notification;
    }
  }

  // Show system alert for critical issues
  showAlert(message, type = 'error', options = {}) {
    const alertId = this.showToast(message, type, {
      persistent: true,
      actions: [
        { label: 'Dismiss', action: () => this.removeNotification(alertId) },
        ...(options.actions || [])
      ],
      ...options
    });

    // Also show browser notification for critical alerts
    if (type === 'error' || type === 'warning') {
      this.showBrowserNotification('Vocilio Alert', {
        message,
        requireInteraction: true,
        ...options
      });
    }

    // Play sound for critical alerts
    if (this.soundEnabled && type === 'error') {
      this.playNotificationSound('error');
    }

    return alertId;
  }

  // Success notification with confetti effect
  showSuccess(message, options = {}) {
    const notificationId = this.showToast(message, 'success', options);
    
    // Add visual flair for success
    this.triggerSuccessAnimation();
    
    if (this.soundEnabled) {
      this.playNotificationSound('success');
    }

    return notificationId;
  }

  // Error notification with recovery suggestions
  showError(message, error = null, options = {}) {
    let enhancedMessage = message;
    let actions = [...(options.actions || [])];

    // Add error details and recovery suggestions
    if (error) {
      if (error.userMessage) {
        enhancedMessage = error.userMessage;
      }
      
      if (error.retryable) {
        actions.push({
          label: 'Retry',
          action: options.onRetry || (() => window.location.reload())
        });
      }
    }

    return this.showAlert(enhancedMessage, 'error', {
      ...options,
      actions,
      data: { error }
    });
  }

  // Campaign-specific notifications
  showCampaignUpdate(campaign, type, message) {
    return this.showToast(message, type, {
      data: { campaign, type: 'campaign_update' },
      actions: [
        {
          label: 'View Campaign',
          action: () => this.navigateToCampaign(campaign.id)
        }
      ]
    });
  }

  // Live call notifications
  showCallNotification(call, type) {
    const messages = {
      incoming: `Incoming call from ${call.contact}`,
      connected: `Connected to ${call.contact}`,
      ended: `Call with ${call.contact} ended`,
      failed: `Failed to connect to ${call.contact}`
    };

    return this.showToast(messages[type] || 'Call update', 
      type === 'failed' ? 'error' : 'info', {
      data: { call, type: 'call_update' },
      duration: 3000
    });
  }

  // AI insight notifications
  showAiInsight(insight, priority = 'normal') {
    const type = priority === 'high' ? 'warning' : 'info';
    
    return this.showToast(insight.message, type, {
      data: { insight, type: 'ai_insight' },
      persistent: priority === 'high',
      actions: insight.actions || []
    });
  }

  // Add notification to queue
  addNotification(notification) {
    this.notifications.unshift(notification);
    
    // Limit queue size
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.notifySubscribers('added', notification);
  }

  // Remove notification
  removeNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const notification = this.notifications.splice(index, 1)[0];
      this.notifySubscribers('removed', notification);
      return notification;
    }
  }

  // Clear all notifications
  clearAll() {
    const cleared = [...this.notifications];
    this.notifications = [];
    this.notifySubscribers('cleared', cleared);
  }

  // Clear notifications by type
  clearByType(type) {
    const toRemove = this.notifications.filter(n => n.type === type);
    this.notifications = this.notifications.filter(n => n.type !== type);
    toRemove.forEach(notification => 
      this.notifySubscribers('removed', notification)
    );
  }

  // Subscribe to notification changes
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers of changes
  notifySubscribers(action, data) {
    this.subscribers.forEach(callback => {
      try {
        callback({
          action,
          data,
          notifications: [...this.notifications]
        });
      } catch (error) {
        console.error('❌ Notification subscriber error:', error);
      }
    });
  }

  // Generate unique ID
  generateId() {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Play notification sounds
  playNotificationSound(type) {
    if (!this.soundEnabled) return;

    // Use Web Audio API generated tones instead of loading audio files
    this.createSilentNotification(type);
  }

  // Create a silent notification using Web Audio API
  createSilentNotification(type) {
    // Check if AudioContext is initialized (after user gesture)
    if (!this.audioContext || !this.audioInitialized) {
      console.log(`📢 Notification: ${type} (waiting for user interaction to enable audio)`);
      return;
    }

    try {
      // Resume AudioContext if suspended due to autoplay policy
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.playTone(type);
        }).catch(error => {
          console.log(`📢 Notification: ${type} (audio context suspended)`);
        });
      } else {
        this.playTone(type);
      }
    } catch (error) {
      // If Web Audio API fails, just log
      console.log(`📢 Notification: ${type} (silent mode)`);
    }
  }

  // Helper method to play notification tone
  playTone(type) {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set frequency based on notification type
      const frequencies = {
        success: 800,
        error: 200,
        warning: 400,
        info: 600
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type] || 600, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime); // Very quiet
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);
      
      console.log(`🔔 Silent notification: ${type}`);
    } catch (error) {
      console.log(`📢 Notification: ${type} (audio playback failed)`);
    }
  }

  // Success animation effect
  triggerSuccessAnimation() {
    // Create confetti effect
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // Navigation helpers
  navigateToCampaign(campaignId) {
    window.dispatchEvent(new CustomEvent('vocilio:navigate', {
      detail: { path: `/campaigns/${campaignId}` }
    }));
  }

  // Get all notifications
  getNotifications() {
    return [...this.notifications];
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifySubscribers('updated', notification);
    }
  }

  // Toggle sound
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('vocilio_sound_enabled', this.soundEnabled);
    return this.soundEnabled;
  }

  // Load preferences
  loadPreferences() {
    this.soundEnabled = localStorage.getItem('vocilio_sound_enabled') !== 'false';
  }
}

// Create singleton instance
const notificationService = new NotificationService();
notificationService.loadPreferences();

export default notificationService;
