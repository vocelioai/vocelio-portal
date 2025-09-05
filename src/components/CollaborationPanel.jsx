import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageCircle, Share2, Crown } from 'lucide-react';

const CollaborationPanel = ({ flowId, isOwner = false }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: true,
    allowEditing: false
  });

  useEffect(() => {
    // Load collaborators - mock data for now
    setCollaborators([
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'editor',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'viewer',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ]);
  }, [flowId]);

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;

    // Mock invite functionality
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
  };

  const handleRoleChange = (collaboratorId, newRole) => {
    setCollaborators(collaborators.map(c => 
      c.id === collaboratorId ? { ...c, role: newRole } : c
    ));
  };

  const handleRemoveCollaborator = (collaboratorId) => {
    setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
  };

  const formatLastActive = (timestamp) => {
    const now = new Date();
    const active = new Date(timestamp);
    const diffInMinutes = Math.floor((now - active) / (1000 * 60));

    if (diffInMinutes < 1) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Collaboration
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Invite Section */}
        {isOwner && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Collaborators
            </h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleInviteCollaborator}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Invite
              </button>
            </div>
          </div>
        )}

        {/* Collaborators List */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Team Members ({collaborators.length})
          </h4>
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {collaborator.name}
                      </span>
                      {collaborator.role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {collaborator.email} • {formatLastActive(collaborator.lastActive)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {collaborator.status === 'pending' && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                  
                  {isOwner && collaborator.role !== 'owner' ? (
                    <select
                      value={collaborator.role}
                      onChange={(e) => handleRoleChange(collaborator.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border-0 ${getRoleColor(collaborator.role)}`}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded ${getRoleColor(collaborator.role)}`}>
                      {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                    </span>
                  )}

                  {isOwner && collaborator.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Settings */}
        {isOwner && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Settings
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shareSettings.isPublic}
                  onChange={(e) => setShareSettings({
                    ...shareSettings,
                    isPublic: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Make this flow public</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shareSettings.allowComments}
                  onChange={(e) => setShareSettings({
                    ...shareSettings,
                    allowComments: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Allow comments</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shareSettings.allowEditing}
                  onChange={(e) => setShareSettings({
                    ...shareSettings,
                    allowEditing: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Allow public editing</span>
              </label>
            </div>

            {shareSettings.isPublic && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800 mb-2">Public Link:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`https://vocelio.app/flows/public/${flowId}`}
                    readOnly
                    className="flex-1 px-2 py-1 text-xs bg-white border rounded"
                  />
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Recent Comments
          </h4>
          <div className="text-sm text-gray-500 text-center py-4">
            No comments yet. Start a conversation!
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
