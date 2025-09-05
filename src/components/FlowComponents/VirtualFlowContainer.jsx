import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState } from 'reactflow';
import performanceManager, { useFlowPerformance } from './FlowPerformanceManager';

// Virtual Flow Container - Handles 10k+ customers with millions of nodes
const VirtualFlowContainer = memo(({ 
  initialNodes = [], 
  initialEdges = [], 
  nodeTypes = {},
  onNodeClick,
  onConnect,
  className = ""
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [viewportNodes, setViewportNodes] = useState([]);
  const [performanceMode, setPerformanceMode] = useState('auto');
  
  const { getMetrics, shouldAnimate } = useFlowPerformance('flow-container', false);

  // Viewport-based virtualization - only render visible nodes
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  
  // Calculate visible nodes based on viewport
  const calculateVisibleNodes = useCallback((allNodes, viewport) => {
    const { x, y, zoom } = viewport;
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;
    
    // Add padding for smooth scrolling
    const padding = 500;
    const viewportBounds = {
      left: -x - padding,
      right: -x + viewportWidth + padding,
      top: -y - padding,
      bottom: -y + viewportHeight + padding
    };
    
    return allNodes.filter(node => {
      const nodeX = node.position?.x || 0;
      const nodeY = node.position?.y || 0;
      const nodeWidth = node.width || 300;
      const nodeHeight = node.height || 200;
      
      return (
        nodeX + nodeWidth >= viewportBounds.left &&
        nodeX <= viewportBounds.right &&
        nodeY + nodeHeight >= viewportBounds.top &&
        nodeY <= viewportBounds.bottom
      );
    });
  }, []);

  // Update visible nodes when viewport changes
  useEffect(() => {
    const visible = calculateVisibleNodes(nodes, viewport);
    setViewportNodes(visible);
  }, [nodes, viewport, calculateVisibleNodes]);

  // Performance-aware node types
  const optimizedNodeTypes = useMemo(() => {
    const metrics = getMetrics();
    const highPerformanceMode = metrics?.nodeCount > 5000;
    
    return Object.entries(nodeTypes).reduce((acc, [key, Component]) => {
      acc[key] = memo((props) => (
        <Component 
          {...props} 
          performanceMode={highPerformanceMode}
          shouldAnimate={shouldAnimate && !highPerformanceMode}
        />
      ));
      return acc;
    }, {});
  }, [nodeTypes, getMetrics, shouldAnimate]);

  // Throttled viewport update
  const handleMove = useCallback((event, newViewport) => {
    // Throttle viewport updates for better performance
    const now = Date.now();
    if (!handleMove.lastUpdate || now - handleMove.lastUpdate > 16) { // ~60fps
      setViewport(newViewport);
      handleMove.lastUpdate = now;
    }
  }, []);

  // Performance monitoring
  const [performanceStats, setPerformanceStats] = useState(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getMetrics();
      setPerformanceStats(stats);
      
      // Auto-adjust performance mode
      if (stats.nodeCount > 10000 && performanceMode === 'auto') {
        setPerformanceMode('high-performance');
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [getMetrics, performanceMode]);

  // Memoized ReactFlow props
  const flowProps = useMemo(() => ({
    nodes: performanceMode === 'high-performance' ? viewportNodes : nodes,
    edges: edges,
    nodeTypes: optimizedNodeTypes,
    onNodesChange,
    onEdgesChange,
    onMove: handleMove,
    onNodeClick,
    onConnect,
    // Performance optimizations
    snapToGrid: true,
    snapGrid: [15, 15],
    defaultViewport: { x: 0, y: 0, zoom: 0.8 },
    // Disable expensive features in high-performance mode
    nodesDraggable: performanceMode !== 'high-performance',
    nodesConnectable: true,
    elementsSelectable: true,
    // Optimize re-renders
    maxZoom: 2,
    minZoom: 0.1,
    // Reduce DOM updates
    deleteKeyCode: 'Delete',
    selectKeyCode: null
  }), [
    nodes, viewportNodes, edges, optimizedNodeTypes, performanceMode,
    onNodesChange, onEdgesChange, handleMove, onNodeClick, onConnect
  ]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Performance Stats Overlay */}
      {performanceStats && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border text-xs">
          <div className="font-semibold text-gray-700 mb-2">Performance Monitor</div>
          <div className="space-y-1 text-gray-600">
            <div>Nodes: <span className="font-mono">{performanceStats.nodeCount.toLocaleString()}</span></div>
            <div>Visible: <span className="font-mono">{viewportNodes.length.toLocaleString()}</span></div>
            <div>Memory: <span className="font-mono">{performanceStats.memoryUsage.total}</span></div>
            <div>Mode: <span className={`font-mono ${
              performanceMode === 'high-performance' ? 'text-orange-600' : 'text-green-600'
            }`}>{performanceMode}</span></div>
            <div>Rating: <span className={`font-mono ${
              performanceStats.performance.includes('Excellent') ? 'text-green-600' :
              performanceStats.performance.includes('Good') ? 'text-blue-600' :
              performanceStats.performance.includes('Fair') ? 'text-yellow-600' : 'text-red-600'
            }`}>{performanceStats.performance}</span></div>
          </div>
        </div>
      )}

      {/* Performance Mode Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <select
          value={performanceMode}
          onChange={(e) => setPerformanceMode(e.target.value)}
          className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm border shadow-sm"
        >
          <option value="auto">Auto Performance</option>
          <option value="beauty">Beauty Mode (&lt; 1k nodes)</option>
          <option value="balanced">Balanced (&lt; 5k nodes)</option>
          <option value="high-performance">High Performance (10k+ nodes)</option>
        </select>
      </div>

      {/* Main Flow Container */}
      <ReactFlow {...flowProps} className="bg-gray-50">
        {/* Custom controls for large flows */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
          <div className="text-xs text-gray-600 mb-2">Flow Controls</div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewport({ x: 0, y: 0, zoom: 0.1 })}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
            >
              Fit All
            </button>
            <button 
              onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
              className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
});

VirtualFlowContainer.displayName = 'VirtualFlowContainer';

export default VirtualFlowContainer;
