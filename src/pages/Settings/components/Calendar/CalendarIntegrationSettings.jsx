import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Globe,
  Settings,
  Users,
  Video,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Link,
  Unlink,
  Download,
  Upload,
  Mail,
  Bell,
  Phone,
  Copy,
  ExternalLink,
  MapPin,
  CalendarDays,
  Timer,
  UserPlus,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Activity,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const CalendarIntegrationSettings = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectCalendar, setShowConnectCalendar] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  // Mock calendar connections
  const mockConnections = [
    {
      id: 1,
      provider: 'google',
      name: 'Google Calendar',
      email: 'admin@company.com',
      status: 'connected',
      connectedAt: '2024-01-15',
      calendars: [
        { id: 'primary', name: 'Primary Calendar', selected: true },
        { id: 'meetings', name: 'Meetings', selected: true },
        { id: 'personal', name: 'Personal', selected: false }
      ],
      permissions: ['read', 'write', 'delete'],
      lastSync: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      provider: 'outlook',
      name: 'Microsoft Outlook',
      email: 'admin@company.com',
      status: 'connected',
      connectedAt: '2024-01-10',
      calendars: [
        { id: 'calendar', name: 'Calendar', selected: true },
        { id: 'work', name: 'Work Events', selected: true }
      ],
      permissions: ['read', 'write'],
      lastSync: '2024-01-20T10:25:00Z'
    },
    {
      id: 3,
      provider: 'apple',
      name: 'Apple Calendar',
      email: 'admin@icloud.com',
      status: 'error',
      connectedAt: '2024-01-05',
      calendars: [],
      permissions: ['read'],
      lastSync: null,
      error: 'Authentication expired'
    }
  ];

  const mockTemplates = [
    {
      id: 1,
      name: 'Sales Call',
      description: 'Standard sales call meeting template',
      duration: 30,
      location: 'Video Call',
      agenda: 'Product demo and discussion',
      reminderMinutes: [15, 1440],
      attendeeLimit: 5,
      bufferTime: 15,
      isDefault: true,
      category: 'sales'
    },
    {
      id: 2,
      name: 'Support Session',
      description: 'Customer support consultation',
      duration: 60,
      location: 'Zoom Meeting',
      agenda: 'Technical support and troubleshooting',
      reminderMinutes: [30],
      attendeeLimit: 3,
      bufferTime: 10,
      isDefault: false,
      category: 'support'
    },
    {
      id: 3,
      name: 'Team Standup',
      description: 'Daily team synchronization meeting',
      duration: 15,
      location: 'Conference Room A',
      agenda: 'Daily updates and blockers discussion',
      reminderMinutes: [5],
      attendeeLimit: 10,
      bufferTime: 5,
      isDefault: false,
      category: 'internal'
    }
  ];

  const mockAutomations = [
    {
      id: 1,
      name: 'Call Completion Booking',
      trigger: 'call_completed',
      action: 'create_followup',
      isActive: true,
      template: 'Sales Call',
      delay: 24,
      conditions: {
        callDuration: { min: 5 },
        callStatus: 'completed'
      },
      lastTriggered: '2024-01-20'
    },
    {
      id: 2,
      name: 'Campaign End Summary',
      trigger: 'campaign_completed',
      action: 'schedule_review',
      isActive: true,
      template: 'Team Standup',
      delay: 1,
      conditions: {
        campaignSuccess: true
      },
      lastTriggered: '2024-01-19'
    }
  ];

  const mockBookings = [
    {
      id: 1,
      title: 'Product Demo with Acme Corp',
      start: '2024-01-22T14:00:00Z',
      end: '2024-01-22T14:30:00Z',
      attendees: ['john@acme.com', 'sarah@company.com'],
      location: 'Zoom Meeting',
      status: 'confirmed',
      calendarProvider: 'google',
      meetingUrl: 'https://zoom.us/j/123456789',
      template: 'Sales Call'
    },
    {
      id: 2,
      title: 'Support Session - TechStart Inc',
      start: '2024-01-22T16:00:00Z',
      end: '2024-01-22T17:00:00Z',
      attendees: ['mike@techstart.com'],
      location: 'Phone Call',
      status: 'pending',
      calendarProvider: 'outlook',
      template: 'Support Session'
    }
  ];

  const mockSettings = {
    defaultTimezone: 'UTC-5',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    bookingWindow: {
      min: 2, // hours in advance
      max: 90 // days in advance
    },
    autoAccept: true,
    bufferTime: 15,
    maxDailyBookings: 8,
    notifications: {
      email: true,
      sms: false,
      inApp: true
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setConnections(mockConnections);
      setTemplates(mockTemplates);
      setAutomations(mockAutomations);
      setBookings(mockBookings);
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'connections', label: 'Calendar Connections', icon: Link },
    { id: 'templates', label: 'Meeting Templates', icon: Calendar },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'bookings', label: 'Upcoming Bookings', icon: CalendarDays },
    { id: 'settings', label: 'General Settings', icon: Settings }
  ];

  const getProviderIcon = (provider) => {
    const icons = {
      google: '📅',
      outlook: '📧',
      apple: '🍎',
      zoom: '📹'
    };
    return icons[provider] || '📅';
  };

  const getStatusBadge = (status) => {
    const styles = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      syncing: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ConnectCalendarForm = () => {
    const [selectedProvider, setSelectedProvider] = useState('google');

    const providers = [
      { id: 'google', name: 'Google Calendar', description: 'Connect your Google Calendar account' },
      { id: 'outlook', name: 'Microsoft Outlook', description: 'Connect your Outlook/Office 365 calendar' },
      { id: 'apple', name: 'Apple Calendar', description: 'Connect your iCloud calendar' },
      { id: 'zoom', name: 'Zoom', description: 'Integrate Zoom meetings' }
    ];

    const handleConnect = () => {
      // In real implementation, this would redirect to OAuth flow
      const newConnection = {
        id: connections.length + 1,
        provider: selectedProvider,
        name: providers.find(p => p.id === selectedProvider)?.name,
        email: 'user@example.com',
        status: 'connected',
        connectedAt: new Date().toISOString().split('T')[0],
        calendars: [{ id: 'primary', name: 'Primary Calendar', selected: true }],
        permissions: ['read', 'write'],
        lastSync: new Date().toISOString()
      };
      
      setConnections([...connections, newConnection]);
      setShowConnectCalendar(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Calendar</h3>
          <div className="space-y-3">
            {providers.map((provider) => (
              <label key={provider.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="provider"
                  value={provider.id}
                  checked={selectedProvider === provider.id}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="mr-3"
                />
                <div className="mr-3 text-2xl">{getProviderIcon(provider.id)}</div>
                <div>
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-600">{provider.description}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleConnect}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Connect
            </button>
            <button
              onClick={() => setShowConnectCalendar(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CreateTemplateForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      duration: 30,
      location: 'Video Call',
      agenda: '',
      reminderMinutes: [15],
      attendeeLimit: 5,
      bufferTime: 15,
      category: 'sales'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newTemplate = {
        id: templates.length + 1,
        ...formData,
        isDefault: false
      };
      
      setTemplates([...templates, newTemplate]);
      setShowCreateTemplate(false);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        location: 'Video Call',
        agenda: '',
        reminderMinutes: [15],
        attendeeLimit: 5,
        bufferTime: 15,
        category: 'sales'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Meeting Template</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sales Call"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Standard sales call meeting template"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="15"
                  max="480"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendee Limit</label>
                <input
                  type="number"
                  value={formData.attendeeLimit}
                  onChange={(e) => setFormData({ ...formData, attendeeLimit: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Video Call">Video Call</option>
                <option value="Phone Call">Phone Call</option>
                <option value="In Person">In Person</option>
                <option value="Zoom Meeting">Zoom Meeting</option>
                <option value="Teams Meeting">Teams Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
              <textarea
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="Meeting agenda and topics to discuss"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="internal">Internal</option>
                <option value="training">Training</option>
                <option value="consultation">Consultation</option>
              </select>
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

  const ConnectionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Calendar Connections</h3>
        <button
          onClick={() => setShowConnectCalendar(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Connect Calendar
        </button>
      </div>

      <div className="space-y-4">
        {connections.map((connection) => (
          <div key={connection.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{getProviderIcon(connection.provider)}</div>
                <div>
                  <div className="flex items-center mb-1">
                    <h4 className="font-medium text-gray-900">{connection.name}</h4>
                    <div className="ml-3">{getStatusBadge(connection.status)}</div>
                  </div>
                  <p className="text-sm text-gray-600">{connection.email}</p>
                  <p className="text-xs text-gray-500">
                    Connected on {new Date(connection.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800 p-2">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2">
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {connection.status === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-800">{connection.error}</span>
                </div>
              </div>
            )}

            {connection.status === 'connected' && (
              <>
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Connected Calendars</h5>
                  <div className="space-y-2">
                    {connection.calendars.map((calendar) => (
                      <label key={calendar.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={calendar.selected}
                          onChange={() => {
                            // Update calendar selection
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{calendar.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Permissions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {connection.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Sync:</span>
                    <p className="font-medium">
                      {connection.lastSync 
                        ? new Date(connection.lastSync).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
              </>
            )}

            {connection.status === 'connected' && (
              <div className="mt-4 flex space-x-3">
                <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                  Sync Now
                </button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Test Connection
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const TemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Meeting Templates</h3>
        <button
          onClick={() => setShowCreateTemplate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  {template.isDefault && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Default
                    </span>
                  )}
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded capitalize">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{template.duration} min</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-1" />
                    <span>Max {template.attendeeLimit}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{template.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{template.bufferTime} min buffer</span>
                  </div>
                </div>

                {template.agenda && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <strong>Agenda:</strong> {template.agenda}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-green-600 hover:text-green-800 p-2">
                  <Copy className="w-4 h-4" />
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

  const AutomationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </button>
      </div>

      <div className="space-y-4">
        {automations.map((automation) => (
          <div key={automation.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="font-medium text-gray-900">{automation.name}</h4>
                  <div className="ml-3">{getStatusBadge(automation.isActive ? 'connected' : 'disconnected')}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Trigger:</span>
                    <p className="font-medium capitalize">{automation.trigger.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Action:</span>
                    <p className="font-medium capitalize">{automation.action.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Template:</span>
                    <p className="font-medium">{automation.template}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Delay:</span>
                  <span className="ml-2 font-medium">{automation.delay} hours</span>
                  {automation.lastTriggered && (
                    <>
                      <span className="text-gray-600 ml-4">Last triggered:</span>
                      <span className="ml-2 font-medium">
                        {new Date(automation.lastTriggered).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
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

  const BookingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
        <div className="flex space-x-2">
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center hover:bg-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meeting
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendees
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
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.title}</div>
                    <div className="text-sm text-gray-500">{booking.location}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(booking.start).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(booking.start).toLocaleTimeString()} - {new Date(booking.end).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.attendees.slice(0, 2).join(', ')}
                    {booking.attendees.length > 2 && ` +${booking.attendees.length - 2} more`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    {booking.meetingUrl && (
                      <button className="text-green-600 hover:text-green-900">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
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

  const SettingsTab = () => (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Timezone</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC-6">Central Time (UTC-6)</option>
              <option value="UTC-7">Mountain Time (UTC-7)</option>
              <option value="UTC-8">Pacific Time (UTC-8)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Daily Bookings</label>
            <input
              type="number"
              defaultValue={settings.maxDailyBookings}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="1"
              max="20"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              defaultValue={settings.workingHours?.start}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              defaultValue={settings.workingHours?.end}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={settings.workingHours?.days?.includes(day)}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{day}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Window */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Window</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Notice (hours)</label>
            <input
              type="number"
              defaultValue={settings.bookingWindow?.min}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="0"
              max="168"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Advance (days)</label>
            <input
              type="number"
              defaultValue={settings.bookingWindow?.max}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="1"
              max="365"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email Notifications</span>
            <input
              type="checkbox"
              defaultChecked={settings.notifications?.email}
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">SMS Notifications</span>
            <input
              type="checkbox"
              defaultChecked={settings.notifications?.sms}
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">In-App Notifications</span>
            <input
              type="checkbox"
              defaultChecked={settings.notifications?.inApp}
              className="rounded"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Auto-Accept Bookings</span>
            <input
              type="checkbox"
              defaultChecked={settings.autoAccept}
              className="rounded"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading calendar integration...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'connections':
        return <ConnectionsTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'automations':
        return <AutomationsTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ConnectionsTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar Integration</h1>
        <p className="text-gray-600 mt-2">Connect calendars, manage meeting templates, and automate scheduling</p>
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
      {showConnectCalendar && <ConnectCalendarForm />}
      {showCreateTemplate && <CreateTemplateForm />}
    </div>
  );
};

export default CalendarIntegrationSettings;