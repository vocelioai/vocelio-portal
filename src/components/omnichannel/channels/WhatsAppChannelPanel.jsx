import React, { useState, useCallback } from 'react';
import { 
  MessageCircle, Send, Phone, User, Clock, Check, CheckCheck,
  Image, Paperclip, Smile, Settings, Plus, Search, Camera,
  Mic, File, MapPin, Star, MoreHorizontal, Volume2
} from 'lucide-react';

// ===== COPILOT PROMPT #3: WhatsApp Channel Panel =====
const WhatsAppChannelPanel = ({ isActive, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I saw your products online and I'm interested in making a bulk order. 🛒",
      sender: 'customer',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'delivered',
      type: 'text',
      customerName: 'Sarah Johnson',
      customerPhone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      text: "Hi Sarah! Thank you for your interest. I'd be happy to help you with a bulk order. What products are you looking at? 😊",
      sender: 'agent',
      timestamp: new Date(Date.now() - 12 * 60000),
      status: 'read',
      type: 'text'
    },
    {
      id: 3,
      text: "I need about 50 units of your premium headphones. Do you offer business discounts?",
      sender: 'customer',
      timestamp: new Date(Date.now() - 8 * 60000),
      status: 'delivered',
      type: 'text'
    },
    {
      id: 4,
      type: 'image',
      imageUrl: 'https://via.placeholder.com/300x200?text=Product+Image',
      caption: 'These are the ones I am interested in',
      sender: 'customer',
      timestamp: new Date(Date.now() - 7 * 60000),
      status: 'delivered'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState('+1 (555) 123-4567');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const contacts = [
    { 
      phone: '+1 (555) 123-4567', 
      name: 'Sarah Johnson', 
      lastMessage: 'These are the ones I am interested in', 
      lastMessageTime: '2 min ago',
      unread: 2,
      online: true,
      profilePic: null
    },
    { 
      phone: '+1 (555) 987-6543', 
      name: 'Michael Chen', 
      lastMessage: 'Thank you for the quick response!', 
      lastMessageTime: '45 min ago',
      unread: 0,
      online: false,
      profilePic: null
    },
    { 
      phone: '+1 (555) 246-8135', 
      name: 'Emma Wilson', 
      lastMessage: 'When will my order ship?', 
      lastMessageTime: '2 hours ago',
      unread: 1,
      online: true,
      profilePic: null
    }
  ];

  // WhatsApp emojis
  const whatsappEmojis = ['😊', '😂', '❤️', '🔥', '👍', '👎', '😢', '😮', '😡', '🎉', '💪', '🙏'];

  // Mock session data
  const sessions = [];

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: 'agent',
        timestamp: new Date(),
        status: 'sending',
        type: 'text'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setShowEmojiPicker(false);
      
      // Simulate WhatsApp delivery status progression
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'delivered' } 
              : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'read' } 
              : msg
          )
        );
      }, 3000);

      console.log('💬 WhatsApp: Message sent');
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
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  const selectedContactInfo = contacts.find(c => c.phone === selectedContact);

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg h-full flex">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 bg-green-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">WhatsApp Business</h3>
              <p className="text-sm text-green-100">{contacts.reduce((sum, c) => sum + c.unread, 0)} unread messages</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-transparent rounded-lg text-sm placeholder-green-200 text-white focus:outline-none focus:bg-white focus:text-gray-900"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <button
              key={contact.phone}
              onClick={() => setSelectedContact(contact.phone)}
              className={`w-full p-4 text-left border-b border-gray-200 hover:bg-white transition-colors ${
                selectedContact === contact.phone ? 'bg-white shadow-sm' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  {contact.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                    <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {contact.unread}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* New Chat Button */}
        <div className="p-4 bg-white border-t border-gray-200">
          <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                {selectedContactInfo?.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedContactInfo?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedContactInfo?.online ? 'online' : `last seen ${selectedContactInfo?.lastMessageTime}`}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='whatsapp-bg' width='100' height='100' patternUnits='userSpaceOnUse'%3e%3cpath d='M0 100L100 0' stroke='%23e5e7eb' stroke-width='0.5' opacity='0.1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23whatsapp-bg)'/%3e%3c/svg%3e")`,
          backgroundColor: '#f0f2f5'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md relative ${
                message.sender === 'agent' 
                  ? 'bg-green-500 text-white rounded-l-lg rounded-tr-lg' 
                  : 'bg-white text-gray-900 rounded-r-lg rounded-tl-lg shadow-sm'
              } px-3 py-2`}>
                {message.type === 'text' ? (
                  <p className="text-sm">{message.text}</p>
                ) : message.type === 'image' ? (
                  <div>
                    <img 
                      src={message.imageUrl} 
                      alt="Shared image"
                      className="rounded-lg mb-2 max-w-full"
                    />
                    {message.caption && (
                      <p className="text-sm">{message.caption}</p>
                    )}
                  </div>
                ) : null}
                
                <div className={`flex items-center justify-between mt-1 text-xs ${
                  message.sender === 'agent' ? 'text-green-100' : 'text-gray-500'
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

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
            <div className="grid grid-cols-6 gap-2">
              {whatsappEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:bg-gray-100 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-end space-x-3">
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 relative bg-white rounded-3xl border border-gray-300 focus-within:border-green-500">
              <div className="flex items-end">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message"
                  className="flex-1 resize-none border-0 rounded-l-3xl px-4 py-3 focus:outline-none focus:ring-0 max-h-32"
                  rows="1"
                />
                <div className="flex items-center space-x-1 pr-2">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full">
              <Camera className="w-5 h-5" />
            </button>
            
            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full">
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChannelPanel;
