import React, { useState, useEffect } from 'react';
import { 
  X, Phone, Users, Target, BarChart3, Calendar, Clock, 
  Settings, Plus, Search, AlertCircle, CheckCircle, 
  Loader, Mic, Volume2, PlayCircle, List, Filter,
  Zap, MessageSquare, Mail, PhoneCall, User, Edit3
} from 'lucide-react';
import { campaignAPI } from '../config/api.js';
import { flowDesignerAPI, contactManagementAPI, voiceManagementAPI } from '../services/campaignIntegrationAPI.js';
import EnhancedContactSelector from './EnhancedContactSelector.jsx';

const CampaignCreationModal = ({ isOpen, onClose, onSuccess }) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'outbound_calls',
    contact_selection: { type: 'lists', lists: [], contacts: [] },
    call_flow_id: '',
    voice_id: '',
    schedule_type: 'immediate',
    scheduled_at: '',
    max_attempts: 3,
    retry_interval: 60,
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    timezone: 'America/New_York',
    tags: []
  });
  
  // Data state
  const [callFlows, setCallFlows] = useState([]);
  const [voices, setVoices] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [loadingFlows, setLoadingFlows] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Campaign type configurations
  const campaignTypes = [
    {
      id: 'outbound_calls',
      name: 'Outbound Calls',
      icon: PhoneCall,
      description: 'Automated outbound calling campaigns',
      color: 'blue',
      requiresFlow: true,
      requiresVoice: true,
      requiresContacts: true
    },
    {
      id: 'sms_blast',
      name: 'SMS Blast',
      icon: MessageSquare,
      description: 'Mass SMS messaging campaigns',
      color: 'green',
      requiresFlow: false,
      requiresVoice: false,
      requiresContacts: true
    },
    {
      id: 'email_campaign',
      name: 'Email Campaign',
      icon: Mail,
      description: 'Email marketing campaigns',
      color: 'purple',
      requiresFlow: false,
      requiresVoice: false,
      requiresContacts: true
    },
    {
      id: 'mixed_media',
      name: 'Mixed Media',
      icon: BarChart3,
      description: 'Multi-channel campaign (calls, SMS, email)',
      color: 'orange',
      requiresFlow: true,
      requiresVoice: true,
      requiresContacts: true
    }
  ];

  // Load data functions
  const loadCallFlows = async () => {
    try {
      setLoadingFlows(true);
      const flows = await flowDesignerAPI.getUserFlows();
      setCallFlows(flows);
    } catch (err) {
      console.error('Failed to load call flows:', err);
      setError('Failed to load call flows');
    } finally {
      setLoadingFlows(false);
    }
  };

  const loadVoices = async () => {
    try {
      setLoadingVoices(true);
      const voiceData = await voiceManagementAPI.getAvailableVoices();
      setVoices(voiceData);
    } catch (err) {
      console.error('Failed to load voices:', err);
      setError('Failed to load voices');
    } finally {
      setLoadingVoices(false);
    }
  };

  const loadContactLists = async () => {
    try {
      const lists = await contactManagementAPI.getContactLists();
      setContactLists(lists);
    } catch (err) {
      console.error('Failed to load contact lists:', err);
      setError('Failed to load contact lists');
    }
  };

  // Handle contact selection
  const handleContactSelection = (selection) => {
    setFormData(prev => ({
      ...prev,
      contact_selection: selection
    }));
  };

  // Get contact selection summary
  const getContactSummary = () => {
    const { contact_selection } = formData;
    if (contact_selection.type === 'lists' && contact_selection.lists.length > 0) {
      const selectedListObjects = contactLists.filter(list => contact_selection.lists.includes(list.id));
      const totalContacts = selectedListObjects.reduce((sum, list) => sum + list.contactCount, 0);
      return {
        count: contact_selection.lists.length,
        totalContacts,
        description: `${contact_selection.lists.length} list(s) with ${totalContacts.toLocaleString()} contacts`
      };
    } else if (contact_selection.type === 'individual' && contact_selection.contacts.length > 0) {
      return {
        count: contact_selection.contacts.length,
        totalContacts: contact_selection.contacts.length,
        description: `${contact_selection.contacts.length} individual contacts selected`
      };
    }
    return { count: 0, totalContacts: 0, description: 'No contacts selected' };
  };

  const selectedCampaignType = campaignTypes.find(type => type.id === formData.campaign_type);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle contact list selection (legacy - kept for backward compatibility)
  const toggleContactList = (listId) => {
    setFormData(prev => ({
      ...prev,
      contact_selection: {
        type: 'lists',
        lists: prev.contact_selection.lists.includes(listId)
          ? prev.contact_selection.lists.filter(id => id !== listId)
          : [...prev.contact_selection.lists, listId],
        contacts: []
      }
    }));
  };

  // Filter contact lists by search
  const filteredContactLists = contactLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submit campaign
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Campaign name is required');
      }
      if (formData.contact_selection.type === 'lists' && formData.contact_selection.lists.length === 0) {
        throw new Error('At least one contact list must be selected');
      }
      if (formData.contact_selection.type === 'individual' && formData.contact_selection.contacts.length === 0) {
        throw new Error('At least one contact must be selected');
      }
      if (selectedCampaignType.requiresFlow && !formData.call_flow_id) {
        throw new Error('Call flow selection is required for this campaign type');
      }
      if (selectedCampaignType.requiresVoice && !formData.voice_id) {
        throw new Error('Voice selection is required for this campaign type');
      }

      // Prepare campaign data
      const campaignData = {
        ...formData,
        // Convert contact selection to API format
        contact_lists: formData.contact_selection.type === 'lists' ? formData.contact_selection.lists : [],
        individual_contacts: formData.contact_selection.type === 'individual' ? formData.contact_selection.contacts : [],
        scheduled_at: formData.schedule_type === 'scheduled' ? formData.scheduled_at : null,
      };

      // Create campaign
      const result = await campaignAPI.createCampaign(campaignData);
      
      console.log('Campaign created successfully:', result);
      onSuccess(result);
      onClose();

    } catch (err) {
      console.error('Failed to create campaign:', err);
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFormData({
        name: '',
        description: '',
        campaign_type: 'outbound_calls',
        contact_selection: { type: 'lists', lists: [], contacts: [] },
        call_flow_id: '',
        voice_id: '',
        schedule_type: 'immediate',
        scheduled_at: '',
        max_attempts: 3,
        retry_interval: 60,
        working_hours_start: '09:00',
        working_hours_end: '17:00',
        timezone: 'America/New_York',
        tags: []
      });
      setError(null);
      setSearchTerm('');
    } else {
      // Load data when modal opens
      loadContactLists();
      loadCallFlows();
      loadVoices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    { id: 1, name: 'Campaign Type', icon: Target },
    { id: 2, name: 'Basic Info', icon: Settings },
    { id: 3, name: 'Contact Lists', icon: Users },
    ...(selectedCampaignType?.requiresFlow ? [{ id: 4, name: 'Call Flow', icon: Phone }] : []),
    ...(selectedCampaignType?.requiresVoice ? [{ id: 5, name: 'Voice Selection', icon: Mic }] : []),
    { id: 6, name: 'Schedule', icon: Calendar }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Campaign</h2>
            <p className="text-gray-600 text-sm">Set up your marketing campaign with integrated systems</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium
                  ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}
                `}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4
                    ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Campaign Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Campaign Type</h3>
                <p className="text-gray-600 mb-4">Choose the type of marketing campaign you want to create</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaignTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.campaign_type === type.id;
                  
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleInputChange('campaign_type', type.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${isSelected 
                          ? `border-${type.color}-500 bg-${type.color}-50` 
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 mt-1 ${isSelected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${isSelected ? `text-${type.color}-900` : 'text-gray-900'}`}>
                            {type.name}
                          </h4>
                          <p className={`text-sm mt-1 ${isSelected ? `text-${type.color}-700` : 'text-gray-600'}`}>
                            {type.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {type.requiresContacts && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Contacts Required
                              </span>
                            )}
                            {type.requiresFlow && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Call Flow
                              </span>
                            )}
                            {type.requiresVoice && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                                Voice Selection
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Information</h3>
                <p className="text-gray-600 mb-4">Provide basic details about your campaign</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Q4 Real Estate Outreach"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the purpose and goals of this campaign..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Attempts per Contact
                    </label>
                    <select
                      value={formData.max_attempts}
                      onChange={(e) => handleInputChange('max_attempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1 attempt</option>
                      <option value={2}>2 attempts</option>
                      <option value={3}>3 attempts</option>
                      <option value={5}>5 attempts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retry Interval (minutes)
                    </label>
                    <select
                      value={formData.retry_interval}
                      onChange={(e) => handleInputChange('retry_interval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={240}>4 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Contacts</h3>
                <p className="text-gray-600 mb-4">Choose which contacts to target in this campaign</p>
              </div>

              {/* Current Selection Display */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Contact Selection</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {getContactSummary().description}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowContactSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {getContactSummary().count > 0 ? (
                      <>
                        <Edit3 className="w-4 h-4" />
                        Modify Selection
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Select Contacts
                      </>
                    )}
                  </button>
                </div>
                
                {getContactSummary().count > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="text-lg font-semibold text-blue-600">
                        {getContactSummary().totalContacts.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Total Contacts</div>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="text-lg font-semibold text-green-600">
                        {formData.contact_selection.type === 'lists' ? 'List Mode' : 'Individual Mode'}
                      </div>
                      <div className="text-xs text-gray-600">Selection Type</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Selection Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Selection Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>List Mode:</strong> Select entire contact lists for broad campaigns</li>
                  <li>• <strong>Individual Mode:</strong> Handpick specific contacts for targeted campaigns</li>
                  <li>• You can filter contacts by status, phone type, and other criteria</li>
                  <li>• Use bulk selection tools to quickly select multiple contacts</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Call Flow (only for campaigns that require it) */}
          {currentStep === 4 && selectedCampaignType?.requiresFlow && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Call Flow</h3>
                <p className="text-gray-600 mb-4">Choose the call flow script for outbound calls from your Flow Designer</p>
              </div>

              {loadingFlows ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading your call flows...</p>
                </div>
              ) : callFlows.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Call Flows Found</h3>
                  <p className="text-gray-600 mb-4">You need to create call flows in the Flow Designer first</p>
                  <button
                    onClick={loadCallFlows}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Refresh Flows
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {callFlows.map((flow) => (
                    <div
                      key={flow.id}
                      onClick={() => handleInputChange('call_flow_id', flow.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all
                        ${formData.call_flow_id === flow.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2
                          ${formData.call_flow_id === flow.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                          }`}>
                          {formData.call_flow_id === flow.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{flow.name}</h4>
                            <div className="flex items-center gap-2">
                              {flow.isActive && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Active
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                by {flow.author}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{flow.description}</p>
                          {flow.created && (
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {new Date(flow.created).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {callFlows.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">✅ Flow Designer Integration</h4>
                  <p className="text-sm text-green-800">
                    These flows are loaded directly from your Flow Designer. Any changes made to flows 
                    will be automatically reflected in your campaigns.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Voice Selection (only for campaigns that require it) */}
          {currentStep === 5 && selectedCampaignType?.requiresVoice && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Voice</h3>
                <p className="text-gray-600 mb-4">Choose the AI voice for your campaign calls</p>
              </div>

              {loadingVoices ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading available voices...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voices.map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => handleInputChange('voice_id', voice.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all
                        ${formData.voice_id === voice.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1
                          ${formData.voice_id === voice.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                          }`}>
                          {formData.voice_id === voice.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{voice.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              voice.type === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {voice.type}
                            </span>
                            {voice.provider && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {voice.provider}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {voice.language} {voice.accent && `• ${voice.accent}`}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Play voice sample
                                if (voice.sampleUrl) {
                                  const audio = new Audio(voice.sampleUrl);
                                  audio.play().catch(err => console.log('Audio play failed:', err));
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <PlayCircle className="w-3 h-3" />
                              Preview
                            </button>
                            {voice.isActive && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Schedule */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Schedule</h3>
                <p className="text-gray-600 mb-4">Set when the campaign should start and working hours</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="schedule_type"
                        value="immediate"
                        checked={formData.schedule_type === 'immediate'}
                        onChange={(e) => handleInputChange('schedule_type', e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Start immediately</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="schedule_type"
                        value="scheduled"
                        checked={formData.schedule_type === 'scheduled'}
                        onChange={(e) => handleInputChange('schedule_type', e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Schedule for later</span>
                    </label>
                  </div>
                  
                  {formData.schedule_type === 'scheduled' && (
                    <div className="mt-2">
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Working Hours Start
                    </label>
                    <input
                      type="time"
                      value={formData.working_hours_start}
                      onChange={(e) => handleInputChange('working_hours_start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Working Hours End
                    </label>
                    <input
                      type="time"
                      value={formData.working_hours_end}
                      onChange={(e) => handleInputChange('working_hours_end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Campaign
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Contact Selector Modal */}
      <EnhancedContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelectionComplete={handleContactSelection}
        initialSelection={formData.contact_selection}
        title="Select Contacts for Campaign"
      />
    </div>
  );
};

export default CampaignCreationModal;