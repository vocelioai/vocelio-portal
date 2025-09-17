import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  X,
  Minimize2,
  Maximize2,
  User,
  Clock,
  CheckCircle,
  Circle,
  Search,
  Filter,
  Star,
  Archive,
  Settings,
  UserPlus,
  Volume2,
  VolumeX,
  Image,
  FileText,
  Download
} from 'lucide-react';

const LiveChatSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatStatus, setChatStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [currentAgent, setCurrentAgent] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  // Mock agent data
  const mockAgent = {
    id: 1,
    name: 'Sarah Wilson',
    avatar: null,
    status: 'online',
    department: 'Technical Support',
    responseTime: '< 2 minutes'
  };

  // Mock chat history
  const mockChatHistory = [
    {
      id: 1,
      subject: 'Call Quality Issues',
      date: '2024-01-15',
      status: 'resolved',
      agent: 'Sarah Wilson',
      lastMessage: 'Problem resolved! Your call quality should be much better now.',
      unread: 0
    },
    {
      id: 2,
      subject: 'Billing Question',
      date: '2024-01-10',
      status: 'closed',
      agent: 'Mike Johnson',
      lastMessage: 'Thank you for contacting us. Your billing issue has been resolved.',
      unread: 0
    }
  ];

  useEffect(() => {
    setChatHistory(mockChatHistory);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const connectToSupport = async () => {
    setChatStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setChatStatus('connected');
      setCurrentAgent(mockAgent);
      
      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        text: `Hi! I'm ${mockAgent.name} from ${mockAgent.department}. How can I help you today?`,
        sender: 'agent',
        timestamp: new Date(),
        agent: mockAgent
      };
      
      setMessages([welcomeMessage]);
    }, 2000);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || chatStatus !== 'connected') return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      const agentResponse = {
        id: Date.now() + 1,
        text: generateAgentResponse(newMessage),
        sender: 'agent',
        timestamp: new Date(),
        agent: currentAgent
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1500 + Math.random() * 2000);
  };

  const generateAgentResponse = (userMessage) => {
    const responses = [
      "I understand your concern. Let me help you with that right away.",
      "Thank you for providing that information. I'm looking into this for you.",
      "That's a great question! Let me check our system and get back to you.",
      "I can definitely help you resolve this issue. One moment please.",
      "I see what's happening. Let me walk you through the solution step by step.",
      "Thank you for your patience. I have the information you need."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const ChatWindow = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          {currentAgent ? (
            <>
              <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-800 font-medium text-sm">
                  {currentAgent.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{currentAgent.name}</h3>
                <p className="text-xs text-blue-100">{currentAgent.department}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <MessageCircle className="w-6 h-6 mr-2" />
              <span>Support Chat</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {chatStatus === 'connected' && (
            <>
              <button className="p-1 hover:bg-blue-500 rounded">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-blue-500 rounded">
                <Video className="w-4 h-4" />
              </button>
            </>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-500 rounded"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-500 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Status */}
          {chatStatus !== 'connected' && (
            <div className="p-4 bg-gray-50 border-b">
              {chatStatus === 'disconnected' && (
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect with our support team for instant assistance
                  </p>
                  <button
                    onClick={connectToSupport}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start Chat
                  </button>
                </div>
              )}
              
              {chatStatus === 'connecting' && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Connecting you to an agent...</p>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {chatStatus === 'connected' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    {message.sender === 'agent' && message.agent && (
                      <div className="flex items-center mb-1">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-blue-600 text-xs font-medium">
                            {message.agent.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {message.agent.name}
                        </span>
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Message Input */}
          {chatStatus === 'connected' && (
            <div className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const ChatHistory = () => (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {chatHistory.map((chat) => (
          <div key={chat.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{chat.subject}</h4>
                <p className="text-sm text-gray-600 mt-1">{chat.lastMessage}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>{chat.date}</span>
                  <span className="mx-2">•</span>
                  <span>{chat.agent}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  chat.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  chat.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {chat.status}
                </span>
                {chat.unread > 0 && (
                  <span className="bg-red-500 text-white rounded-full text-xs px-2 py-1 mt-1">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg relative"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('chat')}
                className={`text-sm font-medium ${
                  activeTab === 'chat' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Live Chat
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`text-sm font-medium ${
                  activeTab === 'history' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? <ChatWindow /> : <ChatHistory />}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatSystem;