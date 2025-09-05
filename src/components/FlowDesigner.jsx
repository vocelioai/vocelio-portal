import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Plus, X, Play, Check
} from 'lucide-react';

// Import extracted components
import FlowDesignerHeader from './FlowDesigner/FlowDesignerHeader';
import FlowDesignerCanvasControls from './FlowDesigner/FlowDesignerCanvasControls';
import FlowDesignerNotifications from './FlowDesigner/FlowDesignerNotifications';
import FlowDesignerCommandPalette from './FlowDesigner/FlowDesignerCommandPalette';
import VoiceSelector from './VoiceSelector';

  // Import our new schema and components
  import { NodeTypeConfig } from '../lib/flowSchemas';
  import { migrateLegacyFlow, autoLayoutNodes, exportFlowToJSON } from '../lib/flowMigration';
  import { nodeTypes } from '../components/FlowNodes';
  import { railwayFlowAPI } from '../lib/railwayFlowAPI';
  import { vocelioFlowAPI } from '../lib/vocelioFlowAPI';
  import { contextAPI } from '../lib/contextAPI';
  import FLOW_DESIGNER_CONFIG from '../config/flowDesignerConfig';
  import ExecutionMonitor from '../components/ExecutionMonitor';
  import NodeTemplateBrowser from '../components/NodeTemplateBrowser';
  import FlowTemplateBrowser from '../components/FlowTemplateBrowser';
  import FlowTemplateManager from '../components/FlowTemplateManager';
  import FlowAnalyticsDashboard from '../components/FlowAnalyticsDashboard';
  import FlowCollaboration from '../components/FlowCollaboration';
  import AIFlowOptimizer from '../components/AIFlowOptimizer';
  import AdvancedNodeTypesManager from '../components/AdvancedNodeTypesManager';
  import contextIntelligence from '../lib/contextIntelligence';
  import ContextAnalyticsDashboard from '../components/ContextAnalyticsDashboard';
  import AITemplateGenerator from '../components/AITemplateGenerator';
  import ContextInheritanceManager from '../components/ContextInheritanceManager';

// Lazy load Phase 3 component to reduce initial bundle size
const Phase3FlowBuilderEnhancements = React.lazy(() => import('../components/Phase3FlowBuilderEnhancementsLite'));

