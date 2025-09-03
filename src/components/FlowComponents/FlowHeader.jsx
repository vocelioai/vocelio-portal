import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, Play, Square, Eye, EyeOff, Grid, 
  Moon, Sun, Download, Upload, Settings, 
  Zap, Users, BarChart3, TestTube, Phone, 
  Rocket, Brain, Layers, History, ChevronDown,
  Info, X, Clock, CheckCircle, AlertTriangle,
  Copy, Share2, FileText, Trash2
} from 'lucide-react';

const FlowHeader = ({
  flowName,
  setFlowName,
  flowVersion,
  flowStatus,
  isDarkMode,
  setIsDarkMode,
  onSave,
  onTest,
  showMinimap,
  setShowMinimap,
  showGrid,
  setShowGrid,
  isLoading,
  activePanel,
  setActivePanel,
  selectedNode,
  onTestFlow,
  onExecuteFlow
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showPanels, setShowPanels] = useState(false);
  const [showNodeInfo, setShowNodeInfo] = useState(false);
  
  const quickActionsRef = useRef(null);
  const panelsRef = useRef(null);
  const nodeInfoRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
      if (panelsRef.current && !panelsRef.current.contains(event.target)) {
        setShowPanels(false);
      }
      if (nodeInfoRef.current && !nodeInfoRef.current.contains(event.target)) {
        setShowNodeInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickActions = [
    { 
      id: 'test', 
      label: 'Test Flow', 
      icon: TestTube, 
      description: 'Run complete workflow simulation',
      action: () => handleTestFlow()
    },
    { 
      id: 'call', 
      label: 'Live Call Test', 
      icon: Phone, 
      description: 'Execute real call with your number',
      action: () => handleLiveCallTest()
    },
    { 
      id: 'deploy', 
      label: 'Deploy to Production', 
      icon: Rocket,
      description: 'Push flow to live environment',
      action: () => handleDeploy()
    }
  ];

  const sidebarItems = [
    { 
      id: 'templates', 
      label: 'Flow Templates', 
      icon: Layers,
      description: 'Pre-built calling workflows',
      action: () => handleTemplates()
    },
    { 
      id: 'analytics', 
      label: 'Real-time Analytics', 
      icon: BarChart3,
      description: 'Live performance metrics & insights',
      action: () => setActivePanel(activePanel === 'analytics' ? null : 'analytics')
    },
    { 
      id: 'collaboration', 
      label: 'Team Collaboration', 
      icon: Users,
      description: 'Share & collaborate on flows',
      action: () => setActivePanel(activePanel === 'collaboration' ? null : 'collaboration')
    },
    { 
      id: 'optimizer', 
      label: 'AI Flow Optimizer', 
      icon: Brain,
      description: 'AI-powered flow improvements',
      action: () => setActivePanel(activePanel === 'optimizer' ? null : 'optimizer')
    },
    { 
      id: 'history', 
      label: 'Version History', 
      icon: History,
      description: 'Track all flow changes & versions',
      action: () => handleHistory()
    },
    { 
      id: 'settings', 
      label: 'Flow Settings', 
      icon: Settings,
      description: 'Configure flow parameters',
    }
  ];

  // Additional state for modals and dialogs
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  // Handler functions for enhanced functionality
  const handleTestFlow = async () => {
    setShowTestDialog(true);
  };

  const handleLiveCallTest = async () => {
    setShowCallDialog(true);
  };

  const handleDeploy = async () => {
    setShowDeployDialog(true);
  };

  const handleTemplates = () => {
    setShowTemplatesModal(true);
  };

  const handleHistory = () => {
    setShowHistoryModal(true);
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };
  const getStatusColor = () => {
    switch (flowStatus) {
      case 'production': return 'bg-green-100 text-green-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`h-16 border-b flex items-center justify-between px-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Left - Flow Info */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className={`text-lg font-semibold bg-transparent border-none outline-none ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
          placeholder="Flow Name"
        />
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {flowStatus}
          </span>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            v{flowVersion}
          </span>
        </div>
      </div>

      {/* Center - Actions & Tools */}
      <div className="flex items-center gap-2">
        {/* Quick Actions Dropdown */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            Quick Actions
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showQuickActions && (
            <div className={`absolute top-full left-0 mt-2 w-72 rounded-lg shadow-xl border z-50 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3">
                <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Quick Actions
                </div>
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action?.();
                      setShowQuickActions(false);
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors hover:scale-[1.02] ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      action.id === 'test' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                      action.id === 'call' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                      'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                    }`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {action.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panels Dropdown */}
        <div className="relative" ref={panelsRef}>
          <button
            onClick={() => setShowPanels(!showPanels)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Panels
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showPanels && (
            <div className={`absolute top-full left-0 mt-2 w-80 rounded-lg shadow-xl border z-50 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3">
                <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Tools & Panels
                </div>
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action?.();
                      if (!['analytics', 'collaboration', 'optimizer'].includes(item.id)) {
                        setShowPanels(false);
                      }
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors hover:scale-[1.02] ${
                      activePanel === item.id
                        ? 'bg-blue-600 text-white'
                        : isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${
                      activePanel === item.id 
                        ? 'bg-blue-500 text-white' 
                        : item.id === 'templates' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' :
                          item.id === 'analytics' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                          item.id === 'collaboration' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                          item.id === 'optimizer' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' :
                          item.id === 'history' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        activePanel === item.id ? 'text-white' : ''
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-1 ${
                        activePanel === item.id 
                          ? 'text-blue-100' 
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    {activePanel === item.id && (
                      <div className="text-blue-200">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50`}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        
        <button
          onClick={onTest}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDarkMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50`}
        >
          <Play className="w-4 h-4" />
          Test
        </button>
      </div>

      {/* Right - View Controls & Node Info */}
      <div className="flex items-center gap-2">
        {/* Selected Node Info */}
        {selectedNode && (
          <div className="relative" ref={nodeInfoRef}>
            <button
              onClick={() => setShowNodeInfo(!showNodeInfo)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <Info className="w-4 h-4" />
              {selectedNode.data.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showNodeInfo && (
              <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg border z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Selected Node
                    </h3>
                    <button
                      onClick={() => setShowNodeInfo(false)}
                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedNode.data.label}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Type: {selectedNode.type}
                    </p>
                    {selectedNode.data.config && (
                      <div className="mt-2 text-xs">
                        <p className={`font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Configuration:
                        </p>
                        <pre className={`mt-1 p-2 rounded text-xs ${
                          isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {JSON.stringify(selectedNode.data.config, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setShowMinimap(!showMinimap)}
          className={`p-2 rounded-lg transition-colors ${
            showMinimap
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
              : isDarkMode
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="Toggle Minimap"
        >
          {showMinimap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-colors ${
            showGrid
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
              : isDarkMode
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="Toggle Grid"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Modal Dialogs */}
      {/* Test Flow Dialog */}
      {showTestDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-96 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Test Flow Workflow
                </h3>
                <button
                  onClick={() => setShowTestDialog(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Simulation Mode</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Test your complete workflow with simulated responses and track each step.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Test Scenario</label>
                  <select className={`w-full p-2 border rounded-lg ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}>
                    <option>Happy Path - All responses positive</option>
                    <option>Edge Case - Mixed responses</option>
                    <option>Error Handling - Test failure scenarios</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      onTest();
                      setShowTestDialog(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Start Test
                  </button>
                  <button
                    onClick={() => setShowTestDialog(false)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Call Test Dialog */}
      {showCallDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-96 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Live Call Test
                </h3>
                <button
                  onClick={() => setShowCallDialog(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-green-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Real Call Execution</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Execute your flow with a real phone call to test live performance.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Your Phone Number</label>
                  <input
                    type="tel"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full p-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div className={`text-xs p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  ⚠️ This will make an actual phone call. Standard rates may apply.
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (testPhoneNumber) {
                        onExecuteFlow(testPhoneNumber);
                        setShowCallDialog(false);
                        setTestPhoneNumber('');
                      }
                    }}
                    disabled={!testPhoneNumber}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    <Phone className="w-4 h-4 inline mr-2" />
                    Start Call
                  </button>
                  <button
                    onClick={() => {
                      setShowCallDialog(false);
                      setTestPhoneNumber('');
                    }}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Dialog */}
      {showDeployDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-96 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Deploy to Production
                </h3>
                <button
                  onClick={() => setShowDeployDialog(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-purple-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Production Deployment</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Push your flow to the live environment for customer use.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Flow Version:</span>
                    <span className="font-mono text-sm">{flowVersion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Environment:</span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Production</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nodes:</span>
                    <span className="text-sm">{selectedNode ? '1 selected' : 'All nodes'}</span>
                  </div>
                </div>
                <div className={`text-xs p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-amber-50 text-amber-700'
                }`}>
                  ⚠️ This will make your flow live for customers. Make sure it's tested.
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={async () => {
                      setIsDeploying(true);
                      // Simulate deployment
                      setTimeout(() => {
                        setIsDeploying(false);
                        setShowDeployDialog(false);
                      }, 2000);
                    }}
                    disabled={isDeploying}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isDeploying ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>Deploying...</>
                    ) : (
                      <><Rocket className="w-4 h-4 inline mr-2" />Deploy Now</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeployDialog(false)}
                    disabled={isDeploying}
                    className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-[800px] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Flow Templates
                </h3>
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Sales Outreach', description: 'Cold calling with appointment booking', nodes: 8, category: 'Sales' },
                  { name: 'Customer Survey', description: 'Collect feedback and ratings', nodes: 6, category: 'Research' },
                  { name: 'Appointment Reminder', description: 'Automated appointment confirmations', nodes: 4, category: 'Support' },
                  { name: 'Lead Qualification', description: 'Qualify leads with decision trees', nodes: 12, category: 'Sales' },
                  { name: 'Payment Collection', description: 'Automated payment reminders', nodes: 7, category: 'Finance' },
                  { name: 'Event Invitation', description: 'Invite contacts to events', nodes: 5, category: 'Marketing' }
                ].map((template, index) => (
                  <div key={index} className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        template.category === 'Sales' ? 'bg-blue-100 text-blue-800' :
                        template.category === 'Research' ? 'bg-green-100 text-green-800' :
                        template.category === 'Support' ? 'bg-purple-100 text-purple-800' :
                        template.category === 'Finance' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {template.category}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {template.nodes} nodes
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-[600px] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Version History
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { version: '1.2.3', date: '2025-09-03', author: 'You', changes: 'Added decision node for lead scoring', status: 'current' },
                  { version: '1.2.2', date: '2025-09-02', author: 'John Doe', changes: 'Updated voice prompts for better clarity', status: 'deployed' },
                  { version: '1.2.1', date: '2025-09-01', author: 'You', changes: 'Fixed collection timeout handling', status: 'deployed' },
                  { version: '1.2.0', date: '2025-08-30', author: 'Sarah Smith', changes: 'Major update: Added AI optimizer integration', status: 'archived' },
                  { version: '1.1.5', date: '2025-08-28', author: 'You', changes: 'Performance improvements and bug fixes', status: 'archived' }
                ].map((version, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-medium ${
                          version.status === 'current' ? 'text-blue-600' : isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          v{version.version}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          version.status === 'current' ? 'bg-blue-100 text-blue-800' :
                          version.status === 'deployed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {version.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          <Copy className="w-4 h-4" />
                        </button>
                        {version.status !== 'current' && (
                          <button className="text-green-600 hover:text-green-700 text-sm">
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {version.changes}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{version.author}</span>
                      <span>{version.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-[700px] max-h-[80vh] overflow-y-auto rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Flow Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-6">
                {/* General Settings */}
                <div>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    General Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Flow Name</label>
                      <input
                        type="text"
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value)}
                        className={`w-full p-2 border rounded-lg ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Timeout (seconds)</label>
                      <input
                        type="number"
                        defaultValue="30"
                        className={`w-full p-2 border rounded-lg ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Settings */}
                <div>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Voice Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Voice Type</label>
                      <select className={`w-full p-2 border rounded-lg ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}>
                        <option>Professional Female</option>
                        <option>Professional Male</option>
                        <option>Friendly Female</option>
                        <option>Friendly Male</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Speech Rate</label>
                      <select className={`w-full p-2 border rounded-lg ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}>
                        <option>Slow</option>
                        <option>Normal</option>
                        <option>Fast</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Advanced Settings
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Enable call recording</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Auto-retry on failure</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Send completion webhook</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowHeader;
