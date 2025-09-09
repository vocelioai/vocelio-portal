import React, { useState, useRef, useCallback } from 'react';
import { 
  Mail, Send, Paperclip, Image, Bold, Italic, Underline, 
  List, Link, Smile, Save, Eye, Users, Clock, Tag,
  ChevronDown, X, Plus, FileText, Archive, Star, Reply
} from 'lucide-react';

// ===== COPILOT PROMPT #3: Email Channel Panel =====
const EmailChannelPanel = ({ isActive, onClose }) => {
  const [emailMode, setEmailMode] = useState('compose'); // compose, inbox, templates
  const [currentEmail, setCurrentEmail] = useState({
    to: 'sarah.johnson@email.com',
    cc: '',
    bcc: '',
    subject: 'Re: Your Recent Order Inquiry',
    body: '',
    priority: 'normal',
    template: null,
    attachments: []
  });

  const [emails, setEmails] = useState([
    {
      id: 1,
      from: 'sarah.johnson@email.com',
      subject: 'Help with my recent order',
      body: 'I need assistance with order #ORD-12345. The delivery date has changed.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      starred: false,
      priority: 'normal'
    },
    {
      id: 2,
      from: 'michael.chen@company.com',
      subject: 'Product inquiry - Enterprise plan',
      body: 'Could you provide more information about your enterprise features?',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      starred: true,
      priority: 'high'
    }
  ]);

  const [templates] = useState([
    {
      id: 1,
      name: 'Order Status Update',
      subject: 'Update on your order #{order_number}',
      body: `Dear {customer_name},\n\nI hope this email finds you well. I wanted to provide you with an update regarding your recent order #{order_number}.\n\n{order_details}\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\n{agent_name}`
    },
    {
      id: 2,
      name: 'Welcome Email',
      subject: 'Welcome to {company_name}!',
      body: `Hello {customer_name},\n\nWelcome to {company_name}! We're excited to have you on board.\n\n{welcome_details}\n\nThank you for choosing us.\n\nWarm regards,\n{agent_name}`
    }
  ]);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const fileInputRef = useRef(null);

  // Mock session data
  const sessions = [];

  // Handle template selection
  const handleTemplateSelect = useCallback((template) => {
    setCurrentEmail(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body,
      template: template.id
    }));
    setShowTemplates(false);
    console.log('📧 Email: Template applied -', template.name);
  }, []);

  // Handle email send
  const handleSendEmail = useCallback(() => {
    if (currentEmail.to && currentEmail.subject && currentEmail.body) {
      console.log('📧 Email: Sending email', currentEmail);
      
      // Simulate sending
      const newEmail = {
        id: Date.now(),
        from: 'agent@company.com',
        to: currentEmail.to,
        subject: currentEmail.subject,
        body: currentEmail.body,
        timestamp: new Date(),
        sent: true,
        priority: currentEmail.priority
      };

      // Reset form
      setCurrentEmail({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        priority: 'normal',
        template: null,
        attachments: []
      });

      alert('Email sent successfully!');
    }
  }, [currentEmail]);

  // Handle file attachment
  const handleFileAttach = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    setCurrentEmail(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    console.log('📧 Email: Files attached -', files.length);
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((index) => {
    setCurrentEmail(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    return timestamp.toLocaleDateString();
  };

  // Text formatting handlers
  const formatText = (command) => {
    document.execCommand(command, false, null);
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Channel</h3>
            <p className="text-sm text-gray-600">{emails.filter(e => !e.read).length} unread messages</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {/* Mode Selector */}
          <select 
            value={emailMode} 
            onChange={(e) => setEmailMode(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="compose">Compose</option>
            <option value="inbox">Inbox</option>
            <option value="templates">Templates</option>
          </select>
        </div>
      </div>

      {/* Email Compose Mode */}
      {emailMode === 'compose' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Recipients */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 w-12">To:</label>
              <input
                type="email"
                value={currentEmail.to}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, to: e.target.value }))}
                className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="recipient@email.com"
              />
              <select
                value={currentEmail.priority}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, priority: e.target.value }))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 w-12">CC:</label>
              <input
                type="email"
                value={currentEmail.cc}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, cc: e.target.value }))}
                className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cc@email.com (optional)"
              />
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 w-12">Subject:</label>
              <input
                type="text"
                value={currentEmail.subject}
                onChange={(e) => setCurrentEmail(prev => ({ ...prev, subject: e.target.value }))}
                className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
              />
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Templates
              </button>
            </div>
          </div>

          {/* Template Selector */}
          {showTemplates && (
            <div className="p-4 bg-blue-50 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Email Templates</p>
              <div className="grid gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formatting Toolbar */}
          <div className="p-3 border-b border-gray-100 flex items-center space-x-2">
            <button
              onClick={() => formatText('bold')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('createLink')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>

          {/* Email Body */}
          <div className="flex-1 p-4">
            <textarea
              value={currentEmail.body}
              onChange={(e) => setCurrentEmail(prev => ({ ...prev, body: e.target.value }))}
              className="w-full h-full resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your email message here..."
            />
          </div>

          {/* Attachments */}
          {currentEmail.attachments.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
              <div className="space-y-2">
                {currentEmail.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({Math.round(file.size / 1024)}KB)</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={handleFileAttach}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                <Image className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-2">
              <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Save Draft
              </button>
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Inbox Mode */}
      {emailMode === 'inbox' && (
        <div className="flex-1 overflow-y-auto">
          {emails.map((email) => (
            <div key={email.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              !email.read ? 'bg-blue-50' : ''
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <p className={`font-medium ${!email.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {email.from}
                    </p>
                    {email.priority === 'high' && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">High</span>
                    )}
                    {email.starred && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className={`text-sm ${!email.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {email.subject}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {email.body}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{formatTimestamp(email.timestamp)}</p>
                  <div className="flex space-x-1 mt-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Reply className="w-3 h-3" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-yellow-600">
                      <Star className="w-3 h-3" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Archive className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default EmailChannelPanel;
