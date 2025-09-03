import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Share2, Settings, UserPlus, 
  Bell, Clock, Eye, Edit3, Trash2, Link, Copy,
  ChevronDown, Search, Filter, MoreHorizontal,
  CheckCircle, Circle, AlertCircle, Send, Upload
} from 'lucide-react';

const CollaborationPanel = ({ isDarkMode, flowData }) => {
  const [activeTab, setActiveTab] = useState('team');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [teamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      role: 'Owner',
      avatar: null,
      status: 'online',
      lastActive: 'now',
      permissions: 'full'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Editor',
      avatar: null,
      status: 'online',
      lastActive: '5 minutes ago',
      permissions: 'edit'
    },
    {
      id: 3,
      name: 'Lisa Wang',
      email: 'lisa.wang@company.com',
      role: 'Viewer',
      avatar: null,
      status: 'away',
      lastActive: '2 hours ago',
      permissions: 'view'
    },
    {
      id: 4,
      name: 'David Rodriguez',
      email: 'david.rodriguez@company.com',
      role: 'Editor',
      avatar: null,
      status: 'offline',
      lastActive: '1 day ago',
      permissions: 'edit'
    }
  ]);

  const [comments] = useState([
    {
      id: 1,
      author: 'Mike Johnson',
      content: 'The greeting node needs to be more concise. Current message is too long.',
      timestamp: '2 hours ago',
      nodeId: 'greeting',
      replies: [
        {
          id: 11,
          author: 'Sarah Chen',
          content: 'Good point! I\'ll update it to be more direct.',
          timestamp: '1 hour ago'
        }
      ],
      resolved: false
    },
    {
      id: 2,
      author: 'Lisa Wang',
      content: 'Should we add a callback option after the transfer fails?',
      timestamp: '4 hours ago',
      nodeId: 'transfer',
      replies: [],
      resolved: false
    },
    {
      id: 3,
      author: 'Sarah Chen',
      content: 'Updated the decision tree logic. Please review.',
      timestamp: '1 day ago',
      nodeId: 'decision',
      replies: [
        {
          id: 31,
          author: 'Mike Johnson',
          content: 'Looks good! The flow is much clearer now.',
          timestamp: '1 day ago'
        }
      ],
      resolved: true
    }
  ]);

  const [activities] = useState([
    {
      id: 1,
      type: 'edit',
      user: 'Mike Johnson',
      action: 'updated the Menu Options node',
      timestamp: '15 minutes ago',
      details: 'Changed timeout from 10s to 8s'
    },
    {
      id: 2,
      type: 'comment',
      user: 'Lisa Wang',
      action: 'added a comment on Transfer node',
      timestamp: '2 hours ago'
    },
    {
      id: 3,
      type: 'share',
      user: 'Sarah Chen',
      action: 'shared the flow with Product Team',
      timestamp: '3 hours ago'
    },
    {
      id: 4,
      type: 'join',
      user: 'David Rodriguez',
      action: 'joined the collaboration',
      timestamp: '1 day ago'
    }
  ]);

  const [shareSettings] = useState({
    publicLink: 'https://vocilio.com/flows/abc123-def456',
    linkAccess: 'team',
    allowComments: true,
    allowCopy: false,
    expiryDate: '2024-02-15'
  });

  const handleInvite = (email, role) => {
    // Handle team member invitation
    console.log('Inviting:', email, 'with role:', role);
    setShowInviteModal(false);
  };

  const handleShare = (settings) => {
    // Handle sharing settings update
    console.log('Updated sharing settings:', settings);
    setShowShareModal(false);
  };

  const addComment = () => {
    if (newComment.trim()) {
      // Add comment logic
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const TeamMemberRow = ({ member }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg ${
      isDarkMode ? 'bg-gray-800/30 hover:bg-gray-800/50' : 'bg-gray-50 hover:bg-gray-100'
    } transition-colors`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
            isDarkMode ? 'border-gray-800' : 'border-white'
          } ${
            member.status === 'online' ? 'bg-green-500' :
            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
          }`} />
        </div>
        <div>
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {member.name}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {member.email}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`text-sm px-2 py-1 rounded-full ${
          member.role === 'Owner' 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : member.role === 'Editor'
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {member.role}
        </span>
        <button className={`p-1 rounded ${
          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
        }`}>
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );

  const CommentItem = ({ comment }) => (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'
    } ${comment.resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <span className={`text-xs font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-700'
            }`}>
              {comment.author.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className={`font-medium text-sm ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {comment.author}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {comment.timestamp} • Node: {comment.nodeId}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {comment.resolved ? (
            <CheckCircle size={16} className="text-green-500" />
          ) : (
            <Circle size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
          )}
          <button className={`p-1 rounded ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}>
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {comment.content}
      </p>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 space-y-3 border-l-2 border-gray-300 pl-4">
          {comment.replies.map(reply => (
            <div key={reply.id} className="flex items-start space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <span className={`text-xs font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}>
                  {reply.author.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className={`font-medium text-sm ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {reply.author} <span className={`font-normal text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {reply.timestamp}
                  </span>
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-3 p-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        activity.type === 'edit' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
        activity.type === 'comment' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
        activity.type === 'share' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
      }`}>
        {activity.type === 'edit' && <Edit3 size={16} />}
        {activity.type === 'comment' && <MessageSquare size={16} />}
        {activity.type === 'share' && <Share2 size={16} />}
        {activity.type === 'join' && <UserPlus size={16} />}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <span className="font-medium">{activity.user}</span> {activity.action}
        </p>
        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {activity.timestamp}
          {activity.details && (
            <span className="ml-2 text-blue-500">• {activity.details}</span>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`h-full flex flex-col ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <Users size={24} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Collaboration Hub</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Team collaboration and sharing
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>Invite</span>
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            } transition-colors flex items-center space-x-2`}
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {[
          { id: 'team', label: 'Team Members', icon: Users },
          { id: 'comments', label: 'Comments', icon: MessageSquare },
          { id: 'activity', label: 'Activity', icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-500'
                : `border-transparent ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                  }`
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'team' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Team Members ({teamMembers.length})</h3>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                } flex items-center space-x-2`}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className={`bg-transparent text-sm focus:outline-none ${
                      isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {teamMembers.map(member => (
                <TeamMemberRow key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="p-6">
            <div className="mb-6">
              <div className={`flex space-x-3 p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <span className={`text-xs font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-700'
                  }`}>
                    SC
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className={`w-full p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" id="notify" className="rounded" />
                      <label htmlFor="notify" className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Notify team members
                      </label>
                    </div>
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Send size={16} />
                      <span>Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <select className={`px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                <option value="all">All Activity</option>
                <option value="edits">Edits Only</option>
                <option value="comments">Comments Only</option>
                <option value="shares">Shares Only</option>
              </select>
            </div>
            <div className="space-y-1">
              {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address..."
                  className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Role
                </label>
                <select className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}>
                  <option value="viewer">Viewer - Can view only</option>
                  <option value="editor">Editor - Can edit and comment</option>
                  <option value="admin">Admin - Full permissions</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleInvite('', 'viewer')}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-full max-w-lg p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Share Flow</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Share Link
                </label>
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                }`}>
                  <input
                    type="text"
                    value={shareSettings.publicLink}
                    readOnly
                    className={`flex-1 bg-transparent text-sm focus:outline-none ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  />
                  <button className={`p-2 rounded ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  }`}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Access Level
                  </label>
                  <select className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    <option value="team">Team Only</option>
                    <option value="company">Company</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Expires
                  </label>
                  <input
                    type="date"
                    value={shareSettings.expiryDate}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Allow Comments
                  </span>
                  <input type="checkbox" checked={shareSettings.allowComments} className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Allow Copying
                  </span>
                  <input type="checkbox" checked={shareSettings.allowCopy} className="rounded" />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleShare(shareSettings)}
                  className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Update Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;
