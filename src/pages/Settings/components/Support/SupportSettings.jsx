import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  MessageSquare,
  BookOpen,
  Phone,
  Mail,
  ExternalLink,
  Search,
  Star,
  Lightbulb,
  FileText,
  Video,
  Users,
  Clock,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import SupportTicketSystem from '../../../../components/support/SupportTicketSystem';

const SupportSettings = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supportTabs = [
    { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'contact', label: 'Contact Support', icon: Phone },
    { id: 'resources', label: 'Resources', icon: FileText }
  ];

  const knowledgeBaseArticles = [
    {
      id: 1,
      title: 'Getting Started with Vocilio AI Dashboard',
      category: 'Getting Started',
      views: 1542,
      helpful: 89,
      description: 'Complete guide to setting up your account and making your first call',
      lastUpdated: '2024-01-15',
      tags: ['setup', 'beginner', 'tutorial']
    },
    {
      id: 2,
      title: 'How to Create and Manage Campaigns',
      category: 'Campaigns',
      views: 987,
      helpful: 76,
      description: 'Step-by-step instructions for creating effective calling campaigns',
      lastUpdated: '2024-01-12',
      tags: ['campaigns', 'management', 'best-practices']
    },
    {
      id: 3,
      title: 'Troubleshooting Call Quality Issues',
      category: 'Technical',
      views: 1234,
      helpful: 92,
      description: 'Common solutions for audio quality and connection problems',
      lastUpdated: '2024-01-10',
      tags: ['troubleshooting', 'audio', 'technical']
    },
    {
      id: 4,
      title: 'Understanding Your Billing and Usage',
      category: 'Billing',
      views: 756,
      helpful: 84,
      description: 'Complete breakdown of billing cycles, usage tracking, and payment methods',
      lastUpdated: '2024-01-08',
      tags: ['billing', 'payments', 'usage']
    },
    {
      id: 5,
      title: 'API Integration Guide',
      category: 'Developers',
      views: 432,
      helpful: 95,
      description: 'Technical documentation for integrating with Vocilio APIs',
      lastUpdated: '2024-01-05',
      tags: ['api', 'integration', 'developers']
    }
  ];

  const supportResources = [
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      link: '#',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: Users,
      link: '#',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'API Documentation',
      description: 'Technical integration guides',
      icon: FileText,
      link: '#',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Best Practices Guide',
      description: 'Tips for optimal performance',
      icon: Lightbulb,
      link: '#',
      color: 'bg-yellow-100 text-yellow-600'
    }
  ];

  const KnowledgeBase = () => {
    const filteredArticles = knowledgeBaseArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Getting Started', 'Campaigns', 'Technical', 'Billing'].map((category) => (
            <div key={category} className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium text-gray-900">{category}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {knowledgeBaseArticles.filter(a => a.category === category).length} articles
              </p>
            </div>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {searchTerm ? 'Search Results' : 'Popular Articles'}
          </h3>
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Updated {new Date(article.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                    {article.title}
                  </h4>
                  <p className="text-gray-600 mb-3">{article.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.views.toLocaleString()} views
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {article.helpful}% helpful
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ContactSupport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Methods */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <MessageSquare className="w-8 h-8 text-blue-500 mr-4" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Live Chat</h4>
                <p className="text-sm text-gray-600">Available 24/7 for immediate assistance</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Start Chat
              </button>
            </div>
            
            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Mail className="w-8 h-8 text-green-500 mr-4" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Email Support</h4>
                <p className="text-sm text-gray-600">support@vocelio.ai • Response within 2 hours</p>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                Send Email
              </button>
            </div>
            
            <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Phone className="w-8 h-8 text-purple-500 mr-4" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Phone Support</h4>
                <p className="text-sm text-gray-600">+1 (555) 123-4567 • Mon-Fri 9AM-6PM EST</p>
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                Call Now
              </button>
            </div>
          </div>
        </div>

        {/* Support Hours & SLA */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Information</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">24/7 Support Available</h4>
                <p className="text-sm text-gray-600">We're here to help around the clock</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Response Times</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Critical Issues:</span>
                  <span className="font-medium">15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">General Support:</span>
                  <span className="font-medium">2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Feature Requests:</span>
                  <span className="font-medium">24 hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Emergency Contact</h4>
              <p className="text-sm text-gray-600">
                For critical system outages, call our emergency line:
              </p>
              <p className="font-mono text-lg text-red-600">+1 (555) 911-HELP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Download className="w-6 h-6 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Download Logs</h4>
            <p className="text-sm text-gray-600">Get system logs for troubleshooting</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <RefreshCw className="w-6 h-6 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">System Status</h4>
            <p className="text-sm text-gray-600">Check current system health</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Clock className="w-6 h-6 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">Schedule Call</h4>
            <p className="text-sm text-gray-600">Book a call with our team</p>
          </button>
        </div>
      </div>
    </div>
  );

  const Resources = () => (
    <div className="space-y-6">
      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportResources.map((resource, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${resource.color}`}>
                <resource.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </div>
            </div>
            <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center">
              <span>Access Resource</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        ))}
      </div>

      {/* Documentation Links */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <FileText className="w-5 h-5 text-blue-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">API Reference</h4>
              <p className="text-sm text-gray-600">Complete API documentation</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
          
          <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <BookOpen className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">User Guide</h4>
              <p className="text-sm text-gray-600">Step-by-step instructions</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
          
          <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Best Practices</h4>
              <p className="text-sm text-gray-600">Tips and recommendations</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
          
          <a href="#" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Video className="w-5 h-5 text-purple-500 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900">Video Tutorials</h4>
              <p className="text-sm text-gray-600">Visual learning resources</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tickets':
        return <SupportTicketSystem />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'contact':
        return <ContactSupport />;
      case 'resources':
        return <Resources />;
      default:
        return <SupportTicketSystem />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>
        <p className="text-gray-600 mt-2">Get the help you need with our comprehensive support system</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {supportTabs.map((tab) => (
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
    </div>
  );
};

export default SupportSettings;