import React, { useState, useCallback } from 'react';
import { 
  MessageCircle, Send, Phone, User, Clock, Check, CheckCheck,
  AlertCircle, Image, Paperclip, Smile, Settings, Plus, Search
} from 'lucide-react';

// ===== COPILOT PROMPT #3: SMS Channel Panel =====
const SMSChannelPanel = ({ isActive, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi, I have a question about my delivery.",
      sender: 'customer',
      timestamp: new Date(Date.now() - 10 * 60000),
      status: 'delivered',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      text: "Hello! I'd be happy to help. What's your order number?",
      sender: 'agent',
      timestamp: new Date(Date.now() - 8 * 60000),
      status: 'read'
    },
    {
      id: 3,
      text: "It's #ORD-12345. Expected delivery was today but I haven't received it yet.",
      sender: 'customer',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'delivered',
      phone: '+1 (555) 123-4567'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState('+1 (555) 123-4567');
  
  const contacts = [
    { phone: '+1 (555) 123-4567', name: 'Sarah Johnson', lastMessage: '2 min ago' },
    { phone: '+1 (555) 987-6543', name: 'Michael Chen', lastMessage: '15 min ago' },
    { phone: '+1 (555) 246-8135', name: 'Emma Wilson', lastMessage: '1 hour ago' }
  ];

  // Mock session data
  const sessions = [];

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: 'agent',
        timestamp: new Date(),
        status: 'sending'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate delivery
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'delivered' } 
              : msg
          )
        );
      }, 1000);

      console.log('📱 SMS: Message sent');
    }
  }, [newMessage]);

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <Check className="w-3 h-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg h-full flex">
      {/* Contacts Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SMS</h3>
              <p className="text-sm text-gray-600">{contacts.length} active chats</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact.phone}
              onClick={() => setSelectedContact(contact.phone)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 ${
                selectedContact === contact.phone ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                  <p className="text-sm text-gray-600 truncate">{contact.phone}</p>
                  <p className="text-xs text-gray-500">{contact.lastMessage}</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </button>
          ))}
        </div>

        {/* New Contact Button */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-600">{selectedContact}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                message.sender === 'agent' 
                  ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg' 
                  : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
              } px-4 py-2`}>
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center justify-between mt-1 text-xs ${
                  message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.sender === 'agent' && (
                    <span className="ml-2">{getStatusIcon(message.status)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <Image className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your SMS message..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength="160"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {newMessage.length}/160
              </div>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <Smile className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-2 rounded ${
                newMessage.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSChannelPanel;
