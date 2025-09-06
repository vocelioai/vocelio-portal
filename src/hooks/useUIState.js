import React, { createContext, useContext, useReducer } from 'react';

// UI State Management for Progressive Disclosure
const UIStateContext = createContext();

const initialState = {
  activeMode: 'design', // design, test, deploy, debug
  activeDropdown: null,
  selectedNodes: [],
  isTestMode: false,
  isDeployMode: false,
  showAdvancedTools: false,
  contextualTools: []
};

const uiStateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        activeMode: action.payload,
        activeDropdown: null, // Close dropdowns when switching modes
        contextualTools: getContextualTools(action.payload)
      };
    
    case 'SET_DROPDOWN':
      return {
        ...state,
        activeDropdown: action.payload
      };
    
    case 'CLOSE_DROPDOWNS':
      return {
        ...state,
        activeDropdown: null
      };
    
    case 'SET_SELECTED_NODES':
      return {
        ...state,
        selectedNodes: action.payload,
        contextualTools: getContextualToolsForSelection(action.payload)
      };
    
    case 'TOGGLE_ADVANCED_TOOLS':
      return {
        ...state,
        showAdvancedTools: !state.showAdvancedTools
      };
    
    case 'SET_TEST_MODE':
      return {
        ...state,
        isTestMode: action.payload,
        activeMode: action.payload ? 'test' : 'design'
      };
    
    case 'SET_DEPLOY_MODE':
      return {
        ...state,
        isDeployMode: action.payload,
        activeMode: action.payload ? 'deploy' : 'design'
      };
    
    default:
      return state;
  }
};

// Get contextual tools based on current mode
const getContextualTools = (mode) => {
  const toolSets = {
    design: [
      { id: 'node-library', label: 'Add Node', priority: 'high' },
      { id: 'templates', label: 'Templates', priority: 'medium' },
      { id: 'auto-layout', label: 'Auto Layout', priority: 'medium' }
    ],
    test: [
      { id: 'test-call', label: 'Test Call', priority: 'high' },
      { id: 'test-pathway', label: 'Test Pathway', priority: 'high' },
      { id: 'debug-mode', label: 'Debug Mode', priority: 'medium' }
    ],
    deploy: [
      { id: 'promote-production', label: 'Deploy', priority: 'high' },
      { id: 'production-manager', label: 'Manage Production', priority: 'medium' },
      { id: 'phone-setup', label: 'Phone Setup', priority: 'medium' }
    ],
    debug: [
      { id: 'analytics', label: 'Analytics', priority: 'high' },
      { id: 'execution-monitor', label: 'Monitor', priority: 'high' },
      { id: 'performance', label: 'Performance', priority: 'medium' }
    ]
  };
  
  return toolSets[mode] || [];
};

// Get contextual tools based on selected nodes
const getContextualToolsForSelection = (selectedNodes) => {
  if (selectedNodes.length === 0) return [];
  
  if (selectedNodes.length === 1) {
    return [
      { id: 'edit-node', label: 'Edit Node', priority: 'high' },
      { id: 'duplicate-node', label: 'Duplicate', priority: 'medium' },
      { id: 'delete-node', label: 'Delete', priority: 'low' }
    ];
  }
  
  return [
    { id: 'group-nodes', label: 'Group Nodes', priority: 'high' },
    { id: 'align-nodes', label: 'Align', priority: 'medium' },
    { id: 'delete-nodes', label: 'Delete All', priority: 'low' }
  ];
};

export const UIStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiStateReducer, initialState);
  
  const actions = {
    setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),
    setDropdown: (dropdown) => dispatch({ type: 'SET_DROPDOWN', payload: dropdown }),
    closeDropdowns: () => dispatch({ type: 'CLOSE_DROPDOWNS' }),
    setSelectedNodes: (nodes) => dispatch({ type: 'SET_SELECTED_NODES', payload: nodes }),
    toggleAdvancedTools: () => dispatch({ type: 'TOGGLE_ADVANCED_TOOLS' }),
    setTestMode: (isTest) => dispatch({ type: 'SET_TEST_MODE', payload: isTest }),
    setDeployMode: (isDeploy) => dispatch({ type: 'SET_DEPLOY_MODE', payload: isDeploy })
  };
  
  return (
    <UIStateContext.Provider value={{ state, actions }}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};

// Mode definitions for progressive disclosure
export const MODES = {
  DESIGN: 'design',
  TEST: 'test',
  DEPLOY: 'deploy',
  DEBUG: 'debug'
};

// Tool priority levels
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};
