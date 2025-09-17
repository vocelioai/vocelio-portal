import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Send,
  Paperclip,
  Phone,
  Mail,
  Calendar,
  Tag,
  Star,
  MoreVertical
} from 'lucide-react';

const SupportTicketSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock ticket data
  const mockTickets = [
    {
      ticket_id: 'VOC-001',
      title: 'Unable to make outbound calls',
      description: 'Getting error message when trying to call customers from the dialer',
      status: 'open',
      priority: 'high',
      category: 'technical',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T14:45:00Z',
      customer_name: 'John Smith',
      customer_email: 'john.smith@example.com',
      assigned_agent: 'Sarah Wilson',
      messages: [
        {
          id: 1,
          sender: 'customer',
          content: 'Getting error message when trying to call customers from the dialer',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          sender: 'agent',
          content: 'Thank you for reporting this issue. Can you please tell me which browser you\'re using?',
          timestamp: '2024-01-15T11:15:00Z'
        },
        {
          id: 3,
          sender: 'customer',
          content: 'I\'m using Chrome version 120.0.6099.71',
          timestamp: '2024-01-15T11:20:00Z'
        }
      ]
    },
    {
      ticket_id: 'VOC-002',
      title: 'Billing question about overage charges',
      description: 'Need clarification on why I was charged extra this month',
      status: 'in_progress',
      priority: 'medium',
      category: 'billing',
      created_at: '2024-01-14T09:15:00Z',
      updated_at: '2024-01-15T16:20:00Z',
      customer_name: 'Emma Davis',
      customer_email: 'emma.davis@company.com',
      assigned_agent: 'Mike Johnson',
      messages: [
        {
          id: 1,
          sender: 'customer',
          content: 'Need clarification on why I was charged extra this month',
          timestamp: '2024-01-14T09:15:00Z'
        },
        {
          id: 2,
          sender: 'agent',
          content: 'I\'ll review your account and get back to you with details about the charges.',
          timestamp: '2024-01-14T10:30:00Z'
        }
      ]
    },
    {
      ticket_id: 'VOC-003',
      title: 'Feature request: Call recording download',
      description: 'Would like to be able to download call recordings in MP3 format',
      status: 'resolved',
      priority: 'low',
      category: 'feature_request',
      created_at: '2024-01-10T14:20:00Z',
      updated_at: '2024-01-13T11:45:00Z',
      customer_name: 'Alex Chen',
      customer_email: 'alex.chen@startup.io',
      assigned_agent: 'Lisa Brown',
      messages: [
        {
          id: 1,
          sender: 'customer',
          content: 'Would like to be able to download call recordings in MP3 format',
          timestamp: '2024-01-10T14:20:00Z'
        },
        {
          id: 2,
          sender: 'agent',
          content: 'Great suggestion! This feature is now available in your dashboard under Call History.',
          timestamp: '2024-01-13T11:45:00Z'
        }
      ]
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      urgent: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'billing':
        return <Star className="w-4 h-4 text-green-500" />;
      case 'feature_request':
        return <Tag className="w-4 h-4 text-purple-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const CreateTicketForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      priority: 'medium',
      category: 'technical'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newTicket = {
        ticket_id: `VOC-${String(tickets.length + 1).padStart(3, '0')}`,
        ...formData,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer_name: 'Current User',
        customer_email: 'user@example.com',
        assigned_agent: null,
        messages: [
          {
            id: 1,
            sender: 'customer',
            content: formData.description,
            timestamp: new Date().toISOString()
          }
        ]
      };

      setTickets([newTicket, ...tickets]);
      setShowCreateForm(false);
      setFormData({ title: '', description: '', priority: 'medium', category: 'technical' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Create Ticket
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
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

  const TicketDetail = ({ ticket }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

      const updatedTicket = {
        ...ticket,
        messages: [
          ...ticket.messages,
          {
            id: ticket.messages.length + 1,
            sender: 'customer',
            content: newMessage,
            timestamp: new Date().toISOString()
          }
        ],
        updated_at: new Date().toISOString()
      };

      const updatedTickets = tickets.map(t => 
        t.ticket_id === ticket.ticket_id ? updatedTicket : t
      );
      setTickets(updatedTickets);
      setSelectedTicket(updatedTicket);
      setNewMessage('');
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{ticket.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Ticket #{ticket.ticket_id}</p>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
            <div className="flex items-center text-sm text-gray-600">
              {getCategoryIcon(ticket.category)}
              <span className="ml-1 capitalize">{ticket.category.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-medium">
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Updated:</span>
              <span className="ml-2 font-medium">
                {new Date(ticket.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Customer:</span>
              <span className="ml-2 font-medium">{ticket.customer_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Agent:</span>
              <span className="ml-2 font-medium">{ticket.assigned_agent || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'customer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (selectedTicket) {
    return <TicketDetail ticket={selectedTicket} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-600">Manage and track customer support requests</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'open').length}
              </p>
              <p className="text-sm text-gray-600">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Ticket className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Clock className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                      Loading tickets...
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{ticket.ticket_id}
                        </div>
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {ticket.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.customer_name}</div>
                      <div className="text-sm text-gray-500">{ticket.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(ticket.status)}
                        <span className="ml-2 text-sm">{getStatusBadge(ticket.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateForm && <CreateTicketForm />}
    </div>
  );
};

export default SupportTicketSystem;