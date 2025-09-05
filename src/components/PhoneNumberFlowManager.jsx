import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Plus, 
  Edit3, 
  Trash2, 
  Link, 
  Unlink,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

const PhoneNumberFlowManager = ({ isOpen, onClose }) => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [deployedFlows, setDeployedFlows] = useState([]);
  const [phoneFlowMappings, setPhoneFlowMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [selectedFlow, setSelectedFlow] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPhoneNumbers();
      loadDeployedFlows();
      loadPhoneFlowMappings();
    }
  }, [isOpen]);

  const loadPhoneNumbers = async () => {
    try {
      // Load from your phone number service or Twilio
      const response = await fetch(`${import.meta.env.VITE_PHONE_NUMBER_SERVICE_URL}/numbers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPhoneNumbers(data.numbers || []);
      } else {
        // Fallback to your known Twilio number
        setPhoneNumbers([
          {
            phone_number: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '+13072249663',
            friendly_name: 'Main Business Line',
            capabilities: ['voice', 'sms'],
            status: 'active'
          }
        ]);
      }
    } catch (error) {
      console.warn('Could not load phone numbers:', error);
      // Use fallback
      setPhoneNumbers([
        {
          phone_number: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '+13072249663',
          friendly_name: 'Main Business Line',
          capabilities: ['voice', 'sms'],
          status: 'active'
        }
      ]);
    }
  };

  const loadDeployedFlows = () => {
    try {
      const flows = JSON.parse(localStorage.getItem('deployed_flows') || '[]');
      setDeployedFlows(flows.filter(flow => flow.status === 'active'));
    } catch (error) {
      console.error('Error loading deployed flows:', error);
    }
  };

  const loadPhoneFlowMappings = () => {
    try {
      const mappings = JSON.parse(localStorage.getItem('phone_flow_mapping') || '[]');
      setPhoneFlowMappings(mappings);
    } catch (error) {
      console.error('Error loading phone-flow mappings:', error);
    }
  };

  const assignFlowToPhone = async () => {
    if (!selectedPhone || !selectedFlow) {
      alert('Please select both a phone number and a flow');
      return;
    }

    setLoading(true);
    try {
      // Find the flow details
      const flow = deployedFlows.find(f => f.id === selectedFlow);
      if (!flow) {
        throw new Error('Selected flow not found');
      }

      // Create the mapping
      const newMapping = [selectedPhone, {
        flowId: selectedFlow,
        flowName: flow.name,
        voiceSettings: flow.voice_settings || {},
        assignedAt: new Date().toISOString()
      }];

      // Update mappings
      const existingMappings = phoneFlowMappings.filter(([phone]) => phone !== selectedPhone);
      const updatedMappings = [...existingMappings, newMapping];
      
      setPhoneFlowMappings(updatedMappings);
      localStorage.setItem('phone_flow_mapping', JSON.stringify(updatedMappings));

      // Update deployed flow with phone number assignment
      const updatedFlows = JSON.parse(localStorage.getItem('deployed_flows') || '[]').map(f => {
        if (f.id === selectedFlow) {
          return {
            ...f,
            phone_numbers: [...(f.phone_numbers || []), selectedPhone].filter((v, i, a) => a.indexOf(v) === i)
          };
        }
        return f;
      });
      localStorage.setItem('deployed_flows', JSON.stringify(updatedFlows));

      // Register with telephony adapter
      try {
        await fetch(`${import.meta.env.VITE_TELEPHONY_ADAPTER_URL}/admin/register-flow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify({
            flow_id: selectedFlow,
            phone_numbers: [selectedPhone],
            webhook_url: `${import.meta.env.VITE_FLOW_PROCESSOR_URL}/webhook/execute`
          })
        });
      } catch (error) {
        console.warn('Telephony registration failed:', error);
      }

      setSelectedPhone('');
      setSelectedFlow('');
      
      alert(`✅ Successfully assigned ${flow.name} to ${selectedPhone}`);
      
    } catch (error) {
      console.error('Error assigning flow:', error);
      alert(`❌ Failed to assign flow: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const unassignFlowFromPhone = async (phoneNumber) => {
    if (!confirm(`Are you sure you want to unassign the flow from ${phoneNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      // Remove mapping
      const updatedMappings = phoneFlowMappings.filter(([phone]) => phone !== phoneNumber);
      setPhoneFlowMappings(updatedMappings);
      localStorage.setItem('phone_flow_mapping', JSON.stringify(updatedMappings));

      // Unregister from telephony adapter
      try {
        await fetch(`${import.meta.env.VITE_TELEPHONY_ADAPTER_URL}/admin/unregister-flow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          },
          body: JSON.stringify({
            phone_number: phoneNumber
          })
        });
      } catch (error) {
        console.warn('Telephony unregistration failed:', error);
      }

      alert(`✅ Successfully unassigned flow from ${phoneNumber}`);
      
    } catch (error) {
      console.error('Error unassigning flow:', error);
      alert(`❌ Failed to unassign flow: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFlowForPhone = (phoneNumber) => {
    const mapping = phoneFlowMappings.find(([phone]) => phone === phoneNumber);
    return mapping ? mapping[1] : null;
  };

  const getAvailablePhones = () => {
    const assignedPhones = new Set(phoneFlowMappings.map(([phone]) => phone));
    return phoneNumbers.filter(phone => !assignedPhones.has(phone.phone_number));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Phone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Phone Number → Flow Assignment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Assignment Form */}
        <div className="bg-gray-50 p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Assign New Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <select
                value={selectedPhone}
                onChange={(e) => setSelectedPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select phone number...</option>
                {getAvailablePhones().map((phone) => (
                  <option key={phone.phone_number} value={phone.phone_number}>
                    {phone.phone_number} - {phone.friendly_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flow
              </label>
              <select
                value={selectedFlow}
                onChange={(e) => setSelectedFlow(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select flow...</option>
                {deployedFlows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name} (ID: {flow.id})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={assignFlowToPhone}
                disabled={loading || !selectedPhone || !selectedFlow}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Link className="w-4 h-4" />
                <span>Assign Flow</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Assignments */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Assignments</h3>
            
            {phoneNumbers.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Phone Numbers</h3>
                <p className="text-gray-600">No phone numbers available for assignment</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {phoneNumbers.map((phone) => {
                  const flowMapping = getFlowForPhone(phone.phone_number);
                  
                  return (
                    <div key={phone.phone_number} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-semibold text-gray-900">{phone.phone_number}</div>
                              <div className="text-sm text-gray-600">{phone.friendly_name}</div>
                            </div>
                          </div>
                          
                          <div className="ml-8">
                            {flowMapping ? (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-900">
                                  Assigned to: <strong>{flowMapping.flowName}</strong>
                                </span>
                                <span className="text-xs text-gray-500">
                                  (ID: {flowMapping.flowId})
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-gray-600">No flow assigned</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {flowMapping && (
                            <button
                              onClick={() => unassignFlowFromPhone(phone.phone_number)}
                              disabled={loading}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Unassign Flow"
                            >
                              <Unlink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {flowMapping && (
                        <div className="mt-3 ml-8 text-xs text-gray-500">
                          Assigned: {new Date(flowMapping.assignedAt).toLocaleDateString()} at{' '}
                          {new Date(flowMapping.assignedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>{phoneFlowMappings.length}</strong> of <strong>{phoneNumbers.length}</strong> phone numbers have assigned flows
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Settings className="w-4 h-4" />
              <span>Changes take effect immediately</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberFlowManager;
