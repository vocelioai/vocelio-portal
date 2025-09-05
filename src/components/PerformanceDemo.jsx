import React, { useState, useEffect, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import VirtualFlowContainer from './FlowComponents/VirtualFlowContainer';
import SayNodePerformance from './FlowComponents/FlowNodes/SayNode.Performance';
import CollectNodePerformance from './FlowComponents/FlowNodes/CollectNode.Performance';
import performanceManager from './FlowComponents/FlowPerformanceManager';

// Performance Demonstration Component
const PerformanceDemo = () => {
  const [nodeCount, setNodeCount] = useState(100);
  const [testRunning, setTestRunning] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Generate test nodes
  const generateNodes = useMemo(() => {
    const nodes = [];
    const gridSize = Math.ceil(Math.sqrt(nodeCount));
    
    for (let i = 0; i < nodeCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      nodes.push({
        id: `node-${i}`,
        type: i % 2 === 0 ? 'say' : 'collect',
        position: { 
          x: col * 350, 
          y: row * 250 
        },
        data: {
          message: `Test message ${i}`,
          voice: 'default',
          prompt: `Test prompt ${i}`,
          inputType: 'DTMF'
        }
      });
    }
    
    return nodes;
  }, [nodeCount]);

  // Generate test edges
  const generateEdges = useMemo(() => {
    const edges = [];
    
    for (let i = 0; i < nodeCount - 1; i++) {
      if (Math.random() > 0.3) { // 70% connection rate
        edges.push({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`,
          animated: nodeCount < 1000 // Only animate edges for small flows
        });
      }
    }
    
    return edges;
  }, [nodeCount]);

  // Performance monitoring
  useEffect(() => {
    if (!testRunning) return;
    
    const interval = setInterval(() => {
      const currentMetrics = performanceManager.getMetrics();
      setMetrics(currentMetrics);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [testRunning]);

  // Start performance test
  const startTest = () => {
    setTestRunning(true);
    
    // Simulate customer load
    setTimeout(() => {
      console.log(`Performance test completed with ${nodeCount} nodes`);
      setTestRunning(false);
    }, 30000); // 30 second test
  };

  const nodeTypes = {
    say: SayNodePerformance,
    collect: CollectNodePerformance
  };

  return (
    <div className="w-full h-screen bg-gray-100">
      {/* Control Panel */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-lg shadow-lg p-4 border">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🚀 Production Scale Performance Demo</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Node Count (Simulating {Math.floor(nodeCount / 10)} customers)
            </label>
            <input
              type="range"
              min="10"
              max="10000"
              step="10"
              value={nodeCount}
              onChange={(e) => setNodeCount(parseInt(e.target.value))}
              className="w-32"
              disabled={testRunning}
            />
            <div className="text-sm text-gray-600">{nodeCount.toLocaleString()} nodes</div>
          </div>
          
          <div>
            <button
              onClick={startTest}
              disabled={testRunning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                testRunning 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {testRunning ? 'Testing...' : 'Start Performance Test'}
            </button>
          </div>
        </div>

        {/* Real-time Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-semibold text-blue-800">Performance</div>
              <div className={`${
                metrics.performance.includes('Excellent') ? 'text-green-600' :
                metrics.performance.includes('Good') ? 'text-blue-600' :
                metrics.performance.includes('Fair') ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.performance}
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-semibold text-green-800">Memory Usage</div>
              <div className="text-green-600">{metrics.memoryUsage.total}</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-semibold text-purple-800">Active Nodes</div>
              <div className="text-purple-600">{metrics.nodeCount.toLocaleString()}</div>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="font-semibold text-orange-800">Animations</div>
              <div className="text-orange-600">{metrics.animationsRunning}</div>
            </div>
          </div>
        )}

        {/* Scale Examples */}
        <div className="mt-4 text-xs text-gray-600">
          <div className="font-medium mb-1">Scale Examples:</div>
          <div>• 100 nodes = 10 customers with complex flows</div>
          <div>• 1,000 nodes = 100 customers with medium flows</div>
          <div>• 10,000 nodes = 1,000 customers with simple flows</div>
          <div>• 50,000 nodes = 10,000 customers with basic flows</div>
        </div>
      </div>

      {/* Flow Container */}
      <ReactFlowProvider>
        <VirtualFlowContainer
          initialNodes={generateNodes}
          initialEdges={generateEdges}
          nodeTypes={nodeTypes}
          className="w-full h-full"
        />
      </ReactFlowProvider>

      {/* Performance Indicators */}
      <div className="absolute bottom-4 right-4 z-20 bg-white rounded-lg shadow-lg p-3 border text-sm">
        <div className="font-semibold text-gray-800 mb-2">Live Performance</div>
        <div className="space-y-1">
          <div>Nodes: <span className="font-mono text-blue-600">{nodeCount.toLocaleString()}</span></div>
          <div>Status: <span className={`font-mono ${testRunning ? 'text-green-600' : 'text-gray-600'}`}>
            {testRunning ? 'Testing...' : 'Ready'}
          </span></div>
          {nodeCount > 10000 && (
            <div className="text-orange-600 font-medium">⚡ High Performance Mode Active</div>
          )}
          {nodeCount > 25000 && (
            <div className="text-red-600 font-medium">🚀 Enterprise Virtualization Required</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDemo;
