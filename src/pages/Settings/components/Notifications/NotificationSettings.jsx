import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Clock,
  Users,
  ToggleLeft,
  ToggleRight,
  Volume2,
  VolumeX,
  Edit,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Calendar,
  Phone,
  Zap,
  Filter,
  Send,
  Globe,
  Shield,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react';

const NotificationSettings = () => {
  const [activeTab, setActiveTab] = useState('preferences');
  const [preferences, setPreferences] = useState({});
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);

  // Mock notification preferences
  const mockPreferences = {
    email: {
      enabled: true,
      address: 'admin@company.com',
      frequency: 'immediate',
      events: {
        callCompleted: true,
        campaignStarted: true,
        campaignCompleted: true,
        systemAlerts: true,
        billingUpdates: true,
        securityAlerts: true,
        weeklyReports: false,
        monthlyReports: true
      }
    },
    sms: {
      enabled: true,
      phoneNumber: '+1-555-0123',
      frequency: 'critical',
      events: {
        systemDown: true,
        criticalAlerts: true,
        securityBreach: true,
        dailyDigest: false
      }
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: true,
      events: {
        callStatus: true,
        campaignUpdates: true,
        newMessages: true,
        systemNotifications: true,
        userActivity: false
      }
    },
    webhook: {
      enabled: true,
      url: 'https://api.company.com/notifications',
      secret: 'notif_secret_123',
      events: {
        allEvents: false,
        criticalOnly: true
      }
    }
  };

  const mockTemplates = [
    {
      id: 1,
      name: 'Call Completed',
      type: 'email',
      subject: 'Call #{callId} has been completed',
      content: 'Your call with {contactName} has been completed successfully. Duration: {duration} minutes.',
      variables: ['callId', 'contactName', 'duration', 'timestamp'],
      isActive: true,
      lastUsed: '2024-01-20'
    },
    {
      id: 2,
      name: 'Campaign Alert',
      type: 'sms',
      subject: null,
      content: 'Campaign {campaignName} status: {status}. {details}',
      variables: ['campaignName', 'status', 'details'],
      isActive: true,
      lastUsed: '2024-01-19'
    },
    {
      id: 3,
      name: 'Weekly Report',
      type: 'email',
      subject: 'Weekly Performance Report - {weekOf}',
      content: 'This week you completed {totalCalls} calls with an average duration of {avgDuration} minutes.',
      variables: ['weekOf', 'totalCalls', 'avgDuration', 'successRate'],
      isActive: false,
      lastUsed: '2024-01-15'
    }
  ];

  const mockSchedules = [
    {
      id: 1,
      name: 'Daily Digest',
      type: 'daily',
      time: '09:00',
      timezone: 'UTC-5',
      channels: ['email'],
      content: 'digest',
      isActive: true,
      nextRun: '2024-01-21T09:00:00Z'
    },
    {
      id: 2,
      name: 'Weekly Report',
      type: 'weekly',
      day: 'monday',
      time: '08:00',
      timezone: 'UTC-5',
      channels: ['email', 'inApp'],
      content: 'weekly_report',
      isActive: true,
      nextRun: '2024-01-22T08:00:00Z'
    },
    {
      id: 3,
      name: 'Critical Alerts',
      type: 'immediate',
      channels: ['sms', 'email', 'inApp'],
      content: 'critical_only',
      isActive: true,
      nextRun: 'On event'
    }
  ];

  const mockSubscribers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@company.com',
      phone: '+1-555-0123',
      role: 'Admin',
      subscriptions: ['email', 'sms', 'inApp'],
      lastActivity: '2024-01-20',
      isActive: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      phone: '+1-555-0124',
      role: 'Manager',
      subscriptions: ['email', 'inApp'],
      lastActivity: '2024-01-19',
      isActive: true
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@company.com',
      phone: '+1-555-0125',
      role: 'Agent',
      subscriptions: ['inApp'],
      lastActivity: '2024-01-18',
      isActive: false
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPreferences(mockPreferences);
      setTemplates(mockTemplates);
      setSchedules(mockSchedules);
      setSubscribers(mockSubscribers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'preferences', label: 'Notification Preferences', icon: Bell },
    { id: 'templates', label: 'Templates', icon: Edit },
    { id: 'schedules', label: 'Delivery Schedules', icon: Clock },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const updatePreference = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateEventPreference = (category, event, enabled) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        events: {
          ...prev[category].events,
          [event]: enabled
        }
      }
    }));
  };

  const getChannelIcon = (channel) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      inApp: Bell,
      webhook: Globe
    };
    return icons[channel] || Bell;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const CreateTemplateForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: []
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newTemplate = {
        id: templates.length + 1,
        ...formData,
        variables: formData.content.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || [],
        isActive: true,
        lastUsed: null
      };
      
      setTemplates([...templates, newTemplate]);
      setShowCreateTemplate(false);
      setFormData({ name: '', type: 'email', subject: '', content: '', variables: [] });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Notification Template</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Call Completed Notification"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="inApp">In-App</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>

            {formData.type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Call #{callId} completed"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Your call with {contactName} has been completed. Duration: {duration} minutes."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{variable}'} for dynamic content. Available variables will be detected automatically.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Create Template
              </button>
              <button
                type="button"
                onClick={() => setShowCreateTemplate(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CreateScheduleForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      type: 'daily',
      time: '09:00',
      day: 'monday',
      timezone: 'UTC-5',
      channels: [],
      content: 'digest'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newSchedule = {
        id: schedules.length + 1,
        ...formData,
        isActive: true,
        nextRun: new Date().toISOString()
      };
      
      setSchedules([...schedules, newSchedule]);
      setShowCreateSchedule(false);
      setFormData({
        name: '',
        type: 'daily',
        time: '09:00',
        day: 'monday',
        timezone: 'UTC-5',
        channels: [],
        content: 'digest'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Delivery Schedule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Daily Digest"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {formData.type === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            )}

            {(formData.type === 'daily' || formData.type === 'weekly') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channels</label>
              <div className="space-y-2">
                {['email', 'sms', 'inApp'].map((channel) => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ 
                            ...formData, 
                            channels: [...formData.channels, channel] 
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            channels: formData.channels.filter(c => c !== channel) 
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Create Schedule
              </button>
              <button
                type="button"
                onClick={() => setShowCreateSchedule(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const NotificationPreferencesTab = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.email?.enabled}
              onChange={(e) => updatePreference('email', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {preferences.email?.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={preferences.email?.address || ''}
                onChange={(e) => updatePreference('email', 'address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={preferences.email?.frequency || 'immediate'}
                onChange={(e) => updatePreference('email', 'frequency', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly Digest</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Event Types</h4>
              <div className="space-y-2">
                {Object.entries(preferences.email?.events || {}).map(([event, enabled]) => (
                  <label key={event} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {event.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateEventPreference('email', event, e.target.checked)}
                      className="rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SMS Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.sms?.enabled}
              onChange={(e) => updatePreference('sms', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {preferences.sms?.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={preferences.sms?.phoneNumber || ''}
                onChange={(e) => updatePreference('sms', 'phoneNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={preferences.sms?.frequency || 'critical'}
                onChange={(e) => updatePreference('sms', 'frequency', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="critical">Critical Only</option>
                <option value="important">Important Events</option>
                <option value="all">All Notifications</option>
              </select>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Event Types</h4>
              <div className="space-y-2">
                {Object.entries(preferences.sms?.events || {}).map(([event, enabled]) => (
                  <label key={event} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {event.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateEventPreference('sms', event, e.target.checked)}
                      className="rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* In-App Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-purple-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">In-App Notifications</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.inApp?.enabled}
              onChange={(e) => updatePreference('inApp', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {preferences.inApp?.enabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Sound Notifications</span>
              <input
                type="checkbox"
                checked={preferences.inApp?.sound}
                onChange={(e) => updatePreference('inApp', 'sound', e.target.checked)}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Desktop Notifications</span>
              <input
                type="checkbox"
                checked={preferences.inApp?.desktop}
                onChange={(e) => updatePreference('inApp', 'desktop', e.target.checked)}
                className="rounded"
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Event Types</h4>
              <div className="space-y-2">
                {Object.entries(preferences.inApp?.events || {}).map(([event, enabled]) => (
                  <label key={event} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {event.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateEventPreference('inApp', event, e.target.checked)}
                      className="rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </button>
      </div>
    </div>
  );

  const TemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notification Templates</h3>
        <button
          onClick={() => setShowCreateTemplate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                    {template.type}
                  </span>
                  <div className="ml-3">{getStatusBadge(template.isActive ? 'active' : 'inactive')}</div>
                </div>
                
                {template.subject && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                )}
                
                <p className="text-sm text-gray-600 mb-3">{template.content}</p>
                
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded font-mono"
                      >
                        {'{' + variable + '}'}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Last used: {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}
                </p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SchedulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Schedules</h3>
        <button
          onClick={() => setShowCreateSchedule(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                  <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded capitalize">
                    {schedule.type}
                  </span>
                  <div className="ml-3">{getStatusBadge(schedule.isActive ? 'active' : 'inactive')}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  {schedule.type !== 'immediate' && (
                    <>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <span className="ml-2 font-medium">{schedule.time}</span>
                      </div>
                      {schedule.day && (
                        <div>
                          <span className="text-gray-600">Day:</span>
                          <span className="ml-2 font-medium capitalize">{schedule.day}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <span className="text-gray-600">Next Run:</span>
                    <span className="ml-2 font-medium">
                      {schedule.nextRun === 'On event' 
                        ? schedule.nextRun 
                        : new Date(schedule.nextRun).toLocaleString()
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {schedule.channels.map((channel) => {
                    const IconComponent = getChannelIcon(channel);
                    return (
                      <div key={channel} className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        <IconComponent className="w-3 h-3 mr-1" />
                        {channel}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SubscribersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notification Subscribers</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Subscriber
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscriber
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscriptions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{subscriber.name}</div>
                    <div className="text-sm text-gray-500">{subscriber.role}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{subscriber.email}</div>
                  <div className="text-sm text-gray-500">{subscriber.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {subscriber.subscriptions.map((subscription) => {
                      const IconComponent = getChannelIcon(subscription);
                      return (
                        <div key={subscription} className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          <IconComponent className="w-3 h-3 mr-1" />
                          {subscription}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(subscriber.isActive ? 'active' : 'inactive')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Send className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">12,450</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">12,180</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Opened</p>
              <p className="text-2xl font-bold text-gray-900">8,750</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">270</p>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Mail className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-sm text-gray-600">8,240 sent • 98.2% delivery rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">72% open rate</p>
              <p className="text-xs text-gray-600">15% click rate</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium">SMS</h4>
                <p className="text-sm text-gray-600">2,180 sent • 99.8% delivery rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">95% read rate</p>
              <p className="text-xs text-gray-600">8% click rate</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-purple-500 mr-3" />
              <div>
                <h4 className="font-medium">In-App</h4>
                <p className="text-sm text-gray-600">2,030 sent • 100% delivery rate</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">88% view rate</p>
              <p className="text-xs text-gray-600">25% action rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
            <span className="text-gray-600">Email notification delivered to</span>
            <span className="font-medium ml-1">john@company.com</span>
            <span className="text-gray-500 ml-auto">2 min ago</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
            <span className="text-gray-600">SMS sent to</span>
            <span className="font-medium ml-1">+1-555-0123</span>
            <span className="text-gray-500 ml-auto">5 min ago</span>
          </div>
          <div className="flex items-center text-sm">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-3" />
            <span className="text-gray-600">Email bounced for</span>
            <span className="font-medium ml-1">invalid@domain.com</span>
            <span className="text-gray-500 ml-auto">8 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading notification settings...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'preferences':
        return <NotificationPreferencesTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'schedules':
        return <SchedulesTab />;
      case 'subscribers':
        return <SubscribersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <NotificationPreferencesTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-600 mt-2">Configure notification preferences, templates, and delivery schedules</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Modals */}
      {showCreateTemplate && <CreateTemplateForm />}
      {showCreateSchedule && <CreateScheduleForm />}
    </div>
  );
};

export default NotificationSettings;