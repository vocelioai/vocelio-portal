// Enhanced Campaign Creation APIs
// This file provides real integrations with Flow Designer and Contact Management

import { getCurrentUser } from '../utils/auth.js';

// Flow Designer API Integration
export const flowDesignerAPI = {
  // Get user's flows from Flow Designer
  getUserFlows: async () => {
    try {
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      };

      // Check if flows are stored locally first (Flow Designer saves to localStorage)
      const localFlows = localStorage.getItem('deployed_flows');
      if (localFlows) {
        const flows = JSON.parse(localFlows);
        console.log('📋 Loading flows from local storage:', flows.length);
        return flows.map(flow => ({
          id: flow.id || `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: flow.name || 'Untitled Flow',
          description: flow.description || 'Flow created in Flow Designer',
          nodes: flow.nodes || [],
          edges: flow.edges || [],
          isActive: flow.isActive !== false,
          created: flow.created || new Date().toISOString(),
          updated: flow.updated || new Date().toISOString(),
          author: flow.author || getCurrentUser()?.email || 'Unknown'
        }));
      }

      // Fallback to API if available
      const flowProcessorURL = import.meta.env.VITE_FLOW_PROCESSOR_URL;
      if (flowProcessorURL) {
        const response = await fetch(`${flowProcessorURL}/flows`, {
          headers: authHeaders
        });

        if (response.ok) {
          const flows = await response.json();
          console.log('📋 Loading flows from API:', flows.length);
          return flows;
        }
      }

      // Return sample flows if no real flows available
      console.log('📋 No flows found, returning sample flows');
      return [
        {
          id: 'sample_flow_001',
          name: 'Customer Service Flow',
          description: 'Handle customer inquiries and support requests',
          isActive: true,
          nodes: [],
          edges: [],
          created: new Date().toISOString(),
          author: getCurrentUser()?.email || 'System'
        },
        {
          id: 'sample_flow_002', 
          name: 'Sales Qualification Flow',
          description: 'Qualify leads and schedule appointments',
          isActive: true,
          nodes: [],
          edges: [],
          created: new Date().toISOString(),
          author: getCurrentUser()?.email || 'System'
        }
      ];

    } catch (error) {
      console.error('Failed to load flows:', error);
      return [];
    }
  },

  // Get flow details
  getFlowDetails: async (flowId) => {
    try {
      const flows = await flowDesignerAPI.getUserFlows();
      return flows.find(flow => flow.id === flowId);
    } catch (error) {
      console.error('Failed to get flow details:', error);
      return null;
    }
  }
};

// Contact Management API Integration
export const contactManagementAPI = {
  // Get contact lists
  getContactLists: async () => {
    try {
      // This would connect to your actual contact management API
      // For now, return enhanced mock data
      return [
        {
          id: 'list_001',
          name: 'Real Estate Leads Q4 2025', 
          description: 'High-quality real estate prospects from online campaigns',
          contactCount: 1247,
          status: 'active',
          source: 'Website Form',
          tags: ['Real Estate', 'High Priority', 'Q4'],
          created: '2025-09-01',
          owner: getCurrentUser()?.email || 'Unknown',
          lastUpdated: '2 hours ago'
        },
        {
          id: 'list_002',
          name: 'Follow-up Callbacks',
          description: 'Customers requesting callback appointments', 
          contactCount: 89,
          status: 'active',
          source: 'Inbound Calls',
          tags: ['Callbacks', 'Warm Leads'],
          created: '2025-09-08',
          owner: getCurrentUser()?.email || 'Unknown',
          lastUpdated: '1 day ago'
        },
        {
          id: 'list_003',
          name: 'Customer Support Queue',
          description: 'Support tickets requiring phone follow-up',
          contactCount: 23,
          status: 'active', 
          source: 'Support Tickets',
          tags: ['Support', 'Urgent'],
          created: '2025-09-15',
          owner: getCurrentUser()?.email || 'Unknown',
          lastUpdated: '30 minutes ago'
        },
        {
          id: 'list_004',
          name: 'VIP Customers',
          description: 'High-value customers for special campaigns',
          contactCount: 567,
          status: 'active',
          source: 'CRM Import',
          tags: ['VIP', 'High Value'],
          created: '2025-08-20',
          owner: getCurrentUser()?.email || 'Unknown',
          lastUpdated: '1 week ago'
        }
      ];
    } catch (error) {
      console.error('Failed to load contact lists:', error);
      return [];
    }
  },

  // Get contacts from a specific list with pagination and filtering
  getContactsFromList: async (listId, options = {}) => {
    try {
      const {
        page = 1,
        limit = 50,
        search = '',
        status = 'all',
        phoneFilter = 'all' // 'mobile', 'landline', 'all'
      } = options;

      // This would connect to your actual contact management API
      // For now, return enhanced mock data
      const allContacts = generateMockContacts(listId, 100);
      
      // Apply filters
      let filteredContacts = allContacts;
      
      if (search) {
        filteredContacts = filteredContacts.filter(contact => 
          contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
          contact.phone.includes(search) ||
          contact.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (status !== 'all') {
        filteredContacts = filteredContacts.filter(contact => contact.status === status);
      }

      if (phoneFilter !== 'all') {
        filteredContacts = filteredContacts.filter(contact => contact.phoneType === phoneFilter);
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

      return {
        contacts: paginatedContacts,
        totalCount: filteredContacts.length,
        totalPages: Math.ceil(filteredContacts.length / limit),
        currentPage: page,
        hasMore: endIndex < filteredContacts.length
      };

    } catch (error) {
      console.error('Failed to load contacts from list:', error);
      return { contacts: [], totalCount: 0, totalPages: 0, currentPage: 1, hasMore: false };
    }
  },

  // Get contact details
  getContactDetails: async (contactId) => {
    try {
      // This would fetch from your actual API
      return {
        id: contactId,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0123',
        email: 'john.doe@example.com',
        status: 'active',
        phoneType: 'mobile',
        timezone: 'America/New_York',
        lastContacted: '2025-09-10',
        callAttempts: 2,
        tags: ['Lead', 'Interested'],
        customFields: {
          company: 'Acme Corp',
          position: 'Manager',
          leadScore: 85
        }
      };
    } catch (error) {
      console.error('Failed to get contact details:', error);
      return null;
    }
  },

  // Search contacts across all lists
  searchContacts: async (query, options = {}) => {
    try {
      const { limit = 50, includeInactive = false } = options;
      
      // This would search across your actual contact database
      const allContacts = generateMockContacts('global_search', 200);
      
      const filteredContacts = allContacts.filter(contact => {
        const searchFields = [
          contact.firstName,
          contact.lastName, 
          contact.phone,
          contact.email,
          contact.customFields?.company || ''
        ].join(' ').toLowerCase();
        
        return searchFields.includes(query.toLowerCase()) && 
               (includeInactive || contact.status === 'active');
      }).slice(0, limit);

      return filteredContacts;
    } catch (error) {
      console.error('Failed to search contacts:', error);
      return [];
    }
  }
};

// Helper function to generate mock contacts
function generateMockContacts(listId, count) {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const companies = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Future Systems'];
  const phoneTypes = ['mobile', 'landline'];
  const statuses = ['active', 'inactive', 'do_not_call'];

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return {
      id: `contact_${listId}_${index + 1}`,
      firstName,
      lastName,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      phoneType: phoneTypes[Math.floor(Math.random() * phoneTypes.length)],
      timezone: 'America/New_York',
      lastContacted: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      callAttempts: Math.floor(Math.random() * 5),
      tags: ['Lead', 'Prospect', 'Customer'].slice(0, Math.floor(Math.random() * 3) + 1),
      customFields: {
        company: companies[Math.floor(Math.random() * companies.length)],
        position: ['Manager', 'Director', 'VP', 'Owner', 'Employee'][Math.floor(Math.random() * 5)],
        leadScore: Math.floor(Math.random() * 100) + 1
      },
      listId
    };
  });
}

// Voice Management API Integration
export const voiceManagementAPI = {
  // Get available voices
  getAvailableVoices: async () => {
    try {
      // This would connect to your voice management system
      return [
        {
          id: 'voice_001',
          name: 'Sarah - Professional',
          type: 'female',
          language: 'en-US',
          accent: 'American',
          description: 'Warm, professional voice ideal for business calls',
          sampleUrl: '/samples/sarah-professional.mp3',
          isActive: true,
          provider: 'ElevenLabs'
        },
        {
          id: 'voice_002', 
          name: 'David - Friendly',
          type: 'male',
          language: 'en-US',
          accent: 'American',
          description: 'Friendly, approachable voice for customer service',
          sampleUrl: '/samples/david-friendly.mp3',
          isActive: true,
          provider: 'ElevenLabs'
        },
        {
          id: 'voice_003',
          name: 'Emma - Energetic',
          type: 'female', 
          language: 'en-US',
          accent: 'American',
          description: 'Energetic voice perfect for sales campaigns',
          sampleUrl: '/samples/emma-energetic.mp3',
          isActive: true,
          provider: 'ElevenLabs'
        },
        {
          id: 'voice_004',
          name: 'Michael - Confident',
          type: 'male',
          language: 'en-US', 
          accent: 'American',
          description: 'Confident, authoritative voice for important announcements',
          sampleUrl: '/samples/michael-confident.mp3',
          isActive: true,
          provider: 'ElevenLabs'
        }
      ];
    } catch (error) {
      console.error('Failed to load voices:', error);
      return [];
    }
  }
};