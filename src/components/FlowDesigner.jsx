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
  Plus, X, Play
} from 'lucide-react';

// Import extracted components
import FlowDesignerHeader from './FlowDesigner/FlowDesignerHeader';
import FlowDesignerCanvasControls from './FlowDesigner/FlowDesignerCanvasControls';
import FlowDesignerNotifications from './FlowDesigner/FlowDesignerNotifications';
import FlowDesignerCommandPalette from './FlowDesigner/FlowDesignerCommandPalette';

  // Import our new schema and components
  import { NodeTypeConfig } from '../lib/flowSchemas';
  import { migrateLegacyFlow, autoLayoutNodes, exportFlowToJSON } from '../lib/flowMigration';
  import { nodeTypes } from '../components/FlowNodes';
  import { railwayFlowAPI } from '../lib/railwayFlowAPI';
  import ExecutionMonitor from '../components/ExecutionMonitor';
  import NodeTemplateBrowser from '../components/NodeTemplateBrowser';
  import FlowTemplateBrowser from '../components/FlowTemplateBrowser';
  import FlowTemplateManager from '../components/FlowTemplateManager';
  import FlowAnalyticsDashboard from '../components/FlowAnalyticsDashboard';
  import FlowCollaboration from '../components/FlowCollaboration';
  import AIFlowOptimizer from '../components/AIFlowOptimizer';
  import AdvancedNodeTypesManager from '../components/AdvancedNodeTypesManager';

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
  
  // Current user for collaboration
  const [currentUser] = useState({
    id: 'current-user',
    name: 'John Smith',
    email: 'john.smith@vocelio.ai',
    avatar: 'JS',
    role: 'admin',
    color: '#3B82F6'
  });
  
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
    disableRecording: false
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
      disableRecording: false
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

  // Zoom functions
  const zoomIn = useCallback(() => {
    setCurrentZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setCurrentZoom(prev => Math.max(prev / 1.2, 0.3));
  }, []);

  const resetZoom = useCallback(() => {
    setCurrentZoom(1);
  }, []);

  // Toggle functions
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

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

  // Utility functions
  const copyId = useCallback(() => {
    navigator.clipboard.writeText('3e18c41b-1902-48d7-a86e-8e3150e83ae7');
    showNotification('ID copied to clipboard!', 'success');
  }, [showNotification]);

  // Node management
  const editNode = (nodeId) => {
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
        disableRecording: false
      });
      showModal('editNode');
    }
  };

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
          ? { ...node, title: nodeForm.name, content: nodeForm.prompt }
          : node
      ));
      showNotification('Node saved successfully!', 'success');
      closeModal();
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

  // Modal functions
  const showModal = useCallback((modalId) => {
    setActiveModal(modalId);
  }, []);

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

  // Sidebar items
  const sidebarItems = [
    { icon: '🔗', label: 'Add New Node', action: () => showModal('addNode') },
    { icon: '📋', label: 'Node Templates', action: () => setTemplateBrowserOpen(true) },
    { icon: ' ', label: 'Flow Templates', action: () => setFlowTemplateBrowserOpen(true) },
    { icon: '⚙️', label: 'Manage Templates', action: () => setFlowTemplateManagerOpen(true) },
    { icon: ' 🌍', label: 'Global Prompt', action: () => showModal('globalPrompt') },
    { icon: '🎯', label: 'Feature Flags', action: () => {} },
    { icon: '🧪', label: 'Test Pathway', action: () => showModal('testPathway') },
    { icon: '📞', label: 'Send Call', action: () => showModal('sendCall') },
    { icon: '🌐', label: 'Web Client', action: () => showModal('webClient') },
    { icon: '🚀', label: 'Promote to Production', action: () => showModal('promoteProduction') },
    { icon: '📊', label: 'Flow Analytics', action: () => setAnalyticsOpen(true) },
    { icon: '👥', label: 'Collaborate', action: () => setCollaborationOpen(true) },
    { icon: '🧠', label: 'AI Optimizer', action: () => setAiOptimizerOpen(true) },
    { icon: '⚡', label: 'Advanced Nodes', action: () => setAdvancedNodesOpen(true) }
  ];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
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
        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
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

          {/* React Flow Canvas */}
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
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              className={isDarkMode ? 'dark' : ''}
              defaultViewport={{ x: 0, y: 0, zoom: currentZoom }}
              minZoom={0.1}
              maxZoom={2}
              deleteKeyCode={['Backspace', 'Delete']}
              multiSelectionKeyCode={['Meta', 'Ctrl']}
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
                gap={20}
                size={1}
                color={isDarkMode ? "#374151" : "#e5e7eb"}
                className={isDarkMode ? "bg-gray-900" : "bg-gray-50"}
              />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => showModal('addNode')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-30"
      >
        <Plus size={24} />
      </button>

      {/* Command Palette */}
      <FlowDesignerCommandPalette
        isDarkMode={isDarkMode}
        isVisible={commandPaletteVisible}
        onClose={() => setCommandPaletteVisible(false)}
        commandSearchRef={commandSearchRef}
      />

      {/* Modals */}
      {activeModal === 'addNode' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add New Node</h2>
              <button onClick={closeModal} className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <X size={20} />
              </button>
            </div>

            <div className={`flex border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {['featured', 'library'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : isDarkMode 
                        ? 'border-transparent text-gray-400 hover:text-gray-200' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
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
              }`}>Edit Node</h2>
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
                  onClick={saveNode}
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
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>## **AGENT IDENTITY & ROLE**</h3>
              <textarea
                className={`w-full h-64 p-4 border-2 rounded-lg focus:border-blue-500 outline-none resize-vertical ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
                defaultValue={`You are Alex from Vocelio AI, a specialized lead generation and appointment setting company that works exclusively with businesses looking to automate their customer conversations. You are calling business owners, sales managers, and development professionals to introduce them to our services.

You're calling {{customer_name}} because you came across their company and saw they're doing great work and could benefit from conversational AI automation.`}
              />

              <div className="flex gap-3 justify-end mt-6">
                <button className={`px-6 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
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
                  onClick={() => { showNotification('Global prompt saved!', 'success'); closeModal(); }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Voice</label>
                  <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}>
                    <option>june</option>
                    <option>nat</option>
                    <option>alex</option>
                    <option>sarah</option>
                  </select>
                </div>

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

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Voice</label>
                      <select className={`w-full p-3 border-2 rounded-lg focus:border-blue-500 outline-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}>
                        <option>june</option>
                        <option>nat</option>
                        <option>alex</option>
                        <option>sarah</option>
                      </select>
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
                      }`}>Audio Settings</h4>
                      
                      <div>
                        <label className={`block text-sm mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Speech Rate: <span className="text-blue-600">1.0x</span></label>
                        <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full" />
                      </div>

                      <div>
                        <label className={`block text-sm mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Volume: <span className="text-blue-600">80%</span></label>
                        <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
                      </div>

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
    </div>
  );
};

export default VocelioAIPlatform;