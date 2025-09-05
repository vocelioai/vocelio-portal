import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageCircle, Share2, Crown, Settings } from 'lucide-react';

const FlowCollaboration = ({ flowId, currentUser, onInvite, onShare }) => {
  const [collaborators, setCollaborators] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'editor',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'online'
    },
    {
      id: 2,
      name: 'Jane Smith', 
      email: 'jane@example.com',
      role: 'viewer',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
      lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'offline'
    }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: true,
    allowEditing: false
  });

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    const newCollaborator = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'viewer',
      avatar: `https://ui-avatars.com/api/?name=${inviteEmail.split('@')[0]}`,
      lastActive: new Date().toISOString(),
      status: 'pending'
    };

    setCollaborators([...collaborators, newCollaborator]);
    setInviteEmail('');
    
    if (onInvite) {
      onInvite(newCollaborator);
    }
  };

  const handleRoleChange = (collaboratorId, newRole) => {
    setCollaborators(collaborators.map(c => 
      c.id === collaboratorId ? { ...c, role: newRole } : c
    ));
  };

  const handleRemoveCollaborator = (collaboratorId) => {
    setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      case 'viewer': return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Team Collaboration
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage team access and collaboration settings
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Invite Section */}
        <div className="border-b pb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Team Members
          </h4>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleInviteUser()}
            />
            <button
              onClick={handleInviteUser}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          </div>
        </div>

        {/* Team Members */}
        <div className="border-b pb-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Team Members ({collaborators.length})
          </h4>
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={collaborator.avatar}
                      alt={collaborator.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`}></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{collaborator.name}</span>
                      {collaborator.role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{collaborator.email}</div>
                    <div className="text-xs text-gray-400">
                      {collaborator.status === 'online' ? 'Active now' : 
                       collaborator.status === 'pending' ? 'Invitation pending' :
                       `Last active ${new Date(collaborator.lastActive).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={collaborator.role}
                    onChange={(e) => handleRoleChange(collaborator.id, e.target.value)}
                    className={`text-xs px-3 py-1 rounded-full border-0 ${getRoleColor(collaborator.role)}`}
                    disabled={collaborator.role === 'owner'}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    {collaborator.role === 'owner' && <option value="owner">Owner</option>}
                  </select>

                  {collaborator.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Settings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Settings
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Public Access</div>
                <div className="text-sm text-gray-500">Allow anyone with the link to view</div>
              </div>
              <input
                type="checkbox"
                checked={shareSettings.isPublic}
                onChange={(e) => setShareSettings({
                  ...shareSettings,
                  isPublic: e.target.checked
                })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Comments</div>
                <div className="text-sm text-gray-500">Allow team members to leave comments</div>
              </div>
              <input
                type="checkbox"
                checked={shareSettings.allowComments}
                onChange={(e) => setShareSettings({
                  ...shareSettings,
                  allowComments: e.target.checked
                })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Public Editing</div>
                <div className="text-sm text-gray-500">Allow public users to edit the flow</div>
              </div>
              <input
                type="checkbox"
                checked={shareSettings.allowEditing}
                onChange={(e) => setShareSettings({
                  ...shareSettings,
                  allowEditing: e.target.checked
                })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>

          {shareSettings.isPublic && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-2">Public Link</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://vocelio.app/flows/public/${flowId}`}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-blue-200 rounded"
                />
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowCollaboration;
