import React, { useState, useEffect } from 'react';
import { TreePine, Layers, ArrowDown, Edit3, Eye, Settings, ChevronRight, ChevronDown, Merge, AlertTriangle, CheckCircle } from 'lucide-react';

const ContextInheritanceManager = ({ 
  isVisible, 
  onClose, 
  globalPrompt,
  workflowContexts,
  selectedWorkflow,
  onUpdateContext,
  contextIntelligence 
}) => {
  const [hierarchyView, setHierarchyView] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({
    global: true,
    workflow: true,
    nodes: false
  });
  const [selectedLevel, setSelectedLevel] = useState('global');
  const [editingLevel, setEditingLevel] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [mergedPreview, setMergedPreview] = useState('');

  useEffect(() => {
    if (isVisible && contextIntelligence) {
      buildHierarchy();
    }
  }, [isVisible, globalPrompt, workflowContexts, selectedWorkflow]);

  const buildHierarchy = () => {
    const currentWorkflow = workflowContexts[selectedWorkflow] || {};
    
    // Build mock hierarchy for demonstration
    const hierarchy = {
      global: {
        id: 'global',
        name: 'Global Context',
        content: globalPrompt || '',
        level: 0,
        priority: 1,
        inherited: false,
        conflicts: [],
        wordCount: (globalPrompt || '').split(' ').length
      },
      department: {
        id: 'department-sales',
        name: 'Sales Department',
        content: 'Focus on lead qualification and conversion. Emphasize value proposition and ROI. Maintain consultative approach.',
        level: 1,
        priority: 2,
        inherited: true,
        conflicts: [],
        wordCount: 18
      },
      workflow: {
        id: selectedWorkflow || 'current-workflow',
        name: currentWorkflow.name || 'Current Workflow',
        content: currentWorkflow.context || '',
        level: 2,
        priority: 3,
        inherited: true,
        conflicts: detectConflicts(globalPrompt, currentWorkflow.context),
        wordCount: (currentWorkflow.context || '').split(' ').length
      },
      nodes: [
        {
          id: 'node-1',
          name: 'Initial Greeting Node',
          content: 'Be warm and welcoming. Ask qualifying questions.',
          level: 3,
          priority: 4,
          inherited: true,
          conflicts: [],
          wordCount: 8
        },
        {
          id: 'node-2',
          name: 'Product Demo Node',
          content: 'Focus on key features that solve customer pain points.',
          level: 3,
          priority: 4,
          inherited: true,
          conflicts: [],
          wordCount: 10
        }
      ]
    };

    setHierarchyView(hierarchy);
    generateMergedPreview(hierarchy);
  };

  const detectConflicts = (global, workflow) => {
    const conflicts = [];
    if (!global || !workflow) return conflicts;

    // Simple conflict detection
    const globalLower = global.toLowerCase();
    const workflowLower = workflow.toLowerCase();

    if (globalLower.includes('formal') && workflowLower.includes('casual')) {
      conflicts.push({
        type: 'tone',
        description: 'Global context specifies formal tone while workflow specifies casual'
      });
    }

    if (globalLower.includes('brief') && workflowLower.includes('detailed')) {
      conflicts.push({
        type: 'length',
        description: 'Global context prefers brief responses while workflow wants detailed explanations'
      });
    }

    return conflicts;
  };

  const generateMergedPreview = (hierarchy) => {
    if (!hierarchy || !contextIntelligence) return;

    try {
      const merged = contextIntelligence.buildContextHierarchy(
        hierarchy.global.content,
        hierarchy.department.content,
        hierarchy.workflow.content,
        hierarchy.nodes.map(n => n.content).join('\n')
      );
      setMergedPreview(merged.mergedContext);
    } catch (error) {
      console.error('Error generating merged preview:', error);
      setMergedPreview('Error generating preview');
    }
  };

  const toggleLevelExpansion = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const HierarchyItem = ({ item, level, isLast = false }) => {
    const levelColors = {
      0: 'border-blue-400 bg-blue-500/10',
      1: 'border-purple-400 bg-purple-500/10',
      2: 'border-green-400 bg-green-500/10',
      3: 'border-yellow-400 bg-yellow-500/10'
    };

    return (
      <div className={`relative ${!isLast ? 'mb-4' : ''}`}>
        {/* Connection Line */}
        {level > 0 && (
          <div className="absolute -left-6 top-0 bottom-0 w-px bg-gray-600"></div>
        )}
        {level > 0 && (
          <div className="absolute -left-6 top-4 w-4 h-px bg-gray-600"></div>
        )}

        <div className={`p-4 rounded-lg border-2 ${levelColors[level]} ${
          selectedLevel === item.id ? 'ring-2 ring-white/30' : ''
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <TreePine className="w-4 h-4 text-blue-400" />
                <h4 className="font-semibold text-white">{item.name}</h4>
              </div>
              {item.inherited && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                  Inherited
                </span>
              )}
              {item.conflicts?.length > 0 && (
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {item.conflicts.length} conflict{item.conflicts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">{item.wordCount} words</span>
              <button
                onClick={() => setSelectedLevel(item.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingLevel(item.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {item.content && (
            <div className="bg-black/30 rounded p-3 mb-2">
              <p className="text-gray-300 text-sm line-clamp-3">{item.content}</p>
            </div>
          )}

          {item.conflicts?.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.conflicts.map((conflict, index) => (
                <div key={index} className="bg-red-500/10 border border-red-500/20 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-xs font-medium">
                      {conflict.type.toUpperCase()} CONFLICT
                    </span>
                  </div>
                  <p className="text-red-300 text-xs mt-1">{conflict.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl h-[90vh] border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Layers className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Context Inheritance Manager</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                previewMode 
                  ? 'bg-blue-500/20 border-blue-400 text-blue-400' 
                  : 'bg-white/10 border-white/20 text-gray-300'
              }`}
            >
              <Merge className="w-4 h-4 mr-2 inline" />
              Preview Merged
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Hierarchy View */}
          <div className="w-1/2 p-6 border-r border-white/10 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                <TreePine className="w-5 h-5 mr-2 text-blue-400" />
                Context Hierarchy
              </h3>
              <p className="text-gray-300 text-sm">
                Contexts inherit from parent levels. Higher priority (lower level) contexts override conflicts.
              </p>
            </div>

            {hierarchyView && (
              <div className="space-y-4">
                {/* Global Level */}
                <div className="pl-0">
                  <HierarchyItem item={hierarchyView.global} level={0} />
                </div>

                {/* Department Level */}
                <div className="pl-6">
                  <div className="flex items-center mb-2">
                    <ArrowDown className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-400 text-sm">Inherits from Global</span>
                  </div>
                  <HierarchyItem item={hierarchyView.department} level={1} />
                </div>

                {/* Workflow Level */}
                <div className="pl-12">
                  <div className="flex items-center mb-2">
                    <ArrowDown className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-400 text-sm">Inherits from Department</span>
                  </div>
                  <HierarchyItem item={hierarchyView.workflow} level={2} />
                </div>

                {/* Node Level */}
                <div className="pl-18">
                  <div className="flex items-center mb-2">
                    <button
                      onClick={() => toggleLevelExpansion('nodes')}
                      className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedLevels.nodes ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                      <ArrowDown className="w-4 h-4 mr-2" />
                      <span className="text-sm">Node-Specific Contexts ({hierarchyView.nodes.length})</span>
                    </button>
                  </div>
                  
                  {expandedLevels.nodes && (
                    <div className="space-y-4">
                      {hierarchyView.nodes.map((node, index) => (
                        <HierarchyItem 
                          key={node.id} 
                          item={node} 
                          level={3} 
                          isLast={index === hierarchyView.nodes.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details/Preview Panel */}
          <div className="w-1/2 p-6 overflow-y-auto">
            {previewMode ? (
              /* Merged Preview */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Merge className="w-5 h-5 mr-2 text-green-400" />
                    Merged Context Preview
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      AI Optimized
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <pre className="text-gray-300 whitespace-pre-wrap text-sm">{mergedPreview}</pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Merge Statistics</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Total Sources:</span>
                        <span className="text-blue-400">4 levels</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conflicts Resolved:</span>
                        <span className="text-green-400">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Final Word Count:</span>
                        <span className="text-purple-400">{mergedPreview.split(' ').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimization Score:</span>
                        <span className="text-yellow-400">87%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Inheritance Chain</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-gray-300">Global Context</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <ArrowDown className="w-3 h-3 text-gray-500" />
                        <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                        <span className="text-gray-300">Department Context</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <ArrowDown className="w-3 h-3 text-gray-500" />
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-gray-300">Workflow Context</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <ArrowDown className="w-3 h-3 text-gray-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-gray-300">Node Context</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => onUpdateContext && onUpdateContext(mergedPreview)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg px-4 py-3 text-white font-semibold transition-colors"
                  >
                    Apply Merged Context
                  </button>
                  <button
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    Export Hierarchy
                  </button>
                </div>
              </div>
            ) : (
              /* Level Details */
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Context Level Details
                </h3>

                {selectedLevel && hierarchyView && (
                  <div className="space-y-4">
                    {/* Level Info */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h4 className="font-semibold text-white mb-2">
                        {hierarchyView[selectedLevel]?.name || 'Selected Level'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Priority Level:</span>
                          <span className="text-white ml-2">
                            {hierarchyView[selectedLevel]?.priority || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Inheritance:</span>
                          <span className="text-white ml-2">
                            {hierarchyView[selectedLevel]?.inherited ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Word Count:</span>
                          <span className="text-white ml-2">
                            {hierarchyView[selectedLevel]?.wordCount || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Conflicts:</span>
                          <span className="text-white ml-2">
                            {hierarchyView[selectedLevel]?.conflicts?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Editor */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-white">Context Content</h5>
                        <button
                          onClick={() => setEditingLevel(editingLevel === selectedLevel ? null : selectedLevel)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>

                      {editingLevel === selectedLevel ? (
                        <div className="space-y-3">
                          <textarea
                            value={hierarchyView[selectedLevel]?.content || ''}
                            onChange={(e) => {
                              // Handle content update
                            }}
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none h-32 resize-none"
                            placeholder="Enter context content..."
                          />
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors">
                              Save Changes
                            </button>
                            <button 
                              onClick={() => setEditingLevel(null)}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-black/30 rounded-lg p-4">
                          <pre className="text-gray-300 whitespace-pre-wrap text-sm">
                            {hierarchyView[selectedLevel]?.content || 'No content defined'}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Inheritance Rules */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h5 className="font-semibold text-white mb-4">Inheritance Rules</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Lower level contexts override higher levels</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Node-specific contexts have highest priority</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Conflicts are automatically resolved by AI</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Changes propagate to child contexts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextInheritanceManager;
