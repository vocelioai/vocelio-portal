import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Send, Paperclip, Smile, MoreHorizontal, Search,
  User, Clock, Check, CheckCheck, AlertCircle, Image, File,
  Mic, Camera, Phone, Video, Settings, X, Plus, Hash
} from 'lucide-react';

// ===== COPILOT PROMPT #3: Chat Channel Panel =====
const ChatChannelPanel = ({ isActive, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I need help with my recent order.",
      sender: 'customer',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'delivered',
      type: 'text'
    },
    {
      id: 2,
      text: "Hello! I'd be happy to help you with your order. Could you please provide your order number?",
      sender: 'agent',
      timestamp: new Date(Date.now() - 4 * 60000),
      status: 'read',
      type: 'text'
    },
    {
      id: 3,
      text: "Sure, it's #ORD-12345",
      sender: 'customer',
      timestamp: new Date(Date.now() - 3 * 60000),
      status: 'delivered',
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('webchat');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatStatus, setChatStatus] = useState('active'); // active, waiting, transferred
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    location: 'New York, NY',
    sessionTime: '00:08:45'
  });

  // Mock session data
  const sessions = [];
  const sessionOps = {
    createSession: () => Promise.resolve(),
    updateSession: () => Promise.resolve()
  };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    
    // Show typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // Clear previous timeout
    clearTimeout(typingTimeoutRef.current);
    
    // Set new timeout to hide typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, [isTyping]);

  // Send message
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
      setIsTyping(false);
      
      // Simulate message delivery
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'delivered' } 
              : msg
          )
        );
      }, 1000);

      // Simulate customer response (for demo)
      setTimeout(() => {
        const customerResponse = {
          id: Date.now() + 1,
          text: "Thank you for your help!",
          sender: 'customer',
          timestamp: new Date(),
          status: 'delivered',
          type: 'text'
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 3000);
      
      console.log('💬 Chat: Message sent');
    }
  }, [newMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get message status icon
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

  // Emoji picker (simplified)
  const emojis = ['😊', '👍', '👎', '❤️', '😢', '😂', '🎉', '🤔'];

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${
                chatStatus === 'active' ? 'bg-green-500' :
                chatStatus === 'waiting' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              <span className="capitalize">{chatStatus}</span>
              <span>•</span>
              <span>{customerInfo.sessionTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Channel Selector */}
          <select 
            value={selectedChannel} 
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="webchat">Web Chat</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="messenger">Messenger</option>
            <option value="telegram">Telegram</option>
          </select>
          
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Info Bar */}
      <div className="bg-blue-50 p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{customerInfo.name}</p>
              <p className="text-xs text-gray-600">{customerInfo.email} • {customerInfo.location}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg px-4 py-2 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
          <div className="grid grid-cols-4 gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setNewMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                  inputRef.current?.focus();
                }}
                className="text-xl hover:bg-gray-100 rounded p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Responses */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            "Thank you for contacting us!",
            "I'll look into that for you.",
            "Is there anything else I can help with?",
            "Let me transfer you to a specialist."
          ].map((response, index) => (
            <button
              key={index}
              onClick={() => setNewMessage(response)}
              className="whitespace-nowrap text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200"
            >
              {response}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              <Image className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
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

      {/* Chat Actions Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Transfer Chat
            </button>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              Resolve
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatChannelPanel;
