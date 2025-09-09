import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play, Pause, Settings, Mail, MessageSquare, Phone, Clock,
  Users, Filter, Zap, GitBranch, Database, Globe, Send,
  Plus, Save, Eye, TestTube, Copy, Trash2, MoreHorizontal
} from 'lucide-react';

// ===== COPILOT PROMPT #6: Visual Campaign Flow Builder =====
// Advanced drag-and-drop campaign workflow designer

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  split: SplitNode,
  merge: MergeNode
};

const CampaignFlowBuilder = ({ campaignId, onSave, onTest, isReadOnly = false }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(false);
  const [flowName, setFlowName] = useState('New Campaign Flow');

  // Initialize with default nodes
  React.useEffect(() => {
    if (nodes.length === 0) {
      const initialNodes = [
        {
          id: '1',
          type: 'trigger',
          position: { x: 250, y: 50 },
          data: { 
            label: 'Campaign Start',
            triggerType: 'manual',
            config: {}
          }
        }
      ];
      setNodes(initialNodes);
    }
  }, [nodes.length, setNodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsPropertiesPanelOpen(true);
  }, []);

  const addNode = useCallback((type) => {
    const newNode = {
      id: `${Date.now()}`,
      type,
      position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      data: getDefaultNodeData(type)
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setIsPropertiesPanelOpen(false);
    }
  }, [setNodes, setEdges, selectedNode]);

  const handleSave = useCallback(() => {
    const flowData = {
      id: campaignId || `flow_${Date.now()}`,
      name: flowName,
      nodes,
      edges,
      updatedAt: new Date().toISOString()
    };
    onSave?.(flowData);
  }, [campaignId, flowName, nodes, edges, onSave]);

  const handleTest = useCallback(() => {
    const flowData = { name: flowName, nodes, edges };
    onTest?.(flowData);
  }, [flowName, nodes, edges, onTest]);

  return (
    <div className="h-screen bg-gray-50 flex">
      <ReactFlowProvider>
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="w-full text-lg font-semibold bg-transparent border-none outline-none"
              placeholder="Flow Name"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <NodePalette onAddNode={addNode} />
            {isPropertiesPanelOpen && selectedNode && (
              <NodePropertiesPanel
                node={selectedNode}
                onUpdate={(data) => updateNodeData(selectedNode.id, data)}
                onDelete={() => deleteNode(selectedNode.id)}
                onClose={() => setIsPropertiesPanelOpen(false)}
              />
            )}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
              disabled={isReadOnly}
            >
              <Save className="h-4 w-4" />
              <span>Save Flow</span>
            </button>
            <button
              onClick={handleTest}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <TestTube className="h-4 w-4" />
              <span>Test Flow</span>
            </button>
          </div>
        </div>

        {/* Main Flow Area */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
            
            {/* Top Toolbar */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-md" title="Zoom In">
                  <Plus className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md" title="Zoom Out">
                  <Plus className="h-4 w-4 rotate-45" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md" title="Fit View">
                  <Eye className="h-4 w-4" />
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <button className="p-2 hover:bg-gray-100 rounded-md" title="Copy">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md" title="Settings">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

// Node Palette Component
const NodePalette = ({ onAddNode }) => {
  const nodeCategories = [
    {
      title: 'Triggers',
      nodes: [
        { type: 'trigger', icon: Play, label: 'Start Trigger', description: 'Campaign start point' },
      ]
    },
    {
      title: 'Actions',
      nodes: [
        { type: 'action', icon: Mail, label: 'Send Email', description: 'Send email message' },
        { type: 'action', icon: MessageSquare, label: 'Send SMS', description: 'Send SMS message' },
        { type: 'action', icon: Phone, label: 'Make Call', description: 'Initiate voice call' },
        { type: 'action', icon: Globe, label: 'Web Action', description: 'Web-based action' },
      ]
    },
    {
      title: 'Logic',
      nodes: [
        { type: 'condition', icon: GitBranch, label: 'Condition', description: 'Branching logic' },
        { type: 'delay', icon: Clock, label: 'Wait', description: 'Time delay' },
        { type: 'split', icon: Filter, label: 'Split Test', description: 'A/B testing' },
      ]
    },
    {
      title: 'Data',
      nodes: [
        { type: 'action', icon: Database, label: 'Update Data', description: 'Update customer data' },
        { type: 'action', icon: Zap, label: 'Webhook', description: 'External API call' },
      ]
    }
  ];

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Node Palette</h3>
      {nodeCategories.map((category) => (
        <div key={category.title} className="mb-6">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            {category.title}
          </h4>
          <div className="space-y-2">
            {category.nodes.map((node) => (
              <button
                key={node.label}
                onClick={() => onAddNode(node.type)}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <node.icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{node.label}</div>
                    <div className="text-xs text-gray-500">{node.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Node Properties Panel
const NodePropertiesPanel = ({ node, onUpdate, onDelete, onClose }) => {
  const [config, setConfig] = useState(node.data.config || {});

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate({ config: newConfig });
  };

  const renderProperties = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
              <select
                value={config.triggerType || 'manual'}
                onChange={(e) => handleConfigChange('triggerType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Manual Start</option>
                <option value="scheduled">Scheduled</option>
                <option value="event">Event-Based</option>
                <option value="api">API Trigger</option>
              </select>
            </div>
            {config.triggerType === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <input
                  type="datetime-local"
                  value={config.schedule || ''}
                  onChange={(e) => handleConfigChange('schedule', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={config.actionType || 'email'}
                onChange={(e) => handleConfigChange('actionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Send Email</option>
                <option value="sms">Send SMS</option>
                <option value="call">Make Call</option>
                <option value="webhook">Webhook</option>
                <option value="update_data">Update Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
              <select
                value={config.template || ''}
                onChange={(e) => handleConfigChange('template', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Template</option>
                <option value="welcome">Welcome Email</option>
                <option value="promo">Promotional SMS</option>
                <option value="reminder">Reminder Call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={config.content || ''}
                onChange={(e) => handleConfigChange('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter message content..."
              />
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition Field</label>
              <select
                value={config.field || ''}
                onChange={(e) => handleConfigChange('field', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Field</option>
                <option value="age">Age</option>
                <option value="location">Location</option>
                <option value="engagement">Engagement Score</option>
                <option value="purchase_history">Purchase History</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="contains">Contains</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter condition value"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delay Duration</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={config.duration || 1}
                  onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <select
                  value={config.unit || 'hours'}
                  onChange={(e) => handleConfigChange('unit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">No properties available</div>;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Node Properties</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-md"
        >
          ×
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Node Name</label>
          <input
            type="text"
            value={node.data.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {renderProperties()}
        <button
          onClick={onDelete}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
};

// Custom Node Components
function TriggerNode({ data, isConnectable }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-100 border-2 border-green-300">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-500 text-white mr-2">
          <Play className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.triggerType}</div>
        </div>
      </div>
    </div>
  );
}

function ActionNode({ data, isConnectable }) {
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'call': return Phone;
      case 'webhook': return Zap;
      default: return Send;
    }
  };

  const Icon = getActionIcon(data.config?.actionType);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-100 border-2 border-blue-300">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-500 text-white mr-2">
          <Icon className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.config?.actionType}</div>
        </div>
      </div>
    </div>
  );
}

function ConditionNode({ data, isConnectable }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-300">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-yellow-500 text-white mr-2">
          <GitBranch className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">
            {data.config?.field} {data.config?.operator} {data.config?.value}
          </div>
        </div>
      </div>
    </div>
  );
}

function DelayNode({ data, isConnectable }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-purple-100 border-2 border-purple-300">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-purple-500 text-white mr-2">
          <Clock className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">
            {data.config?.duration} {data.config?.unit}
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitNode({ data, isConnectable }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-orange-100 border-2 border-orange-300">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-orange-500 text-white mr-2">
          <Filter className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">A/B Test</div>
        </div>
      </div>
    </div>
  );
}

function MergeNode({ data, isConnectable }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gray-100 border-2 border-gray-300">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-gray-500 text-white mr-2">
          <Plus className="h-4 w-4" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">Merge Paths</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get default node data
const getDefaultNodeData = (type) => {
  const defaults = {
    trigger: {
      label: 'New Trigger',
      triggerType: 'manual',
      config: {}
    },
    action: {
      label: 'New Action',
      config: { actionType: 'email' }
    },
    condition: {
      label: 'New Condition',
      config: { field: '', operator: 'equals', value: '' }
    },
    delay: {
      label: 'Wait',
      config: { duration: 1, unit: 'hours' }
    },
    split: {
      label: 'A/B Split',
      config: { splitType: 'random', ratio: 50 }
    },
    merge: {
      label: 'Merge',
      config: {}
    }
  };

  return defaults[type] || { label: 'New Node', config: {} };
};

export default CampaignFlowBuilder;