const VocelioAIPlatform = () => {
  // State management
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [gridVisible, setGridVisible] = useState(false);
  const [layersVisible, setLayersVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentEditingNode, setCurrentEditingNode] = useState(null);
  const [nodeCounter, setNodeCounter] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('featured');
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [advancedTab, setAdvancedTab] = useState('voice');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragElement, setDragElement] = useState(null);
  const [templateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  const [flowTemplateBrowserOpen, setFlowTemplateBrowserOpen] = useState(false);
  const [flowTemplateManagerOpen, setFlowTemplateManagerOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [aiOptimizerOpen, setAiOptimizerOpen] = useState(false);
  const [advancedNodesOpen, setAdvancedNodesOpen] = useState(false);
  
  // Global Prompt State Management
  const [globalPrompt, setGlobalPrompt] = useState(() => {
    // Load from localStorage on initialization
    const savedPrompt = localStorage.getItem('vocelio-global-prompt');
    return savedPrompt || `You are Alex from Vocelio AI, a specialized lead generation and appointment setting company that works exclusively with businesses looking to automate their customer conversations. You are calling business owners, sales managers, and development professionals to introduce them to our services.

You're calling {{customer_name}} because you came across their company and saw they're doing great work and could benefit from conversational AI automation.`;
  });

  // Workflow-Specific Context State Management
  const [workflowContexts, setWorkflowContexts] = useState(() => {
    // Load from localStorage on initialization
    const savedContexts = localStorage.getItem('vocelio-workflow-contexts');
    return savedContexts ? JSON.parse(savedContexts) : {};
  });

  const [currentWorkflowId, setCurrentWorkflowId] = useState('main-workflow');
  const [workflowContextModalOpen, setWorkflowContextModalOpen] = useState(false);

  // Context Library State Management
  const [contextLibraryOpen, setContextLibraryOpen] = useState(false);
  const [contextTemplates, setContextTemplates] = useState(() => {
    // Load custom templates from localStorage
    const savedTemplates = localStorage.getItem('vocelio-context-templates');
    const customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];
    
    // Initialize with empty array, will be populated after getBuiltInTemplates is defined
    return customTemplates;
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // API Integration & Collaboration State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error, success
  const [teamMembers, setTeamMembers] = useState([]);
  const [realtimeConnection, setRealtimeConnection] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [conflictResolution, setConflictResolution] = useState(null);
  
  // Current user for collaboration
  const [currentUser] = useState({
    id: 'current-user',
    name: 'John Smith',
    email: 'john.smith@vocelio.ai',
    avatar: 'JS',
    role: 'admin',
    color: '#3B82F6'
  });

  // 🚀 ADVANCED FEATURES STATE - AI Intelligence & Analytics
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [aiGeneratorModalOpen, setAiGeneratorModalOpen] = useState(false);
  const [inheritanceManagerOpen, setInheritanceManagerOpen] = useState(false);
  const [contextUsageData, setContextUsageData] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  // Form states
  const [nodeForm, setNodeForm] = useState({
    name: '',
    type: 'Large Text',
    prompt: '',
    plainText: '',
    loopCondition: '',
    temperature: 0.5,
    staticText: false,
    globalNode: false,
    skipResponse: false,
    blockInterruptions: false,
    disableRecording: false,
    // Voice & Audio Settings
    voice: 'alloy',
    voiceTier: 'regular', // New tier selection
    speed: 1.0,
    pitch: 0,
    volume: 100,
    // Input Collection Settings
    inputType: 'dtmf',
    timeout: 5,
    retries: 3,
    maxLength: 10,
    validationPattern: ''
  });

  // Voice selector states
  const [availableVoices, setAvailableVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  
  // Global voice settings for testing and calls
  const [globalVoiceSettings, setGlobalVoiceSettings] = useState({
    voiceTier: 'regular',
    selectedVoice: 'alloy',
    speed: 1.0,
    pitch: 0,
    volume: 100
  });

  // Railway execution states
  const [executionMonitorVisible, setExecutionMonitorVisible] = useState(false);
  const [currentExecution, setCurrentExecution] = useState(null);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);

  // Refs
  const canvasRef = useRef(null);
  const commandSearchRef = useRef(null);

  // Legacy nodes data (will be migrated)
  const legacyNodes = [
    {
      id: 'start',
      type: 'Start',
      icon: '🚀',
      title: 'Start',
      content: 'Entry point for all conversations',
      badge: 'Default',
      position: { x: 200, y: 100 }
    },
    {
      id: 'introduction',
      type: 'Introduce the services',
      icon: '👋',
      title: 'Introduce the services',
      content: 'Give a brief explanation of Vocelio and our services to the client',
      badge: 'Large Text',
      position: { x: 200, y: 250 }
    },
    {
      id: 'user-response',
      type: 'User responded',
      icon: '👤',
      title: 'User responded',
      content: "Process user's initial response",
      badge: 'Default',
      position: { x: 200, y: 400 }
    },
    {
      id: 'reschedule',
      type: 'New Node 16',
      icon: '📅',
      title: 'New Node 16',
      content: 'Ask for time for reschedule',
      badge: 'Default',
      position: { x: 500, y: 100 }
    },
    {
      id: 'endcall',
      type: 'End Call',
      icon: '📞',
      title: 'End Call',
      content: 'Say Thanks so much for your time. I\'ve marked you as not interested for now.',
      badge: 'End Call',
      position: { x: 500, y: 250 }
    },
    {
      id: 'technology',
      type: 'Introducing our technology',
      icon: '⚡',
      title: 'Introducing our technology',
      content: 'Explain our AI technology and capabilities',
      badge: 'Large Text', 
      position: { x: 500, y: 400 }
    },
    // Test nodes for infinite scrolling
    {
      id: 'test-far-right',
      type: 'Test Node',
      icon: '🔍',
      title: 'Far Right Test',
      content: 'This node is positioned far to the right for testing scrolling',
      badge: 'Test',
      position: { x: 1500, y: 200 }
    },
    {
      id: 'test-far-bottom',
      type: 'Test Node',
      icon: '🔍',
      title: 'Far Bottom Test',
      content: 'This node is positioned far down for testing scrolling',
      badge: 'Test',
      position: { x: 300, y: 1200 }
    },
    {
      id: 'test-far-corner',
      type: 'Test Node',
      icon: '🔍',
      title: 'Far Corner Test',
      content: 'This node is positioned far away for testing infinite canvas',
      badge: 'Test',
      position: { x: 1800, y: 1500 }
    }
  ];

  // Migrate legacy data to new format
  const migratedFlow = useMemo(() => {
    return migrateLegacyFlow(legacyNodes);
  }, []);

  // React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(migratedFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(migratedFlow.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Modal and notification handlers (moved up to fix hoisting issues)
  const closeModal = useCallback(() => {
    console.log('Closing modal, activeModal was:', activeModal);
    setActiveModal(null);
    setCurrentEditingNode(null);
    setNodeForm({
      name: '',
      type: 'Large Text',
      prompt: '',
      plainText: '',
      loopCondition: '',
      temperature: 0.5,
      staticText: false,
      globalNode: false,
      skipResponse: false,
      blockInterruptions: false,
      disableRecording: false,
      // Voice & Audio Settings
      voice: 'alloy',
      speed: 1.0,
      pitch: 0,
      volume: 100,
      // Input Collection Settings
      inputType: 'dtmf',
      timeout: 5,
      retries: 3,
      maxLength: 10,
      validationPattern: ''
    });
  }, []);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // React Flow event handlers
  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#3b82f6'
        },
        style: {
          stroke: '#3b82f6',
          strokeWidth: 2
        }
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  // Add new node function
  const addNewNode = useCallback((nodeType) => {
    const newNode = {
      id: `${nodeType.toLowerCase()}-${Date.now()}`,
      type: nodeType,
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: `New ${nodeType}`,
        ...(nodeType === 'Say' && { text: 'Hello, this is a new message.' }),
        ...(nodeType === 'Collect' && { 
          mode: 'speech',
          prompt: 'Please provide your response.',
          timeoutMs: 4000
        }),
        ...(nodeType === 'End' && { disposition: 'not_interested' })
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    closeModal();
    showNotification(`Added new ${nodeType} node`, 'success');
  }, [setNodes, closeModal, showNotification]);

  // Auto-layout function
  const performAutoLayout = useCallback(() => {
    const layoutedNodes = autoLayoutNodes(nodes, edges);
    setNodes(layoutedNodes);
    showNotification('Auto-layout applied', 'success');
  }, [nodes, edges, setNodes, showNotification]);

  // Export flow function
  const exportFlow = useCallback(() => {
    try {
      const flow = {
        ...migratedFlow,
        nodes,
        edges,
        modified: new Date().toISOString()
      };
      
      const json = exportFlowToJSON(flow);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vocelio-flow-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('Flow exported successfully', 'success');
    } catch (error) {
      showNotification('Export failed: ' + error.message, 'error');
    }
  }, [nodes, edges, migratedFlow, showNotification]);

  // Railway execution handlers
  const handleExecutionStart = useCallback((execution) => {
    setCurrentExecution(execution);
    setIsExecutionRunning(true);
    showNotification('Flow execution started on Railway backend', 'success');
  }, [showNotification]);

  const handleExecutionEnd = useCallback((execution) => {
    setIsExecutionRunning(false);
    showNotification(`Flow execution ${execution.status}`, execution.status === 'completed' ? 'success' : 'error');
  }, [showNotification]);

  const testRailwayConnection = useCallback(async () => {
    try {
      const result = await railwayFlowAPI.testConnection();
      if (result.success) {
        showNotification('✅ Railway backend connected successfully!', 'success');
      } else {
        showNotification('❌ Railway connection failed: ' + result.error, 'error');
      }
    } catch (error) {
      showNotification('❌ Railway connection error: ' + error.message, 'error');
    }
  }, [showNotification]);

  // Zoom functions - Fixed to work with ReactFlow instance
  const zoomIn = useCallback(() => {
    if (reactFlowInstance) {
      const currentViewport = reactFlowInstance.getViewport();
      const newZoom = Math.min(currentViewport.zoom * 1.2, 4);
      reactFlowInstance.setViewport({ 
        x: currentViewport.x, 
        y: currentViewport.y, 
        zoom: newZoom 
      });
      setCurrentZoom(newZoom);
    }
  }, [reactFlowInstance]);

  const zoomOut = useCallback(() => {
    if (reactFlowInstance) {
      const currentViewport = reactFlowInstance.getViewport();
      const newZoom = Math.max(currentViewport.zoom / 1.2, 0.1);
      reactFlowInstance.setViewport({ 
        x: currentViewport.x, 
        y: currentViewport.y, 
        zoom: newZoom 
      });
      setCurrentZoom(newZoom);
    }
  }, [reactFlowInstance]);

  const resetZoom = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      setCurrentZoom(1);
    }
  }, [reactFlowInstance]);

  // Toggle functions
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        showNotification('Entered fullscreen mode', 'info');
      }).catch(() => {
        // Fallback to UI fullscreen
        setIsFullscreen(!isFullscreen);
        showNotification('UI fullscreen mode enabled', 'info');
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        showNotification('Exited fullscreen mode', 'info');
      }).catch(() => {
        // Fallback to UI fullscreen
        setIsFullscreen(!isFullscreen);
      });
    }
  }, [isFullscreen, showNotification]);

  const toggleMinimap = useCallback(() => {
    setMinimapVisible(!minimapVisible);
  }, [minimapVisible]);

  const toggleGrid = useCallback(() => {
    setGridVisible(!gridVisible);
    showNotification(gridVisible ? 'Grid disabled' : 'Grid enabled', 'info');
  }, [gridVisible, showNotification]);

  const toggleLayers = useCallback(() => {
    setLayersVisible(!layersVisible);
  }, [layersVisible]);

  const toggleHistory = useCallback(() => {
    setHistoryVisible(!historyVisible);
  }, [historyVisible]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    showNotification(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled', 'info');
  }, [isDarkMode, showNotification]);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteVisible(!commandPaletteVisible);
    if (!commandPaletteVisible) {
      setTimeout(() => commandSearchRef.current?.focus(), 100);
    }
  }, [commandPaletteVisible]);

  // Modal functions
  const showModal = useCallback((modalId) => {
    setActiveModal(modalId);
  }, []);

  // Utility functions
  const copyId = useCallback(() => {
    navigator.clipboard.writeText('3e18c41b-1902-48d7-a86e-8e3150e83ae7');
    showNotification('ID copied to clipboard!', 'success');
  }, [showNotification]);

  // Node management
  const editNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setCurrentEditingNode(nodeId);
      setNodeForm({
        name: node.title,
        type: node.type,
        prompt: node.content,
        plainText: '',
        loopCondition: '',
        temperature: 0.5,
        staticText: false,
        globalNode: false,
        skipResponse: false,
        blockInterruptions: false,
        disableRecording: false,
        // Voice & Audio Settings
        voice: node.data?.voice || 'alloy',
        voiceTier: node.data?.voiceTier || 'regular',
        speed: node.data?.speed || 1.0,
        pitch: node.data?.pitch || 0,
        volume: node.data?.volume || 100,
        // Input Collection Settings
        inputType: node.data?.inputType || 'dtmf',
        timeout: node.data?.timeout || 5,
        retries: node.data?.retries || 3,
        maxLength: node.data?.maxLength || 10,
        validationPattern: node.data?.validationPattern || ''
      });
      showModal('editNode');
    }
  }, [nodes, showModal]);

  const deleteNode = useCallback((nodeId) => {
    if (!nodeId) {
      console.warn('Delete node called without nodeId');
      return;
    }
    
    // Remove node from flow
    setNodes((nds) => {
      const filteredNodes = nds.filter((node) => node.id !== nodeId);
      console.log(`Deleting node ${nodeId}, nodes before: ${nds.length}, after: ${filteredNodes.length}`);
      return filteredNodes;
    });
    
    // Remove connected edges
    setEdges((eds) => {
      const filteredEdges = eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      );
      return filteredEdges;
    });
    
    showNotification('Node deleted successfully!', 'success');
  }, [setNodes, setEdges, showNotification]);

  // Add callback functions to existing nodes once they're defined
  useEffect(() => {
    setNodes((currentNodes) => 
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onEdit: editNode,
          onDelete: deleteNode,
          message: node.data?.message || node.content,
          content: node.data?.content || node.content
        }
      }))
    );
  }, [editNode, deleteNode]);

  const addNodeToCanvas = (nodeType) => {
    const newId = `node-${nodeCounter}`;
    const icons = {
      'collect-phone': '📱',
      'collect-email': '✉️',
      'schedule-meeting': '📅'
    };
    
    const titles = {
      'collect-phone': 'Collect Phone Number',
      'collect-email': 'Collect Email',
      'schedule-meeting': 'Schedule Meeting'
    };

    const contents = {
      'collect-phone': 'Collect and validate phone numbers from users',
      'collect-email': 'Collect and validate email addresses from users',
      'schedule-meeting': 'Book appointments and manage calendar integration'
    };

    const newNode = {
      id: newId,
      type: titles[nodeType] || 'New Node',
      icon: icons[nodeType] || '⚡',
      title: titles[nodeType] || `New Node ${nodeCounter}`,
      content: contents[nodeType] || 'New conversation node',
      badge: 'Default',
      position: { 
        x: 200 + Math.random() * 600, 
        y: 100 + Math.random() * 400 
      },
      data: {
        onEdit: editNode,
        onDelete: deleteNode,
        message: contents[nodeType] || 'New conversation node',
        content: contents[nodeType] || 'New conversation node'
      }
    };

    setNodes(prev => [...prev, newNode]);
    setNodeCounter(prev => prev + 1);
    closeModal();
    showNotification('Node added successfully!', 'success');
  };

  // Template selection handler
  const handleTemplateSelect = (templateNode) => {
    // Find a suitable position for the new node
    const existingNodes = nodes;
    const xOffset = 100 + (existingNodes.length * 50);
    const yOffset = 100 + (existingNodes.length * 30);
    
    const newNode = {
      ...templateNode,
      position: { x: xOffset, y: yOffset }
    };
    
    setNodes(prevNodes => [...prevNodes, newNode]);
    setNodeCounter(prev => prev + 1);
    setTemplateBrowserOpen(false);
    
    // Show success notification
    const notification = {
      id: Date.now(),
      type: 'success',
      message: `Template "${newNode.data.label}" added successfully!`
    };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  // Flow Template selection handler
  const handleFlowTemplateSelect = (flowTemplate) => {
    try {
      // Replace current flow with template
      setNodes(flowTemplate.nodes);
      setEdges(flowTemplate.edges);
      setFlowTemplateBrowserOpen(false);
      
      // Show success notification
      const notification = {
        id: Date.now(),
        type: 'success',
        message: `Flow template "${flowTemplate.name}" loaded successfully!`
      };
      setNotifications(prev => [...prev, notification]);
      
      // Auto-remove notification after 3 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 3000);
    } catch (error) {
      console.error('Error loading flow template:', error);
      showNotification('Failed to load flow template', 'error');
    }
  };

  const saveNode = () => {
    if (currentEditingNode) {
      setNodes(prev => prev.map(node => 
        node.id === currentEditingNode 
          ? { 
              ...node, 
              title: nodeForm.name, 
              content: nodeForm.prompt,
              data: {
                ...node.data,
                // Voice & Audio Settings
                voice: nodeForm.voice,
                voiceTier: nodeForm.voiceTier,
                speed: nodeForm.speed,
                pitch: nodeForm.pitch,
                volume: nodeForm.volume,
                // Input Collection Settings
                inputType: nodeForm.inputType,
                timeout: nodeForm.timeout,
                retries: nodeForm.retries,
                maxLength: nodeForm.maxLength,
                validationPattern: nodeForm.validationPattern,
                // Timing & Behavior Controls
                skipResponse: nodeForm.skipResponse,
                blockInterruptions: nodeForm.blockInterruptions,
                disableRecording: nodeForm.disableRecording,
                // Advanced Options
                globalNode: nodeForm.globalNode,
                temperature: nodeForm.temperature,
                staticText: nodeForm.staticText
              }
            }
          : node
      ));
      showNotification('Node saved successfully!', 'success');
      closeModal();
    }
  };

  // =============================================================================
  // 🎤 VOICE MANAGEMENT FUNCTIONS
  // =============================================================================

  const loadVoices = async () => {
    try {
      setLoadingVoices(true);
      console.log('🎤 Loading legacy voices...');
      
      // This is for legacy voice loading - the VoiceSelector will handle API voices
      const legacyVoices = [
        { id: 'alloy', name: 'Alloy', provider: 'openai', tier: 'regular' },
        { id: 'echo', name: 'Echo', provider: 'openai', tier: 'regular' },
        { id: 'fable', name: 'Fable', provider: 'openai', tier: 'regular' },
        { id: 'onyx', name: 'Onyx', provider: 'openai', tier: 'regular' },
        { id: 'nova', name: 'Nova', provider: 'openai', tier: 'regular' },
        { id: 'shimmer', name: 'Shimmer', provider: 'openai', tier: 'regular' }
      ];
      
      setAvailableVoices(legacyVoices);
      console.log('✅ Legacy voices loaded');
      
    } catch (error) {
      console.error('❌ Failed to load legacy voices:', error);
      showNotification('Failed to load voices', 'error');
    } finally {
      setLoadingVoices(false);
    }
  };

  const enableAudioContext = async () => {
    try {
      // Create a silent audio context to enable audio playback
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      console.log('🎵 Audio context enabled');
    } catch (error) {
      console.error('❌ Failed to enable audio context:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (commandPaletteVisible) {
          setCommandPaletteVisible(false);
        } else if (activeModal) {
          closeModal();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveWorkflow();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showModal('addNode');
      }

      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        toggleGrid();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteVisible, activeModal]);

  // Utility functions
  const saveWorkflow = useCallback(() => {
    showNotification('Workflow saved successfully!', 'success');
  }, [showNotification]);

  const testPathway = useCallback(() => {
    showNotification('Pathway test started!', 'success');
    closeModal();
  }, [showNotification]);

  const startCall = useCallback(() => {
    showNotification('Call initiated successfully!', 'success');
    closeModal();
  }, [showNotification]);

  const promoteToProduction = useCallback(() => {
    showNotification('Successfully promoted to production!', 'success');
    closeModal();
  }, [showNotification]);

  // Global Prompt Management
  const saveGlobalPrompt = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      
      // Save to API first
      const result = await contextAPI.saveGlobalPrompt(globalPrompt);
      
      if (result.success) {
        // Log activity for team collaboration
        await contextAPI.logActivity('global-prompt-updated', {
          prompt: globalPrompt.substring(0, 100) + '...',
          length: globalPrompt.length
        });
        
        setLastSyncTime(new Date().toISOString());
        setSyncStatus('success');
        showNotification('Global prompt saved and synced!', 'success');
      } else {
        // API failed, but localStorage was already saved as fallback
        setSyncStatus('error');
        showNotification('Global prompt saved locally (offline mode)', 'warning');
      }
      
      closeModal();
    } catch (error) {
      console.error('Failed to save global prompt:', error);
      setSyncStatus('error');
      showNotification('Failed to save global prompt. Please try again.', 'error');
    }
  }, [globalPrompt, showNotification]);

  const handleGlobalPromptChange = useCallback((event) => {
    setGlobalPrompt(event.target.value);
  }, []);

  // Workflow Context Management Functions
  const saveWorkflowContexts = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      
      // Save to API
      const result = await contextAPI.saveWorkflowContexts(workflowContexts);
      
      if (result.success) {
        // Log activity
        await contextAPI.logActivity('workflow-contexts-updated', {
          count: Object.keys(workflowContexts).length,
          workflows: Object.values(workflowContexts).map(w => ({ id: w.id, name: w.name }))
        });
        
        setLastSyncTime(new Date().toISOString());
        setSyncStatus('success');
        showNotification('Workflow contexts saved and synced!', 'success');
      } else {
        setSyncStatus('error');
        showNotification('Workflow contexts saved locally (offline mode)', 'warning');
      }
    } catch (error) {
      console.error('Failed to save workflow contexts:', error);
      setSyncStatus('error');
      showNotification('Failed to save workflow contexts. Please try again.', 'error');
    }
  }, [workflowContexts, showNotification]);

  const updateWorkflowContext = useCallback(async (workflowId, context) => {
    // Update local state immediately for responsiveness
    setWorkflowContexts(prev => ({
      ...prev,
      [workflowId]: {
        ...prev[workflowId],
        ...context,
        lastModified: new Date().toISOString()
      }
    }));

    // Debounced API save (saves after 2 seconds of no changes)
    clearTimeout(updateWorkflowContext.timeoutId);
    updateWorkflowContext.timeoutId = setTimeout(async () => {
      try {
        const updatedContext = {
          ...workflowContexts[workflowId],
          ...context,
          lastModified: new Date().toISOString()
        };
        
        await contextAPI.saveWorkflowContext(workflowId, updatedContext);
        
        // Log activity for minor updates
        await contextAPI.logActivity('workflow-context-updated', {
          workflowId,
          workflowName: updatedContext.name,
          changes: Object.keys(context)
        });
        
        setLastSyncTime(new Date().toISOString());
      } catch (error) {
        console.error('Failed to sync workflow context:', error);
      }
    }, 2000);
  }, [workflowContexts]);

  const createNewWorkflow = useCallback((workflowName, workflowType = 'general') => {
    const workflowId = `${workflowType}-${Date.now()}`;
    const newWorkflow = {
      id: workflowId,
      name: workflowName,
      type: workflowType,
      context: '',
      description: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    setWorkflowContexts(prev => ({
      ...prev,
      [workflowId]: newWorkflow
    }));
    
    setCurrentWorkflowId(workflowId);
    showNotification(`Workflow "${workflowName}" created successfully!`, 'success');
    return workflowId;
  }, [showNotification]);

  const deleteWorkflowContext = useCallback((workflowId) => {
    setWorkflowContexts(prev => {
      const newContexts = { ...prev };
      delete newContexts[workflowId];
      return newContexts;
    });
    
    if (currentWorkflowId === workflowId) {
      setCurrentWorkflowId('main-workflow');
    }
    
    showNotification('Workflow context deleted successfully!', 'success');
  }, [currentWorkflowId, showNotification]);

  const getCurrentWorkflowContext = useCallback(() => {
    return workflowContexts[currentWorkflowId] || null;
  }, [workflowContexts, currentWorkflowId]);

  const getCombinedContext = useCallback((workflowId = currentWorkflowId) => {
    const workflow = workflowContexts[workflowId];
    const workflowContext = workflow?.context || '';
    
    // Combine global and workflow-specific contexts
    if (workflowContext.trim()) {
      return `${globalPrompt}\n\n## WORKFLOW-SPECIFIC CONTEXT:\n${workflowContext}`;
    }
    return globalPrompt;
  }, [globalPrompt, workflowContexts, currentWorkflowId]);

  // Built-in Context Templates
  const getBuiltInTemplates = useCallback(() => {
    return [
      // INDUSTRY TEMPLATES
      {
        id: 'healthcare-general',
        name: 'Healthcare Professional',
        category: 'industry',
        description: 'HIPAA-compliant, empathetic healthcare communication',
        tags: ['healthcare', 'medical', 'hipaa', 'empathetic'],
        context: `You are a healthcare professional dedicated to patient care and well-being. You maintain strict HIPAA compliance and patient confidentiality at all times. 

Key Guidelines:
- Use compassionate, professional medical terminology
- Always prioritize patient safety and comfort
- Respect patient privacy and confidentiality
- Provide clear, understandable explanations
- Show empathy and understanding for patient concerns
- Guide patients through processes step-by-step

Remember: You cannot provide medical diagnoses or treatment advice. Always direct patients to consult with their healthcare provider for medical questions.`,
        isBuiltIn: true,
        popularity: 95
      },
      {
        id: 'retail-customer-service',
        name: 'Retail Customer Service',
        category: 'industry',
        description: 'Friendly, helpful retail customer experience',
        tags: ['retail', 'customer-service', 'friendly', 'sales'],
        context: `You are a friendly and enthusiastic retail customer service representative focused on creating exceptional shopping experiences.

Key Guidelines:
- Maintain a warm, welcoming tone
- Focus on customer satisfaction and problem-solving
- Highlight product benefits and value
- Offer alternatives and suggestions
- Handle complaints with patience and understanding
- Drive sales through helpful recommendations
- Create urgency around limited-time offers

Your goal is to turn every interaction into a positive experience that builds customer loyalty and drives sales.`,
        isBuiltIn: true,
        popularity: 88
      },
      {
        id: 'finance-professional',
        name: 'Financial Services',
        category: 'industry',
        description: 'Trustworthy, compliant financial communication',
        tags: ['finance', 'banking', 'compliance', 'trustworthy'],
        context: `You are a professional financial services representative committed to helping clients achieve their financial goals while maintaining strict regulatory compliance.

Key Guidelines:
- Use precise, trustworthy language
- Maintain confidentiality and security protocols
- Explain complex financial concepts clearly
- Focus on long-term client relationships
- Emphasize risk management and responsible investing
- Always include necessary disclaimers
- Build trust through transparency and expertise

Remember: You must comply with all financial regulations and cannot provide specific investment advice without proper licensing.`,
        isBuiltIn: true,
        popularity: 82
      },
      {
        id: 'saas-b2b',
        name: 'B2B SaaS',
        category: 'industry',
        description: 'Technical, ROI-focused software solutions',
        tags: ['saas', 'b2b', 'technical', 'roi'],
        context: `You are a knowledgeable B2B SaaS consultant focused on helping businesses optimize their operations through technology solutions.

Key Guidelines:
- Emphasize ROI and business value
- Use technical language appropriately for your audience
- Focus on scalability and efficiency gains
- Provide concrete examples and case studies
- Address integration and implementation concerns
- Highlight competitive advantages
- Quantify benefits whenever possible

Your goal is to demonstrate how your solution solves real business problems and drives measurable results.`,
        isBuiltIn: true,
        popularity: 90
      },
      
      // ROLE-BASED TEMPLATES
      {
        id: 'sales-closer',
        name: 'Sales Closer',
        category: 'role',
        description: 'Persuasive, results-driven sales approach',
        tags: ['sales', 'closing', 'persuasive', 'results'],
        context: `You are a results-driven sales professional focused on identifying qualified prospects and closing deals efficiently.

Key Guidelines:
- Ask qualifying questions to understand needs
- Present clear value propositions
- Handle objections confidently with proven responses
- Create urgency through scarcity and time-sensitive offers
- Focus on benefits rather than features
- Use social proof and testimonials
- Guide prospects toward a clear next step
- Always ask for the sale

Your primary goal is to move qualified prospects through the sales funnel and close deals.`,
        isBuiltIn: true,
        popularity: 93
      },
      {
        id: 'technical-support',
        name: 'Technical Support Specialist',
        category: 'role',
        description: 'Patient, solution-oriented technical assistance',
        tags: ['support', 'technical', 'problem-solving', 'patient'],
        context: `You are a patient and knowledgeable technical support specialist dedicated to solving customer problems efficiently.

Key Guidelines:
- Listen actively to understand the exact problem
- Ask clarifying questions to diagnose issues
- Provide step-by-step troubleshooting instructions
- Use simple language for complex technical concepts
- Show empathy for customer frustration
- Offer multiple solution options when possible
- Follow up to ensure problems are resolved
- Escalate complex issues when appropriate

Your goal is to resolve technical issues quickly while providing an excellent customer experience.`,
        isBuiltIn: true,
        popularity: 87
      },
      {
        id: 'appointment-setter',
        name: 'Appointment Setter',
        category: 'role',
        description: 'Efficient, professional scheduling specialist',
        tags: ['scheduling', 'appointments', 'efficient', 'professional'],
        context: `You are a professional appointment setter focused on efficiently scheduling qualified prospects for meaningful business discussions.

Key Guidelines:
- Quickly identify decision-makers and qualify prospects
- Emphasize the value of the meeting, not the product
- Offer multiple time options for flexibility
- Confirm availability and contact information
- Send immediate calendar confirmations
- Handle scheduling objections professionally
- Respect prospects' time constraints
- Follow up on missed appointments appropriately

Your goal is to book high-quality appointments that convert to meaningful business opportunities.`,
        isBuiltIn: true,
        popularity: 85
      },
      
      // TONE & PERSONALITY TEMPLATES
      {
        id: 'friendly-casual',
        name: 'Friendly & Casual',
        category: 'personality',
        description: 'Warm, approachable, conversational tone',
        tags: ['friendly', 'casual', 'warm', 'approachable'],
        context: `You communicate with a warm, friendly, and approachable personality that makes people feel comfortable and valued.

Key Guidelines:
- Use conversational, easy-going language
- Show genuine interest in people
- Be helpful without being pushy
- Use humor appropriately to lighten the mood
- Make complex topics accessible and easy to understand
- Create a welcoming, inclusive atmosphere
- Build rapport through shared experiences
- Maintain professionalism while being personable

Your goal is to create genuine connections that lead to positive outcomes for everyone involved.`,
        isBuiltIn: true,
        popularity: 78
      },
      {
        id: 'professional-authoritative',
        name: 'Professional & Authoritative',
        category: 'personality',
        description: 'Confident, expert, credible communication',
        tags: ['professional', 'authoritative', 'expert', 'credible'],
        context: `You communicate with confidence, expertise, and authority while maintaining professionalism and respect.

Key Guidelines:
- Demonstrate deep knowledge and expertise
- Use precise, professional language
- Present information clearly and authoritatively
- Back up statements with facts and evidence
- Maintain composure in challenging situations
- Command respect through competence
- Set clear expectations and boundaries
- Lead conversations toward productive outcomes

Your goal is to establish credibility and guide interactions with confident expertise.`,
        isBuiltIn: true,
        popularity: 84
      }
    ];
  }, []);

  // Initialize context templates with built-in templates
  useEffect(() => {
    const savedTemplates = localStorage.getItem('vocelio-context-templates');
    const customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];
    setContextTemplates([...getBuiltInTemplates(), ...customTemplates]);
  }, [getBuiltInTemplates]);

  // Context Library Management Functions
  const saveCustomTemplate = useCallback((template) => {
    const customTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      isBuiltIn: false,
      createdAt: new Date().toISOString()
    };
    
    setContextTemplates(prev => {
      const newTemplates = [...prev, customTemplate];
      // Save only custom templates to localStorage
      const customTemplates = newTemplates.filter(t => !t.isBuiltIn);
      localStorage.setItem('vocelio-context-templates', JSON.stringify(customTemplates));
      return newTemplates;
    });
    
    showNotification(`Template "${template.name}" saved successfully!`, 'success');
    return customTemplate.id;
  }, [showNotification]);

  const applyTemplateToWorkflow = useCallback((templateId, workflowId) => {
    const template = contextTemplates.find(t => t.id === templateId);
    if (template && workflowId) {
      updateWorkflowContext(workflowId, { 
        context: template.context,
        templateUsed: template.name
      });
      showNotification(`Template "${template.name}" applied to workflow!`, 'success');
    }
  }, [contextTemplates, updateWorkflowContext, showNotification]);

  const getFilteredTemplates = useCallback(() => {
    return contextTemplates.filter(template => {
      const matchesSearch = !templateSearchQuery || 
        template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(templateSearchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [contextTemplates, templateSearchQuery, selectedCategory]);

  // 🚀 ADVANCED FEATURES HANDLERS - AI Intelligence & Analytics
  
  // Analytics Dashboard Handler
  const handleOpenAnalytics = useCallback(() => {
    // Simulate generating usage data
    const mockUsageData = Object.entries(workflowContexts).map(([id, context]) => ({
      context_id: id,
      context_name: context.name || 'Unnamed Workflow',
      usage_count: Math.floor(Math.random() * 500) + 50,
      conversion_rate: Math.random() * 0.4 + 0.6, // 60-100%
      last_used: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    setContextUsageData(mockUsageData);
    setAnalyticsModalOpen(true);
  }, [workflowContexts]);

  // AI Template Generator Handler
  const handleGenerateTemplate = useCallback(() => {
    setAiGeneratorModalOpen(true);
  }, []);

  // Handle AI-generated template
  const handleAITemplateGenerated = useCallback(async (generatedTemplate) => {
    try {
      // Add to context templates
      const newTemplates = [...contextTemplates, generatedTemplate];
      setContextTemplates(newTemplates);
      
      // Save to localStorage
      const customTemplates = newTemplates.filter(t => !t.isBuiltIn);
      localStorage.setItem('vocelio-context-templates', JSON.stringify(customTemplates));
      
      // Log AI generation activity
      await contextAPI.logActivity('ai-template-generated', {
        templateName: generatedTemplate.name,
        industry: generatedTemplate.generationParams?.industry,
        role: generatedTemplate.generationParams?.role,
        qualityScore: generatedTemplate.quality_score
      });
      
      showNotification(`🤖 AI generated "${generatedTemplate.name}" template!`, 'success');
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Failed to save AI-generated template:', error);
      showNotification('Failed to save AI-generated template', 'error');
    }
  }, [contextTemplates, showNotification]);

  // Context Inheritance Manager Handler
  const handleOpenInheritanceManager = useCallback(() => {
    setInheritanceManagerOpen(true);
  }, []);

  // Context Optimization Handler
  const handleOptimizeContext = useCallback(async (contextId, optimizationGoals) => {
    try {
      setSyncStatus('syncing');
      
      const contextToOptimize = workflowContexts[contextId];
      if (!contextToOptimize?.context) {
        showNotification('No context found to optimize', 'warning');
        return;
      }

      // Use AI to optimize the context
      const optimization = await contextIntelligence.optimizeExistingContext(
        contextToOptimize.context,
        optimizationGoals || ['Improve clarity', 'Enhance conversion rate', 'Better user experience']
      );

      if (optimization.success) {
        // Update the context with the optimized version
        await updateWorkflowContext(contextId, {
          context: optimization.optimized_context,
          optimizationHistory: [
            ...(contextToOptimize.optimizationHistory || []),
            {
              timestamp: new Date().toISOString(),
              originalLength: contextToOptimize.context.length,
              optimizedLength: optimization.optimized_context.length,
              improvements: optimization.improvements_made,
              goals: optimizationGoals
            }
          ]
        });

        await contextAPI.logActivity('context-ai-optimized', {
          contextId,
          contextName: contextToOptimize.name,
          improvements: optimization.improvements_made,
          goals: optimizationGoals
        });

        setSyncStatus('success');
        showNotification(`🚀 Context optimized with AI! ${optimization.improvements_made.length} improvements made.`, 'success');
      } else {
        setSyncStatus('error');
        showNotification('AI optimization failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Context optimization failed:', error);
      setSyncStatus('error');
      showNotification('Failed to optimize context. Please check your connection.', 'error');
    }
  }, [workflowContexts, updateWorkflowContext, showNotification]);

  // Performance Analytics Handler
  const handleAnalyzePerformance = useCallback(() => {
    if (contextIntelligence && contextUsageData.length > 0) {
      const analytics = contextIntelligence.analyzeContextPerformance(
        workflowContexts,
        contextUsageData
      );
      
      setPerformanceMetrics(analytics);
      showNotification('📊 Performance analysis complete!', 'success');
      return analytics;
    }
    return null;
  }, [workflowContexts, contextUsageData, showNotification]);

  // Real-time Collaboration Setup
  useEffect(() => {
    // Setup real-time connection for team collaboration
    const ws = contextAPI.setupRealtimeSync({
      onConnect: () => {
        setRealtimeConnection(ws);
        showNotification('🔗 Connected to team workspace', 'success');
      },
      onDisconnect: () => {
        setRealtimeConnection(null);
        showNotification('🔌 Disconnected from team workspace', 'warning');
      },
      onGlobalPromptUpdate: (data) => {
        setGlobalPrompt(data.prompt);
        showNotification(`📝 Global prompt updated by ${data.updatedBy}`, 'info');
      },
      onWorkflowContextUpdate: (data) => {
        setWorkflowContexts(prev => ({
          ...prev,
          [data.workflowId]: data.context
        }));
        showNotification(`🎭 Workflow "${data.context.name}" updated by ${data.updatedBy}`, 'info');
      },
      onTemplateCreated: (data) => {
        setContextTemplates(prev => [...prev, data.template]);
        showNotification(`📚 New template "${data.template.name}" shared by ${data.createdBy}`, 'info');
      },
      onUserOnline: (data) => {
        setTeamMembers(prev => prev.map(member => 
          member.id === data.userId ? { ...member, isOnline: true, lastSeen: new Date() } : member
        ));
      },
      onUserOffline: (data) => {
        setTeamMembers(prev => prev.map(member => 
          member.id === data.userId ? { ...member, isOnline: false, lastSeen: new Date() } : member
        ));
      }
    });

    // Load team members
    contextAPI.getTeamMembers().then(result => {
      if (result.success) {
        setTeamMembers(result.data.members || []);
      }
    });

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('🌐 Back online - syncing data...', 'success');
      // Trigger sync when coming back online
      syncAllData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('📴 Working offline - changes will sync when reconnected', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      ws?.close();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync all data with API
  const syncAllData = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      setSyncStatus('syncing');
      
      // Load latest data from API
      const [globalPromptResult, workflowContextsResult, templatesResult] = await Promise.all([
        contextAPI.getGlobalPrompt(),
        contextAPI.getWorkflowContexts(),
        contextAPI.getTemplateLibrary()
      ]);

      // Update state with latest data
      if (globalPromptResult.success && !globalPromptResult.isOffline) {
        setGlobalPrompt(globalPromptResult.data.prompt);
      }
      
      if (workflowContextsResult.success && !workflowContextsResult.isOffline) {
        setWorkflowContexts(workflowContextsResult.data.contexts || {});
      }
      
      if (templatesResult.success && !templatesResult.isOffline) {
        const customTemplates = templatesResult.data.templates.filter(t => !t.isBuiltIn);
        setContextTemplates(prev => [...getBuiltInTemplates(), ...customTemplates]);
      }

      setLastSyncTime(new Date().toISOString());
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  }, [isOnline, getBuiltInTemplates]);

  // Test API connection
  const testAPIConnection = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const result = await contextAPI.testConnection();
      
      if (result.success) {
        setSyncStatus('success');
        showNotification('✅ API connection successful!', 'success');
        return result.connectionInfo;
      } else {
        setSyncStatus('error');
        showNotification('❌ API connection failed: ' + result.error, 'error');
        return null;
      }
    } catch (error) {
      setSyncStatus('error');
      showNotification('❌ API connection error: ' + error.message, 'error');
      return null;
    }
  }, [showNotification]);

  // Sidebar items
  const sidebarItems = [
    { icon: '📋', label: 'Node Library', action: () => setTemplateBrowserOpen(true) },
    { icon: '🗂️', label: 'Flow Templates', action: () => setFlowTemplateBrowserOpen(true) },
    { icon: '⚙️', label: 'Manage Templates', action: () => setFlowTemplateManagerOpen(true) },
    { icon: '🌍', label: 'Global Prompt', action: () => showModal('globalPrompt') },
    { icon: '🎭', label: 'Workflow Contexts', action: () => setWorkflowContextModalOpen(true) },
    { icon: '📚', label: 'Context Library', action: () => setContextLibraryOpen(true) },
    { icon: '👥', label: 'Team Collaboration', action: () => showModal('teamCollaboration') },
    { icon: '🔄', label: 'Sync Status', action: () => testAPIConnection() },
    { icon: '🎯', label: 'Feature Flags', action: () => {} },
    { icon: '🧪', label: 'Test Pathway', action: () => showModal('testPathway') },
    { icon: '📞', label: 'Send Call', action: () => showModal('sendCall') },
    { icon: '🌐', label: 'Web Client', action: () => showModal('webClient') },
    { icon: '🚀', label: 'Promote to Production', action: () => showModal('promoteProduction') },
    { icon: '📊', label: 'Flow Analytics', action: () => setAnalyticsOpen(true) },
    { icon: '👥', label: 'Collaborate', action: () => setCollaborationOpen(true) },
    { icon: '🧠', label: 'AI Optimizer', action: () => setAiOptimizerOpen(true) },
    { icon: '⚡', label: 'Advanced Nodes', action: () => setAdvancedNodesOpen(true) },
    { icon: '📈', label: 'Context Analytics', action: handleOpenAnalytics },
    { icon: '🤖', label: 'AI Template Gen', action: handleGenerateTemplate },
    { icon: '🧬', label: 'Context Inheritance', action: handleOpenInheritanceManager },
    { icon: '🎯', label: 'AI Optimize Context', action: () => handleOptimizeContext(currentWorkflowId) }
  ];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50/20'}`}>
      {/* Notifications */}
      <FlowDesignerNotifications notifications={notifications} />

      {/* Header with integrated sidebar functionality */}
      <FlowDesignerHeader
        isDarkMode={isDarkMode}
        copyId={copyId}
        showModal={showModal}
        performAutoLayout={performAutoLayout}
        exportFlow={exportFlow}
        setFlowTemplateBrowserOpen={setFlowTemplateBrowserOpen}
        setAnalyticsOpen={setAnalyticsOpen}
        setCollaborationOpen={setCollaborationOpen}
        setAiOptimizerOpen={setAiOptimizerOpen}
        setAdvancedNodesOpen={setAdvancedNodesOpen}
        executionMonitorVisible={executionMonitorVisible}
        setExecutionMonitorVisible={setExecutionMonitorVisible}
        setShowAdvancedPanel={setShowAdvancedPanel}
        setAdvancedTab={setAdvancedTab}
        sidebarItems={sidebarItems}
      />

      {/* Main Content - Full width canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Container - Enable scrolling for complex workflows */}
        <div className="flex-1 relative">
          {/* Canvas Controls */}
          <FlowDesignerCanvasControls
            isDarkMode={isDarkMode}
            currentZoom={currentZoom}
            minimapVisible={minimapVisible}
            layersVisible={layersVisible}
            historyVisible={historyVisible}
            nodes={nodes}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetZoom={resetZoom}
            toggleFullscreen={toggleFullscreen}
            toggleMinimap={toggleMinimap}
            toggleGrid={toggleGrid}
            toggleLayers={toggleLayers}
            toggleHistory={toggleHistory}
            toggleDarkMode={toggleDarkMode}
          />

          {/* React Flow Canvas - Optimized for complex workflows */}
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(event, node) => {
                setCurrentEditingNode(node.id);
                setActiveModal('editNode');
                setNodeForm({
                  name: node.data?.label || '',
                  type: node.type || 'default',
                  prompt: node.data?.content || '',
                  plainText: node.data?.plainText || '',
                  loopCondition: node.data?.loopCondition || '',
                  temperature: node.data?.temperature || 0.5,
                  staticText: node.data?.staticText || false,
                  globalNode: node.data?.globalNode || false,
                  skipResponse: node.data?.skipResponse || false,
                  blockInterruptions: node.data?.blockInterruptions || false,
                  disableRecording: node.data?.disableRecording || false
                });
              }}
              onInit={setReactFlowInstance}
              onMove={(event, viewport) => {
                setCurrentZoom(viewport.zoom);
              }}
              nodeTypes={nodeTypes}
              attributionPosition="bottom-left"
              className={isDarkMode ? 'dark' : ''}
              defaultViewport={{ x: 0, y: 0, zoom: currentZoom }}
              minZoom={0.1}
              maxZoom={4}
              deleteKeyCode={['Backspace', 'Delete']}
              multiSelectionKeyCode={['Meta', 'Ctrl']}
              panOnScroll={true}
              selectionOnDrag={false}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              zoomOnDoubleClick={false}
              translateExtent={[[-5000, -5000], [5000, 5000]]}
              nodeExtent={[[-5000, -5000], [5000, 5000]]}
              preventScrolling={false}
            >
              <MiniMap 
                nodeStrokeColor={(n) => {
                  if (n.type === 'Start') return '#10b981';
                  if (n.type === 'End') return '#ef4444';
                  return '#3b82f6';
                }}
                nodeColor={(n) => {
                  if (n.type === 'Start') return '#d1fae5';
                  if (n.type === 'End') return '#fee2e2';
                  return '#dbeafe';
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
                className={`${minimapVisible ? 'block' : 'hidden'} ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} rounded-lg`}
              />
              
              <Controls 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg`}
                showZoom={true}
                showFitView={true}
                showInteractive={true}
              />
              
              <Background 
                variant={gridVisible ? "lines" : "dots"}
                gap={gridVisible ? 20 : 32}
                size={gridVisible 
                  ? (isDarkMode ? 0.8 : 1.2) 
                  : (isDarkMode ? 1.2 : 2.5)
                }
                color={gridVisible 
                  ? (isDarkMode ? "#4b5563" : "#94a3b8") 
                  : (isDarkMode ? "#374151" : "#64748b")
                }
                className={isDarkMode ? "bg-gray-900" : "bg-white"}
                style={{
                  opacity: gridVisible 
                    ? (isDarkMode ? 0.6 : 0.4) 
                    : (isDarkMode ? 0.8 : 0.6)
                }}
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Primary Node Creation */}
      <div className="fixed bottom-8 right-8 z-30 group">
        <button
          onClick={() => showModal('addNode')}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 backdrop-blur-xl border border-white/20 relative"
          title="Add New Node"
        >
          <Plus size={28} className="drop-shadow-sm" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Add New Node
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Command Palette */}
      <FlowDesignerCommandPalette
        isDarkMode={isDarkMode}
        isVisible={commandPaletteVisible}
        onClose={() => setCommandPaletteVisible(false)}
        commandSearchRef={commandSearchRef}
      />

      {/* Modals */}
      {activeModal === 'addNode' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border backdrop-blur-xl ${
            isDarkMode ? 'bg-gray-800/95 border-gray-600/50' : 'bg-white/95 border-gray-200/50'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700/50 bg-gray-700/30' : 'border-gray-200/50 bg-gray-50/60'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Create New Node</h2>
              <button onClick={closeModal} className={`p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 ${
                isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className={`flex border-b ${
              isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
            }`}>
              {['featured', 'library'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 border-b-2 transition-all duration-200 font-semibold ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : isDarkMode 
                        ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/30' 
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  {tab === 'featured' ? 'Featured Nodes' : 'Node Library'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'featured' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(NodeTypeConfig).map(([nodeType, config]) => (
                    <div
                      key={nodeType}
                      onClick={() => addNewNode(nodeType)}
                      className={`border-2 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center text-white`}>
                          {config.icon}
                        </div>
                        <div className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{nodeType}</div>
                      </div>
                      <div className={`text-sm mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>{config.description}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {config.category}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Node Library - Coming Soon</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Node Modal */}
      {activeModal === 'editNode' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={`rounded-3xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border backdrop-blur-xl ${
            isDarkMode ? 'bg-gray-800/95 border-gray-600/50' : 'bg-white/95 border-gray-200/50'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700/50 bg-gray-700/30' : 'border-gray-200/50 bg-gray-50/60'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Edit Node</h2>
              <button onClick={closeModal} className={`p-2.5 rounded-xl transition-all duration-200 transform hover:scale-110 ${
                isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Node Type</label>
                <select 
                  value={nodeForm.type}
                  onChange={(e) => setNodeForm({...nodeForm, type: e.target.value})}
                  className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                >
                  <option>Large Text</option>
                  <option>Small Text</option>
                  <option>Collect Info</option>
                  <option>Decision</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Name:</label>
                <input
                  type="text"
                  value={nodeForm.name}
                  onChange={(e) => setNodeForm({...nodeForm, name: e.target.value})}
                  placeholder="Enter node name"
                  className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${nodeForm.staticText ? 'bg-blue-600' : 'bg-gray-300'}`}
                     onClick={() => setNodeForm({...nodeForm, staticText: !nodeForm.staticText})}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${nodeForm.staticText ? 'translate-x-6' : 'translate-x-0.5'} translate-y-0.5`} />
                </div>
                <label className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Static Text (When you want the agent to say a specific dialogue. Uncheck to use AI generated text)</label>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Prompt:</label>
                <textarea
                  value={nodeForm.prompt}
                  onChange={(e) => setNodeForm({...nodeForm, prompt: e.target.value})}
                  placeholder="Enter the prompt for this node..."
                  className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none h-32 resize-vertical ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Paste Plain Text Content:</label>
                <textarea
                  value={nodeForm.plainText}
                  onChange={(e) => setNodeForm({...nodeForm, plainText: e.target.value})}
                  placeholder="Enter plain text content that the agent should say..."
                  className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none h-32 resize-vertical ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Loop Condition</label>
                <textarea
                  value={nodeForm.loopCondition}
                  onChange={(e) => setNodeForm({...nodeForm, loopCondition: e.target.value})}
                  placeholder="Describe the condition for when the agent should move to the next node..."
                  className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none h-24 resize-vertical ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Voice & Audio Settings */}
              <VoiceSelector
                voiceTier={nodeForm.voiceTier}
                setVoiceTier={(tier) => setNodeForm({...nodeForm, voiceTier: tier})}
                selectedVoice={nodeForm.voice}
                setSelectedVoice={(voice) => setNodeForm({...nodeForm, voice: voice})}
                availableVoices={availableVoices}
                onLoadVoices={loadVoices}
                isLoading={loadingVoices}
                onEnableAudio={enableAudioContext}
                showTestCall={true}
                testPhoneNumber="+1234567890" // You can make this configurable
                className="mb-6"
              />

              {/* Input Collection Settings */}
              <div className={`rounded-lg p-4 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Input Collection Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Input Type</label>
                    <select 
                      value={nodeForm.inputType || 'speech'}
                      onChange={(e) => setNodeForm({...nodeForm, inputType: e.target.value})}
                      className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="speech">Speech Input</option>
                      <option value="dtmf">DTMF (Keypad)</option>
                      <option value="both">Both Speech & DTMF</option>
                      <option value="none">No Input Required</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Timeout (seconds)</label>
                    <input
                      type="number"
                      value={nodeForm.timeout || 5}
                      onChange={(e) => setNodeForm({...nodeForm, timeout: parseInt(e.target.value)})}
                      min="1"
                      max="30"
                      className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Max Retries</label>
                    <input
                      type="number"
                      value={nodeForm.retries || 3}
                      onChange={(e) => setNodeForm({...nodeForm, retries: parseInt(e.target.value)})}
                      min="0"
                      max="5"
                      className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Max Input Length (seconds)</label>
                    <input
                      type="number"
                      value={nodeForm.maxLength || 30}
                      onChange={(e) => setNodeForm({...nodeForm, maxLength: parseInt(e.target.value)})}
                      min="1"
                      max="120"
                      className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {nodeForm.inputType !== 'speech' && nodeForm.inputType !== 'none' && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Validation Pattern (DTMF)</label>
                    <input
                      type="text"
                      value={nodeForm.validationPattern || ''}
                      onChange={(e) => setNodeForm({...nodeForm, validationPattern: e.target.value})}
                      placeholder="e.g., \\d{4} for 4 digits, [1-9] for numbers 1-9"
                      className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Timing & Behavior Controls */}
              <div className={`rounded-lg p-6 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Timing & Behavior Controls</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Skip Response */}
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        nodeForm.skipResponse 
                          ? 'bg-blue-600 border-blue-600' 
                          : isDarkMode 
                            ? 'border-gray-600 bg-gray-800' 
                            : 'border-gray-300 bg-white'
                      }`}
                      onClick={() => setNodeForm({...nodeForm, skipResponse: !nodeForm.skipResponse})}>
                      {nodeForm.skipResponse && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <label className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Skip Response</label>
                  </div>

                  {/* Block Interruptions */}
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        nodeForm.blockInterruptions 
                          ? 'bg-blue-600 border-blue-600' 
                          : isDarkMode 
                            ? 'border-gray-600 bg-gray-800' 
                            : 'border-gray-300 bg-white'
                      }`}
                      onClick={() => setNodeForm({...nodeForm, blockInterruptions: !nodeForm.blockInterruptions})}>
                      {nodeForm.blockInterruptions && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <label className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Block Interruptions</label>
                  </div>

                  {/* Disable Recording */}
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        nodeForm.disableRecording 
                          ? 'bg-blue-600 border-blue-600' 
                          : isDarkMode 
                            ? 'border-gray-600 bg-gray-800' 
                            : 'border-gray-300 bg-white'
                      }`}
                      onClick={() => setNodeForm({...nodeForm, disableRecording: !nodeForm.disableRecording})}>
                      {nodeForm.disableRecording && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <label className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Disable Recording</label>
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className={`rounded-lg p-6 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Advanced Options</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Global Node</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Make this node accessible from any other node</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${nodeForm.globalNode ? 'bg-blue-600' : 'bg-gray-300'}`}
                         onClick={() => setNodeForm({...nodeForm, globalNode: !nodeForm.globalNode})}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${nodeForm.globalNode ? 'translate-x-6' : 'translate-x-0.5'} translate-y-0.5`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Temperature (0.0 to 1.0)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={nodeForm.temperature}
                        onChange={(e) => setNodeForm({...nodeForm, temperature: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{nodeForm.temperature}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Skip User's Response</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Continue immediately without waiting for user response</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${nodeForm.skipResponse ? 'bg-blue-600' : 'bg-gray-300'}`}
                         onClick={() => setNodeForm({...nodeForm, skipResponse: !nodeForm.skipResponse})}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${nodeForm.skipResponse ? 'translate-x-6' : 'translate-x-0.5'} translate-y-0.5`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Block Interruptions</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Ignore user's interruptions at this node</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${nodeForm.blockInterruptions ? 'bg-blue-600' : 'bg-gray-300'}`}
                         onClick={() => setNodeForm({...nodeForm, blockInterruptions: !nodeForm.blockInterruptions})}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${nodeForm.blockInterruptions ? 'translate-x-6' : 'translate-x-0.5'} translate-y-0.5`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Disable Recording</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Disable call recording for PCI compliance</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${nodeForm.disableRecording ? 'bg-blue-600' : 'bg-gray-300'}`}
                         onClick={() => setNodeForm({...nodeForm, disableRecording: !nodeForm.disableRecording})}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${nodeForm.disableRecording ? 'translate-x-6' : 'translate-x-0.5'} translate-y-0.5`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                  }}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    saveNode();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Prompt Modal */}
      {activeModal === 'globalPrompt' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Global Prompt and Logs</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>## **AGENT IDENTITY & ROLE**</h3>
                <div className="flex items-center gap-3">
                  {/* Sync Status Indicator */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800' :
                    syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                    syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {syncStatus === 'syncing' && <span className="animate-spin">⟳</span>}
                    {syncStatus === 'success' && <span>✓</span>}
                    {syncStatus === 'error' && <span>⚠</span>}
                    {syncStatus === 'idle' && <span>○</span>}
                    <span className="text-xs">
                      {syncStatus === 'syncing' ? 'Syncing...' :
                       syncStatus === 'success' ? 'Synced' :
                       syncStatus === 'error' ? 'Offline' : 'Local'}
                    </span>
                    {lastSyncTime && syncStatus === 'success' && (
                      <span className="text-xs opacity-75">
                        {new Date(lastSyncTime).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  <div className={`text-sm px-3 py-1 rounded-full ${
                    globalPrompt.length > 2000 
                      ? 'bg-red-100 text-red-800' 
                      : globalPrompt.length > 1500 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {globalPrompt.length} characters
                  </div>
                </div>
              </div>
              
              <p className={`text-sm mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                This global context defines your AI agent's identity and will be included in all conversations across all workflows. 
                You can reference variables using {`{{variable_name}}`} notation.
              </p>
              
              <textarea
                value={globalPrompt}
                onChange={handleGlobalPromptChange}
                className={`w-full h-64 p-4 border-2 rounded-lg focus:border-blue-500 outline-none resize-vertical transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter the global context and identity for your AI agent..."
              />
              
              {globalPrompt.length > 2000 && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Warning: Very long prompts may affect AI response quality. Consider using shorter, more focused descriptions.
                </p>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  onClick={() => {
                    // Compress prompt feature - placeholder for future AI compression
                    showNotification('Prompt compression feature coming soon!', 'info');
                  }}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Compress Prompt
                </button>
                <button
                  onClick={closeModal}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveGlobalPrompt}
                  disabled={!globalPrompt.trim()}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    globalPrompt.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Global Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Call Modal */}
      {activeModal === 'sendCall' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Send a Call with your pathway now!</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Load Configuration</label>
                <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}>
                  <option>Select a configuration</option>
                  <option>Production Config</option>
                  <option>Test Config</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Phone number</label>
                <div className="flex gap-3">
                  <select className={`w-20 p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    <option>🇺🇸 +1</option>
                    <option>🇬🇧 +44</option>
                    <option>🇨🇦 +1</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className={`flex-1 p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div className="mt-2">
                  <label className={`flex items-center gap-2 text-sm cursor-pointer ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    <input type="checkbox" className="rounded" />
                    Use my phone number
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Start Node</label>
                  <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    <option>Select Node</option>
                    <option>Start</option>
                    <option>Introduction</option>
                    <option>Technology</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Version</label>
                  <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    <option>Version 1</option>
                  </select>
                </div>
              </div>

              {/* Voice Selection for Call */}
              <VoiceSelector
                voiceTier={globalVoiceSettings.voiceTier}
                setVoiceTier={(tier) => setGlobalVoiceSettings(prev => ({ ...prev, voiceTier: tier }))}
                selectedVoice={globalVoiceSettings.selectedVoice}
                setSelectedVoice={(voice) => setGlobalVoiceSettings(prev => ({ ...prev, selectedVoice: voice }))}
                availableVoices={availableVoices}
                onLoadVoices={loadVoices}
                isLoading={loadingVoices}
                onEnableAudio={enableAudioContext}
                showTestCall={true}
                testPhoneNumber="+1234567890"
                className="mb-4"
              />

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Timezone</label>
                  <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    <option>America/Los_Angeles</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Interruption Threshold: <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>100 ms</span></label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  defaultValue="100"
                  className="w-full"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>MetaData</label>
                <textarea
                  placeholder="Add any additional information you want to associate with the call..."
                  className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none h-24 resize-vertical ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={startCall}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Pathway Modal */}
      {activeModal === 'testPathway' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Test Pathway</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Load Configuration</label>
                <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}>
                  <option>Select a configuration</option>
                  <option>Test Configuration</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Start Node</label>
                <p className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Choose which Node to start testing from. Default node will be the Start Node.</p>
                <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}>
                  <option>Select Node</option>
                  <option>Start</option>
                  <option>Introduction</option>
                  <option>Technology</option>
                </select>
              </div>

              {/* Voice Selection for Testing */}
              <VoiceSelector
                voiceTier={globalVoiceSettings.voiceTier}
                setVoiceTier={(tier) => setGlobalVoiceSettings(prev => ({ ...prev, voiceTier: tier }))}
                selectedVoice={globalVoiceSettings.selectedVoice}
                setSelectedVoice={(voice) => setGlobalVoiceSettings(prev => ({ ...prev, selectedVoice: voice }))}
                availableVoices={availableVoices}
                onLoadVoices={loadVoices}
                isLoading={loadingVoices}
                onEnableAudio={enableAudioContext}
                showTestCall={false}
                className="mb-4"
              />

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Request Data</label>
                <p className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Variables the agent has access to, and can be referenced using {`{{variable_name}}`} notation</p>
                <button className={`px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  + Key/Value
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-6 bg-blue-600 rounded-full cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-6 translate-y-0.5" />
                  </div>
                  <div>
                    <label className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Run Unit Test</label>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Check instruction following</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-6 bg-gray-300 rounded-full cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-0.5 translate-y-0.5" />
                  </div>
                  <label className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Use Candidate Model</label>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Save Configuration</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Config Name"
                    className={`flex-1 p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button className={`px-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Save
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={testPathway}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Pathway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Web Client Modal */}
      {activeModal === 'webClient' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Web Client</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="flex h-[600px]">
              {/* Left Panel - Configuration */}
              <div className={`w-1/3 border-r p-6 space-y-6 overflow-y-auto ${
                isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Pathway</label>
                      <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}>
                        <option>Vocelio SalesBot - Version 1</option>
                        <option>Customer Support Bot</option>
                        <option>Lead Qualifier Bot</option>
                      </select>
                    </div>

                    {/* Voice Selection for Web Client */}
                    <div className="mb-6">
                      <VoiceSelector
                        voiceTier={globalVoiceSettings.voiceTier}
                        setVoiceTier={(tier) => setGlobalVoiceSettings(prev => ({ ...prev, voiceTier: tier }))}
                        selectedVoice={globalVoiceSettings.selectedVoice}
                        setSelectedVoice={(voice) => setGlobalVoiceSettings(prev => ({ ...prev, selectedVoice: voice }))}
                        availableVoices={availableVoices}
                        onLoadVoices={loadVoices}
                        isLoading={loadingVoices}
                        onEnableAudio={enableAudioContext}
                        showTestCall={false}
                        className="max-h-60"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Language</label>
                      <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}>
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Start Node</label>
                      <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}>
                        <option>Start (Default)</option>
                        <option>Introduction</option>
                        <option>Technology Demo</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <h4 className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Client Settings</h4>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-6 bg-blue-600 rounded-full cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full translate-x-6 translate-y-0.5" />
                        </div>
                        <label className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Auto-play responses</label>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-6 bg-gray-300 rounded-full cursor-pointer">
                          <div className="w-5 h-5 bg-white rounded-full translate-x-0.5 translate-y-0.5" />
                        </div>
                        <label className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Show transcripts</label>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Custom Variables</label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input type="text" placeholder="Key" className={`flex-1 p-2 border rounded text-sm ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`} />
                          <input type="text" placeholder="Value" className={`flex-1 p-2 border rounded text-sm ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`} />
                        </div>
                        <button className="text-sm text-blue-600 hover:underline">+ Add Variable</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Chat Interface */}
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="border-b p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Vocelio AI Assistant</h3>
                      <p className="text-sm opacity-90">Sales & Lead Generation Bot</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm">Online</span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className={`flex-1 p-4 overflow-y-auto space-y-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  {/* Welcome Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      AI
                    </div>
                    <div className={`rounded-lg p-3 shadow-sm max-w-md ${
                      isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}>
                      <p className="text-sm">
                        Hello! I'm Alex from Vocelio AI. Thanks for taking the time to chat with me today. 
                        I'd love to tell you about how we help businesses automate their customer conversations. 
                        Would you like to hear more about our services?
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button className={`p-1 rounded transition-colors ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}>
                          <Play size={14} className="text-blue-600" />
                        </button>
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>0:03</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample User Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-600 text-white rounded-lg p-3 shadow-sm max-w-md">
                      <p className="text-sm">
                        Yes, I'd like to learn more. What exactly does Vocelio AI do?
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      U
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      AI
                    </div>
                    <div className={`rounded-lg p-3 shadow-sm max-w-md ${
                      isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}>
                      <p className="text-sm">
                        Great question! Vocelio AI is a specialized conversational automation platform that helps businesses 
                        handle customer interactions automatically. We work with companies to set up intelligent chat systems 
                        that can qualify leads, book appointments, and provide customer support 24/7. 
                        What type of business are you in?
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button className={`p-1 rounded transition-colors ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}>
                          <Play size={14} className="text-blue-600" />
                        </button>
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>0:12</span>
                      </div>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      AI
                    </div>
                    <div className={`rounded-lg p-3 shadow-sm ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className={`border-t p-4 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className={`flex-1 p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Send
                    </button>
                  </div>
                  
                  <div className={`flex items-center justify-between mt-3 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-4">
                      <span>🎤 Voice input available</span>
                      <span>⌨️ Press Enter to send</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`border-t p-4 flex items-center justify-between ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`flex items-center gap-4 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span>Session ID: abc123xyz</span>
                <span>Duration: 2:34</span>
                <span>Messages: 4</span>
              </div>
              
              <div className="flex gap-2">
                <button className={`px-4 py-2 border rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Export Chat
                </button>
                <button className={`px-4 py-2 border rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Reset Session
                </button>
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promote to Production Modal */}
      {activeModal === 'promoteProduction' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Promote to Production</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className={`mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Are you sure you want to promote your staging pathway to production? Your staging environment will remain available for further changes.
              </p>
              <p className={`text-sm mb-6 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                The current production version will be saved under: Previously Published Pathway
              </p>

              <div className={`rounded-lg p-6 mb-6 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`font-semibold text-lg mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Nodes</h3>
                
                <div className="mb-4">
                  <h4 className="text-green-600 font-medium mb-2">✓ Added (1)</h4>
                  <ul className={`ml-5 space-y-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <li>• Unnamed</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="text-yellow-600 font-medium mb-2">⟳ Modified (15)</h4>
                  <ul className={`ml-5 space-y-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <li>• Start - 3 changes (Default)</li>
                    <li>• End call - 0 changes (End Call)</li>
                    <li>• User busy - 2 changes (Default)</li>
                    <li>• Introducing our technology - 1 change (Default)</li>
                    <li>• KB - 3 changes (Knowledge Base)</li>
                    <li>• Thanks - 0 changes (Default)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={promoteToProduction}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Promote to Production
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className={`fixed bottom-0 left-0 right-0 h-8 border-t flex items-center justify-between px-5 text-xs z-10 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-300' 
          : 'bg-gray-50 border-gray-200 text-gray-700'
      }`}>
        <div className="flex gap-5">
          <span>Nodes: {nodes.length}</span>
          <span>Connections: 5</span>
          <span>Auto-saved 30s ago</span>
        </div>
        <div className="flex gap-5">
          <span>Performance: Good</span>
          <span>Users: 3 online</span>
          <span>Version 1.0</span>
        </div>
      </div>
      
      {/* Phase 3 Advanced Features Panel */}
      {showAdvancedPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`w-full max-w-4xl h-3/4 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Advanced Features - Phase 3
              </h2>
              <button
                onClick={() => setShowAdvancedPanel(false)}
                className={`p-1 rounded hover:${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                } ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAdvancedTab('voice')}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    advancedTab === 'voice'
                      ? isDarkMode 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 text-green-900'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Headphones size={16} className="inline mr-1" />
                  Voice Controls
                </button>
                <button
                  onClick={() => setAdvancedTab('compliance')}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    advancedTab === 'compliance'
                      ? isDarkMode 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-100 text-purple-900'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield size={16} className="inline mr-1" />
                  Compliance
                </button>
                <button
                  onClick={() => setAdvancedTab('collaboration')}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    advancedTab === 'collaboration'
                      ? isDarkMode 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-orange-100 text-orange-900'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Activity size={16} className="inline mr-1" />
                  Collaboration
                </button>
              </div>
              
              <div className="h-96 overflow-auto">
                <React.Suspense fallback={
                  <div className={`flex items-center justify-center h-full ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Loading advanced features...
                  </div>
                }>
                  <Phase3FlowBuilderEnhancements 
                    activeTab={advancedTab}
                    isDarkMode={isDarkMode}
                    nodes={nodes}
                    edges={edges}
                    currentEditingNode={currentEditingNode}
                    onNodeFocus={(nodeId) => {
                      // Focus on specific node - could implement node selection/highlighting
                      const targetNode = nodes.find(n => n.id === nodeId);
                      if (targetNode) {
                        setCurrentEditingNode(nodeId);
                        // Optionally center the view on the node
                        if (reactFlowInstance) {
                          reactFlowInstance.setCenter(
                            targetNode.position.x + 50,
                            targetNode.position.y + 50,
                            { zoom: 1.2 }
                          );
                        }
                      }
                    }}
                    onClose={() => setShowAdvancedPanel(false)}
                  />
                </React.Suspense>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Template Browser */}
      <NodeTemplateBrowser
        isDarkMode={isDarkMode}
        isOpen={templateBrowserOpen}
        onTemplateSelect={handleTemplateSelect}
        onClose={() => setTemplateBrowserOpen(false)}
      />

      {/* Flow Template Browser */}
      <FlowTemplateBrowser
        isDarkMode={isDarkMode}
        isOpen={flowTemplateBrowserOpen}
        onTemplateSelect={handleFlowTemplateSelect}
        onClose={() => setFlowTemplateBrowserOpen(false)}
      />

      {/* Flow Template Manager */}
      {flowTemplateManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`w-full max-w-7xl h-5/6 rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <FlowTemplateManager
              isDarkMode={isDarkMode}
              onClose={() => setFlowTemplateManagerOpen(false)}
              onTemplateCreate={(template) => {
                // Handle template creation
                showNotification(`Template "${template.name}" created successfully!`, 'success');
              }}
              onTemplateImport={(template) => {
                // Handle template import
                showNotification(`Template "${template.name}" imported successfully!`, 'success');
              }}
              onTemplateEdit={(template) => {
                // Handle template edit
                showNotification(`Template "${template.name}" updated successfully!`, 'success');
              }}
            />
          </div>
        </div>
      )}

      {/* Flow Analytics Dashboard */}
      {analyticsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`w-full max-w-7xl h-5/6 rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="h-full flex flex-col">
              {/* Modal Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Flow Analytics Dashboard
                </h2>
                <button
                  onClick={() => setAnalyticsOpen(false)}
                  className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Analytics Content */}
              <div className="flex-1 overflow-hidden">
                <FlowAnalyticsDashboard
                  flowId="current-flow"
                  timeRange="7d"
                  onFlowSelect={(flowId) => {
                    showNotification(`Selected flow: ${flowId}`, 'info');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flow Collaboration Panel */}
      {collaborationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`w-full max-w-5xl h-5/6 rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="h-full flex flex-col">
              {/* Modal Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Flow Collaboration
                </h2>
                <button
                  onClick={() => setCollaborationOpen(false)}
                  className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Collaboration Content */}
              <div className="flex-1 overflow-auto p-6">
                <FlowCollaboration
                  flowId="current-flow"
                  currentUser={currentUser}
                  onUserAction={(action, data) => {
                    showNotification(`Collaboration: ${action}`, 'info');
                    console.log('Collaboration action:', action, data);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Flow Optimizer Panel */}
      {aiOptimizerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`w-full max-w-6xl h-5/6 rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="h-full flex flex-col">
              {/* Modal Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  AI Flow Optimizer
                </h2>
                <button
                  onClick={() => setAiOptimizerOpen(false)}
                  className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* AI Optimizer Content */}
              <div className="flex-1 overflow-auto">
                <AIFlowOptimizer
                  flowData={{
                    nodes: nodes,
                    edges: edges,
                    metadata: {
                      flowName: 'Current Voice Flow',
                      version: '1.0.0',
                      lastModified: new Date().toISOString()
                    }
                  }}
                  onOptimizationApply={(optimization) => {
                    showNotification(`Applied: ${optimization.title}`, 'success');
                    console.log('Applied optimization:', optimization);
                    
                    // Here you would apply the actual optimization changes
                    // For example, reorder nodes, update prompts, etc.
                    if (optimization.changes) {
                      optimization.changes.forEach(change => {
                        console.log('Applying change:', change);
                        // Apply the change based on change.action
                      });
                    }
                  }}
                  onAnalysisUpdate={(results) => {
                    console.log('AI Analysis results:', results);
                    // You can store or display analysis results as needed
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Node Types Manager */}
      {advancedNodesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`w-full max-w-6xl h-5/6 rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className="h-full flex flex-col">
              {/* Modal Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Advanced Node Types
                </h2>
                <button
                  onClick={() => setAdvancedNodesOpen(false)}
                  className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Advanced Node Types Content */}
              <div className="flex-1 overflow-auto">
                <AdvancedNodeTypesManager
                  onNodeCreate={(node) => {
                    console.log('Creating advanced node:', node);
                    
                    // Add the new advanced node to the flow
                    const newNode = {
                      id: node.id,
                      type: node.name,
                      data: {
                        label: node.name,
                        nodeType: node.id,
                        config: node.config,
                        category: node.category,
                        description: node.description,
                        inputs: node.inputs,
                        outputs: node.outputs
                      },
                      position: { 
                        x: Math.random() * 400 + 100, 
                        y: Math.random() * 300 + 100 
                      },
                    };
                    
                    setNodes((nds) => [...nds, newNode]);
                    setAdvancedNodesOpen(false);
                    showNotification(`Advanced node "${node.name}" created successfully!`, 'success');
                  }}
                  onNodeUpdate={(nodeId, config) => {
                    console.log('Updating advanced node:', nodeId, config);
                    
                    // Update existing node configuration
                    setNodes((nds) => 
                      nds.map((node) => 
                        node.id === nodeId 
                          ? { ...node, data: { ...node.data, config } }
                          : node
                      )
                    );
                    showNotification(`Node configuration updated!`, 'success');
                  }}
                  onNodeDelete={(nodeId) => {
                    console.log('Deleting advanced node:', nodeId);
                    
                    // Remove node from flow
                    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
                    setEdges((eds) => eds.filter((edge) => 
                      edge.source !== nodeId && edge.target !== nodeId
                    ));
                    showNotification(`Node deleted successfully!`, 'success');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 ADVANCED FEATURES MODALS - AI Intelligence & Analytics */}
      
      {/* Context Analytics Dashboard */}
      <ContextAnalyticsDashboard
        isVisible={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        contexts={workflowContexts}
        usageData={contextUsageData}
        onOptimizeContext={handleOptimizeContext}
        onGenerateTemplate={handleGenerateTemplate}
      />

      {/* AI Template Generator */}
      <AITemplateGenerator
        isVisible={aiGeneratorModalOpen}
        onClose={() => setAiGeneratorModalOpen(false)}
        onTemplateGenerated={handleAITemplateGenerated}
        contextIntelligence={contextIntelligence}
      />

      {/* Context Inheritance Manager */}
      <ContextInheritanceManager
        isVisible={inheritanceManagerOpen}
        onClose={() => setInheritanceManagerOpen(false)}
        globalPrompt={globalPrompt}
        workflowContexts={workflowContexts}
        selectedWorkflow={currentWorkflowId}
        onUpdateContext={(mergedContext) => {
          updateWorkflowContext(currentWorkflowId, { context: mergedContext });
          showNotification('🧬 Context inheritance applied successfully!', 'success');
          setInheritanceManagerOpen(false);
        }}
        contextIntelligence={contextIntelligence}
      />

      {/* Node Template Browser */}
      <NodeTemplateBrowser
        isDarkMode={isDarkMode}
        isOpen={templateBrowserOpen}
        onTemplateSelect={(templateNode) => {
          // Find a suitable position for the new node
          const existingNodes = nodes;
          const xOffset = 100 + (existingNodes.length * 50);
          const yOffset = 100 + (existingNodes.length * 30);
          
          const newNode = {
            ...templateNode,
            position: { x: xOffset, y: yOffset }
          };
          
          setNodes(prevNodes => [...prevNodes, newNode]);
          setNodeCounter(prev => prev + 1);
          setTemplateBrowserOpen(false);
          
          // Show success notification
          const notification = {
            id: Date.now(),
            type: 'success',
            message: `Template "${newNode.data.label}" added successfully!`
          };
          setNotifications(prev => [...prev, notification]);
          
          // Auto-remove notification after 3 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, 3000);
        }}
        onClose={() => setTemplateBrowserOpen(false)}
      />

      {/* Flow Template Browser */}
      <FlowTemplateBrowser
        isDarkMode={isDarkMode}
        isOpen={flowTemplateBrowserOpen}
        onTemplateSelect={(flowTemplate) => {
          try {
            // Replace current flow with template
            setNodes(flowTemplate.nodes);
            setEdges(flowTemplate.edges);
            setFlowTemplateBrowserOpen(false);
            
            // Show success notification
            const notification = {
              id: Date.now(),
              type: 'success',
              message: `Flow template "${flowTemplate.name}" loaded successfully!`
            };
            setNotifications(prev => [...prev, notification]);
            
            // Auto-remove notification after 3 seconds
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, 3000);
          } catch (error) {
            console.error('Error loading flow template:', error);
            showNotification('Failed to load flow template', 'error');
          }
        }}
        onClose={() => setFlowTemplateBrowserOpen(false)}
      />

      {/* Flow Template Manager */}
      {flowTemplateManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`w-full max-w-7xl h-5/6 rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <FlowTemplateManager
              isDarkMode={isDarkMode}
              onClose={() => setFlowTemplateManagerOpen(false)}
              onTemplateCreate={(template) => {
                // Handle template creation
                showNotification(`Template "${template.name}" created successfully!`, 'success');
              }}
              onTemplateImport={(template) => {
                // Handle template import
                showNotification(`Template "${template.name}" imported successfully!`, 'success');
              }}
              onTemplateEdit={(template) => {
                // Handle template edit
                showNotification(`Template "${template.name}" updated successfully!`, 'success');
              }}
            />
          </div>
        </div>
      )}

      {/* Workflow Context Management Modal */}
      {workflowContextModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) setWorkflowContextModalOpen(false);
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>🎭 Workflow Context Management</h2>
              <button 
                onClick={() => setWorkflowContextModalOpen(false)} 
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Workflows */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Current Workflows</h3>
                    <button
                      onClick={() => {
                        const name = prompt('Enter workflow name:');
                        if (name) {
                          const type = prompt('Enter workflow type (sales/support/technical/general):', 'general');
                          createNewWorkflow(name, type || 'general');
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      + New Workflow
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(workflowContexts).map(([workflowId, workflow]) => (
                      <div
                        key={workflowId}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          currentWorkflowId === workflowId
                            ? isDarkMode 
                              ? 'border-blue-500 bg-blue-900/20' 
                              : 'border-blue-500 bg-blue-50'
                            : isDarkMode 
                              ? 'border-gray-600 bg-gray-700 hover:border-gray-500' 
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentWorkflowId(workflowId)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{workflow.name}</h4>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>Type: {workflow.type}</p>
                            {workflow.context && (
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                {workflow.context.length} characters
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {workflow.isActive && (
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete workflow "${workflow.name}"?`)) {
                                  deleteWorkflowContext(workflowId);
                                }
                              }}
                              className={`p-1 rounded hover:bg-red-100 text-red-500 transition-colors`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {Object.keys(workflowContexts).length === 0 && (
                      <div className={`text-center py-8 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <p>No workflows created yet.</p>
                        <p className="text-sm mt-2">Click "New Workflow" to get started!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Context Editor */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {getCurrentWorkflowContext() ? `Edit: ${getCurrentWorkflowContext().name}` : 'Select a Workflow'}
                  </h3>

                  {getCurrentWorkflowContext() ? (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Workflow Description</label>
                        <input
                          type="text"
                          value={getCurrentWorkflowContext().description || ''}
                          onChange={(e) => updateWorkflowContext(currentWorkflowId, { description: e.target.value })}
                          placeholder="Describe this workflow's purpose..."
                          className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Workflow-Specific Context</label>
                        <textarea
                          value={getCurrentWorkflowContext().context || ''}
                          onChange={(e) => updateWorkflowContext(currentWorkflowId, { context: e.target.value })}
                          placeholder="Enter context specific to this workflow... This will be combined with your global prompt."
                          className={`w-full h-64 p-4 border-2 rounded-lg focus:border-blue-500 outline-none resize-vertical ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                        <p className={`text-sm mt-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {(getCurrentWorkflowContext().context || '').length} characters | This context will be added to your global prompt when this workflow runs.
                        </p>
                      </div>

                      {/* Context Preview */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Combined Context Preview</label>
                        <div className={`p-4 border-2 rounded-lg h-32 overflow-y-auto text-sm ${
                          isDarkMode 
                            ? 'bg-gray-900 border-gray-600 text-gray-300' 
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}>
                          <pre className="whitespace-pre-wrap">{getCombinedContext(currentWorkflowId)}</pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-16 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <p>Select a workflow from the left to edit its context</p>
                      <p className="text-sm mt-2">or create a new workflow to get started</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                <button
                  onClick={() => setWorkflowContextModalOpen(false)}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    saveWorkflowContexts();
                    setWorkflowContextModalOpen(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save All Contexts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Library Modal */}
      {contextLibraryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) setContextLibraryOpen(false);
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>📚 Context Library</h2>
              <button 
                onClick={() => setContextLibraryOpen(false)} 
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search templates by name, description, or tags..."
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="all">All Categories</option>
                    <option value="industry">Industry Templates</option>
                    <option value="role">Role-Based Templates</option>
                    <option value="personality">Personality Templates</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Library */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Available Templates ({getFilteredTemplates().length})</h3>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredTemplates().map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? isDarkMode 
                              ? 'border-blue-500 bg-blue-900/20' 
                              : 'border-blue-500 bg-blue-50'
                            : isDarkMode 
                              ? 'border-gray-600 bg-gray-700 hover:border-gray-500' 
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{template.name}</h4>
                              {template.isBuiltIn && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  Built-in
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                template.category === 'industry' ? 'bg-blue-100 text-blue-700' :
                                template.category === 'role' ? 'bg-purple-100 text-purple-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {template.category}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>{template.description}</p>
                            {template.tags && (
                              <div className="flex flex-wrap gap-1">
                                {template.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className={`px-2 py-1 text-xs rounded ${
                                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {template.popularity && (
                              <div className="mt-2 text-xs text-green-600">
                                ⭐ {template.popularity}% popularity
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {getFilteredTemplates().length === 0 && (
                      <div className={`text-center py-8 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <p>No templates found matching your search.</p>
                        <p className="text-sm mt-2">Try adjusting your search or category filter.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Template Preview & Actions */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedTemplate ? `Preview: ${selectedTemplate.name}` : 'Select a Template'}
                  </h3>

                  {selectedTemplate ? (
                    <div className="space-y-4">
                      {/* Template Details */}
                      <div className={`p-4 rounded-lg border ${
                        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Template Information</h4>
                        <p className={`text-sm mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <strong>Category:</strong> {selectedTemplate.category}
                        </p>
                        <p className={`text-sm mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <strong>Description:</strong> {selectedTemplate.description}
                        </p>
                        {selectedTemplate.tags && (
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <strong>Tags:</strong> {selectedTemplate.tags.join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Context Preview */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Context Content</label>
                        <div className={`p-4 border-2 rounded-lg h-64 overflow-y-auto text-sm ${
                          isDarkMode 
                            ? 'bg-gray-900 border-gray-600 text-gray-300' 
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}>
                          <pre className="whitespace-pre-wrap">{selectedTemplate.context}</pre>
                        </div>
                        <p className={`text-xs mt-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {selectedTemplate.context.length} characters
                        </p>
                      </div>

                      {/* Apply to Workflow */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>Apply to Workflow</label>
                        <div className="flex gap-2">
                          <select
                            className={`flex-1 p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-200 text-gray-900'
                            }`}
                            onChange={(e) => {
                              if (e.target.value) {
                                applyTemplateToWorkflow(selectedTemplate.id, e.target.value);
                                e.target.value = ''; // Reset selection
                              }
                            }}
                          >
                            <option value="">Select a workflow...</option>
                            {Object.entries(workflowContexts).map(([id, workflow]) => (
                              <option key={id} value={id}>{workflow.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const workflowName = prompt('Enter new workflow name:');
                              if (workflowName) {
                                const newWorkflowId = createNewWorkflow(workflowName, selectedTemplate.category);
                                applyTemplateToWorkflow(selectedTemplate.id, newWorkflowId);
                              }
                            }}
                            className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                              isDarkMode 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            Create New
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-16 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <p>Select a template from the left to preview its content</p>
                      <p className="text-sm mt-2">and apply it to your workflows</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    // Future: Open template creation modal
                    showNotification('Custom template creation coming soon!', 'info');
                  }}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Create Custom
                </button>
                <button
                  onClick={() => setContextLibraryOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Collaboration Modal */}
      {activeModal === 'teamCollaboration' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className={`rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>👥 Team Collaboration</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Connection Status */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Connection Status</h3>
                  
                  <div className="space-y-4">
                    {/* API Status */}
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          API Connection
                        </span>
                        <div className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                          isOnline && syncStatus === 'success' ? 'bg-green-100 text-green-800' :
                          syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            isOnline && syncStatus === 'success' ? 'bg-green-500' :
                            syncStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></span>
                          {isOnline && syncStatus === 'success' ? 'Connected' :
                           syncStatus === 'error' ? 'Disconnected' : 'Connecting...'}
                        </div>
                      </div>
                      {lastSyncTime && (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last sync: {new Date(lastSyncTime).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Real-time Status */}
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Real-time Sync
                        </span>
                        <div className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                          realtimeConnection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            realtimeConnection ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {realtimeConnection ? 'Active' : 'Disconnected'}
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {realtimeConnection ? 'Receiving live updates from team' : 'Working in offline mode'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={testAPIConnection}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Test Connection
                      </button>
                      <button
                        onClick={syncAllData}
                        disabled={!isOnline}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                          !isOnline 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isDarkMode 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        Sync Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Team Members ({teamMembers.length})</h3>
                    <button
                      onClick={() => {
                        const email = prompt('Enter email address to invite:');
                        if (email) {
                          contextAPI.inviteTeamMember(email).then(result => {
                            if (result.success) {
                              showNotification(`Invitation sent to ${email}!`, 'success');
                            } else {
                              showNotification('Failed to send invitation', 'error');
                            }
                          });
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      + Invite Member
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {teamMembers.length > 0 ? teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                              member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}>
                              {member.avatar || member.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {member.name || 'Unknown User'}
                              </h4>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {member.email || 'No email'}
                              </p>
                              {member.role && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {member.role}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-2 text-sm ${
                              member.isOnline ? 'text-green-600' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`}></span>
                              {member.isOnline ? 'Online' : 'Offline'}
                            </div>
                            {member.lastSeen && !member.isOnline && (
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Last seen: {new Date(member.lastSeen).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>No team members yet.</p>
                        <p className="text-sm mt-2">Invite team members to collaborate on contexts!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t">
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Quick Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      contextAPI.exportAllData().then(data => {
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `vocelio-contexts-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        showNotification('Contexts exported successfully!', 'success');
                      });
                    }}
                    className={`p-4 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm opacity-75">Download all contexts</div>
                  </button>

                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const data = JSON.parse(e.target.result);
                              contextAPI.importData(data).then(result => {
                                if (result.success) {
                                  showNotification('Data imported successfully!', 'success');
                                  syncAllData();
                                } else {
                                  showNotification('Import failed', 'error');
                                }
                              });
                            } catch (error) {
                              showNotification('Invalid file format', 'error');
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className={`p-4 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-2xl mb-2">📥</div>
                    <div className="font-medium">Import Data</div>
                    <div className="text-sm opacity-75">Upload context backup</div>
                  </button>

                  <button
                    onClick={() => {
                      contextAPI.getActivityLog().then(result => {
                        if (result.success) {
                          console.log('Activity Log:', result.data);
                          showNotification('Activity log downloaded to console', 'info');
                        }
                      });
                    }}
                    className={`p-4 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium">Activity Log</div>
                    <div className="text-sm opacity-75">View team changes</div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                <button
                  onClick={closeModal}
                  className={`px-6 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocelioAIPlatform;