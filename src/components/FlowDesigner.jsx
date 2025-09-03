import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import modular components (lazy loaded for performance)
// Note: FlowSidebar functionality moved to FlowHeader dropdowns
import FlowHeader from './FlowComponents/FlowHeader';
import NodePalette from './FlowComponents/NodePalette';

// Custom node types
import { nodeTypes } from './FlowComponents/FlowNodes';

// Import hooks
import { useFlowBackend } from '../hooks/useFlowBackend';
import { useNotifications } from '../hooks/useNotifications';

// Lazy load heavy components for better performance
const AnalyticsPanel = React.lazy(() => import('./FlowComponents/AnalyticsPanel'));
const CollaborationPanel = React.lazy(() => import('./FlowComponents/CollaborationPanel'));
const AIOptimizerPanel = React.lazy(() => import('./FlowComponents/AIOptimizerPanel'));

const FlowDesigner = () => {
  // Performance-optimized state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowInstance, setFlowInstance] = useState(null);
  
  // UI state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Flow metadata
  const [flowName, setFlowName] = useState('New Call Flow');
  const [flowVersion, setFlowVersion] = useState('1.0');
  const [flowStatus, setFlowStatus] = useState('draft'); // draft, testing, production
  
  // Custom hooks for backend integration
  const { saveFlow, loadFlow, testFlow, executeFlow, isLoading } = useFlowBackend();
  const { showNotification } = useNotifications();

  // Node update handler
  const handleNodeUpdate = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  // Node delete handler
  const handleNodeDelete = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    showNotification('Node deleted', 'success');
    setSelectedNode(null);
  }, [setNodes, setEdges, showNotification]);

  // Node play/test handlers
  const handleNodePlay = useCallback((message) => {
    console.log('Playing message:', message);
    showNotification('Playing message...', 'info');
  }, [showNotification]);

  const handleNodeTest = useCallback((data) => {
    console.log('Testing node:', data);
    showNotification('Testing node...', 'info');
  }, [showNotification]);

  // Drag and Drop handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      
      if (typeof nodeType === 'undefined' || !nodeType) {
        return;
      }

      const position = flowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: `${nodeType}_${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
          onUpdate: handleNodeUpdate,
          onPlay: handleNodePlay,
          onTest: handleNodeTest,
          onDelete: handleNodeDelete
        },
      };

      setNodes((nds) => nds.concat(newNode));
      showNotification(`${nodeType} node added`, 'success');
    },
    [flowInstance, setNodes, showNotification, handleNodeUpdate, handleNodePlay, handleNodeTest, handleNodeDelete]
  );
  
  // Performance optimization: memoize expensive callbacks
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ 
          ...params, 
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#3b82f6', strokeWidth: 2 }
        }, eds)
      ),
    [setEdges]
  );
  
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);
  
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  // Memoized node types to prevent unnecessary re-renders
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  
  // Auto-save flow (debounced)
  const autoSaveFlow = useCallback(
    debounce(async () => {
      if (nodes.length > 0 || edges.length > 0) {
        try {
          await saveFlow({
            name: flowName,
            version: flowVersion,
            nodes,
            edges,
            status: flowStatus
          });
          showNotification('Flow auto-saved', 'success');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 2000),
    [nodes, edges, flowName, flowVersion, flowStatus, saveFlow, showNotification]
  );
  
  useEffect(() => {
    autoSaveFlow();
  }, [autoSaveFlow]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleSaveFlow();
            break;
          case 'z':
            event.preventDefault();
            // Implement undo
            break;
          case 'y':
            event.preventDefault();
            // Implement redo
            break;
        }
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode && selectedNode.id) {
          event.preventDefault();
          handleNodeDelete(selectedNode.id);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedNode, handleNodeDelete]);
  
  // Flow actions
  const handleSaveFlow = useCallback(async () => {
    try {
      await saveFlow({
        name: flowName,
        version: flowVersion,
        nodes,
        edges,
        status: flowStatus
      });
      showNotification('Flow saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save flow', 'error');
    }
  }, [flowName, flowVersion, nodes, edges, flowStatus, saveFlow, showNotification]);
  
  const handleTestFlow = useCallback(async () => {
    try {
      const result = await testFlow({ nodes, edges });
      showNotification('Flow test completed', 'success');
      setActivePanel('analytics');
    } catch (error) {
      showNotification('Flow test failed', 'error');
    }
  }, [nodes, edges, testFlow, showNotification]);
  
  const handleExecuteFlow = useCallback(async (phoneNumber) => {
    try {
      await executeFlow({ 
        nodes, 
        edges, 
        phoneNumber,
        flowName,
        version: flowVersion 
      });
      showNotification(`Call started to ${phoneNumber}`, 'success');
    } catch (error) {
      showNotification('Failed to start call', 'error');
    }
  }, [nodes, edges, flowName, flowVersion, executeFlow, showNotification]);
  
  return (
    <div className={`h-full flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Panel - Node Palette */}
      <NodePalette 
        isDarkMode={isDarkMode}
        onNodeDrag={(nodeType) => {
          // Handle node drag from palette - this will be handled by onDrop
        }}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with integrated sidebar functionality */}
        <FlowHeader
          flowName={flowName}
          setFlowName={setFlowName}
          flowVersion={flowVersion}
          flowStatus={flowStatus}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onSave={handleSaveFlow}
          onTest={handleTestFlow}
          showMinimap={showMinimap}
          setShowMinimap={setShowMinimap}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          isLoading={isLoading}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          selectedNode={selectedNode}
          onTestFlow={handleTestFlow}
          onExecuteFlow={handleExecuteFlow}
        />
        
        {/* ReactFlow Canvas */}
        <div className="flex-1 relative"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setFlowInstance}
            nodeTypes={memoizedNodeTypes}
            fitView
            attributionPosition="bottom-right"
            className={isDarkMode ? 'dark' : ''}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.2}
            maxZoom={2}
            snapToGrid={showGrid}
            snapGrid={[15, 15]}
          >
            <Controls className={isDarkMode ? 'dark' : ''} />
            {showMinimap && (
              <MiniMap 
                className={isDarkMode ? 'dark' : ''}
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'say': return '#10b981';
                    case 'collect': return '#3b82f6';
                    case 'decision': return '#f59e0b';
                    case 'end': return '#ef4444';
                    default: return '#6b7280';
                  }
                }}
                nodeStrokeWidth={3}
                nodeBorderRadius={8}
              />
            )}
            {showGrid && (
              <Background 
                color={isDarkMode ? '#374151' : '#e5e7eb'} 
                gap={15} 
                size={1}
              />
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Additional Right Panel - Analytics/Collaboration/AI Optimizer (overlay when active) */}
      {activePanel && (
        <div className={`fixed top-16 right-4 w-80 h-[calc(100vh-5rem)] border rounded-lg shadow-xl z-40 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <React.Suspense fallback={
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading...</p>
            </div>
          }>
            {activePanel === 'analytics' && <AnalyticsPanel />}
            {activePanel === 'collaboration' && <CollaborationPanel />}
            {activePanel === 'optimizer' && <AIOptimizerPanel />}
          </React.Suspense>
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default FlowDesigner;
