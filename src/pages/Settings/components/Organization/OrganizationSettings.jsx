import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Crown,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Edit,
  Trash2,
  MoreVertical,
  Settings,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const OrganizationSettings = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [organizationData, setOrganizationData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Mock organization data
  const mockOrgData = {
    name: 'Acme Corporation',
    domain: 'acme.com',
    industry: 'Technology',
    size: '50-100 employees',
    address: '123 Business St, San Francisco, CA 94105',
    phone: '+1 (555) 123-4567',
    website: 'https://acme.com',
    timezone: 'America/Los_Angeles',
    subscription: {
      plan: 'Enterprise',
      status: 'active',
      nextBilling: '2024-02-15',
      seats: 25,
      usedSeats: 18
    }
  };

  const mockTeamMembers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@acme.com',
      role: 'Admin',
      status: 'active',
      lastActive: '2024-01-15T14:30:00Z',
      avatar: null
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@acme.com',
      role: 'Manager',
      status: 'active',
      lastActive: '2024-01-15T10:15:00Z',
      avatar: null
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@acme.com',
      role: 'Agent',
      status: 'active',
      lastActive: '2024-01-15T16:45:00Z',
      avatar: null
    },
    {
      id: 4,
      name: 'Emma Wilson',
      email: 'emma.wilson@acme.com',
      role: 'Agent',
      status: 'invited',
      lastActive: null,
      avatar: null
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setOrganizationData(mockOrgData);
      setTeamMembers(mockTeamMembers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: Crown }
  ];

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'Manager':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'Agent':
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      invited: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const InviteUserForm = () => {
    const [inviteData, setInviteData] = useState({
      email: '',
      role: 'Agent',
      message: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newMember = {
        id: teamMembers.length + 1,
        name: inviteData.email.split('@')[0],
        email: inviteData.email,
        role: inviteData.role,
        status: 'invited',
        lastActive: null,
        avatar: null
      };
      
      setTeamMembers([...teamMembers, newMember]);
      setShowInviteForm(false);
      setInviteData({ email: '', role: 'Agent', message: '' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Agent">Agent</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
              <textarea
                value={inviteData.message}
                onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                placeholder="Welcome to our team!"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Send Invitation
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
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

  const OrganizationOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={organizationData?.name || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input
                type="text"
                value={organizationData?.domain || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="1-10 employees">1-10 employees</option>
                <option value="11-50 employees">11-50 employees</option>
                <option value="50-100 employees">50-100 employees</option>
                <option value="100+ employees">100+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={organizationData?.phone || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={organizationData?.website || ''}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={organizationData?.address || ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const TeamManagement = () => (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {organizationData?.subscription.usedSeats}
              </p>
              <p className="text-sm text-gray-600">Active Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.role === 'Admin').length}
              </p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.role === 'Manager').length}
              </p>
              <p className="text-sm text-gray-600">Managers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.status === 'invited').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <button
            onClick={() => setShowInviteForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(member.role)}
                      <span className="ml-2 text-sm text-gray-900">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.lastActive 
                      ? new Date(member.lastActive).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PermissionsSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
        <div className="space-y-6">
          {['Admin', 'Manager', 'Agent'].map((role) => (
            <div key={role} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-4">
                {getRoleIcon(role)}
                <h4 className="text-lg font-medium text-gray-900 ml-2">{role}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Dashboard Access</h5>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">View dashboard</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked={role !== 'Agent'} className="mr-2" />
                    <span className="text-sm text-gray-700">View analytics</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Call Management</h5>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">Make calls</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked={role !== 'Agent'} className="mr-2" />
                    <span className="text-sm text-gray-700">View all calls</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SubscriptionSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <Crown className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {organizationData?.subscription.plan}
                </h4>
                <p className="text-sm text-gray-600">Current plan</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">
                  {organizationData?.subscription.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next billing:</span>
                <span className="font-medium">
                  {new Date(organizationData?.subscription.nextBilling).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seats used:</span>
                <span className="font-medium">
                  {organizationData?.subscription.usedSeats} / {organizationData?.subscription.seats}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
              Upgrade Plan
            </button>
            <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">
              Add More Seats
            </button>
            <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300">
              View Billing History
            </button>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organization settings...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OrganizationOverview />;
      case 'team':
        return <TeamManagement />;
      case 'permissions':
        return <PermissionsSettings />;
      case 'subscription':
        return <SubscriptionSettings />;
      default:
        return <OrganizationOverview />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
        <p className="text-gray-600 mt-2">Manage your organization settings, team members, and permissions</p>
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

      {/* Invite Form Modal */}
      {showInviteForm && <InviteUserForm />}
    </div>
  );
};

export default OrganizationSettings;