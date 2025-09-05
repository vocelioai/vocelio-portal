import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle, Wand2 } from 'lucide-react';

const AIFlowOptimizer = ({ nodes, edges, onOptimize }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOptimizations, setSelectedOptimizations] = useState([]);

  const analyzeFlow = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        performanceScore: 78,
        issues: [
          {
            id: 1,
            type: 'performance',
            severity: 'medium',
            title: 'Inefficient conversation path',
            description: 'Multiple sequential nodes could be optimized',
            suggestion: 'Consider merging consecutive text nodes',
            impact: 'Medium',
            nodeIds: ['node1', 'node2']
          },
          {
            id: 2,
            type: 'usability',
            severity: 'low',
            title: 'Missing error handling',
            description: 'Some decision nodes lack fallback responses',
            suggestion: 'Add default responses for edge cases',
            impact: 'Low',
            nodeIds: ['decision1']
          }
        ],
        optimizations: [
          {
            id: 'opt1',
            type: 'performance',
            title: 'Merge Similar Nodes',
            description: 'Combine 3 consecutive Say nodes into a single node',
            estimatedImprovement: '25% faster execution',
            difficulty: 'Easy',
            autoApplyable: true
          },
          {
            id: 'opt2', 
            type: 'user_experience',
            title: 'Add Confirmation Steps',
            description: 'Insert confirmation before critical actions',
            estimatedImprovement: '30% better user satisfaction',
            difficulty: 'Medium',
            autoApplyable: false
          },
          {
            id: 'opt3',
            type: 'reliability',
            title: 'Improve Error Recovery',
            description: 'Add retry logic and better error messages',
            estimatedImprovement: '40% fewer failed conversations',
            difficulty: 'Medium',
            autoApplyable: true
          }
        ],
        metrics: {
          totalNodes: nodes?.length || 0,
          totalConnections: edges?.length || 0,
          complexity: getComplexityScore(nodes?.length || 0),
          estimatedDuration: calculateEstimatedDuration(nodes?.length || 0)
        }
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2500);
  };

  const getComplexityScore = (nodeCount) => {
    if (nodeCount < 5) return 'Low';
    if (nodeCount < 15) return 'Medium';
    return 'High';
  };

  const calculateEstimatedDuration = (nodeCount) => {
    const avgTimePerNode = 0.5; // seconds
    return `${(nodeCount * avgTimePerNode).toFixed(1)}s`;
  };

  const handleOptimizationToggle = (optimizationId) => {
    setSelectedOptimizations(prev => 
      prev.includes(optimizationId)
        ? prev.filter(id => id !== optimizationId)
        : [...prev, optimizationId]
    );
  };

  const applyOptimizations = () => {
    if (selectedOptimizations.length === 0) return;

    console.log('Applying optimizations:', selectedOptimizations);
    
    if (onOptimize) {
      onOptimize(selectedOptimizations, analysis);
    }
    
    // Show success message
    alert(`Applied ${selectedOptimizations.length} optimization(s) successfully!`);
    setSelectedOptimizations([]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 text-red-700';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Flow Optimizer
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Analyze and optimize your flow using AI-powered insights
        </p>
      </div>

      <div className="p-6">
        {!analysis ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {isAnalyzing ? (
                <div className="animate-spin w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full"></div>
              ) : (
                <Zap className="w-10 h-10 text-purple-600" />
              )}
            </div>
            
            {isAnalyzing ? (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Analyzing Your Flow</h4>
                <p className="text-gray-600 mb-4">
                  AI is examining node efficiency, user experience patterns, and performance bottlenecks...
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Ready to Optimize</h4>
                <p className="text-gray-600 mb-6">
                  Get AI-powered recommendations to improve your flow's performance, user experience, and reliability.
                </p>
                <button
                  onClick={analyzeFlow}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 mx-auto font-medium"
                >
                  <Brain className="w-5 h-5" />
                  Analyze Flow
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Performance Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Performance Score
                </h4>
                <div className="text-3xl font-bold text-blue-600">
                  {analysis.performanceScore}/100
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.performanceScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {analysis.performanceScore >= 80 ? 'Excellent performance!' : 
                 analysis.performanceScore >= 60 ? 'Good performance with room for improvement' :
                 'Significant optimization opportunities available'}
              </p>
            </div>

            {/* Flow Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.totalNodes}</div>
                <div className="text-sm text-gray-500">Total Nodes</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.totalConnections}</div>
                <div className="text-sm text-gray-500">Connections</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.complexity}</div>
                <div className="text-sm text-gray-500">Complexity</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.estimatedDuration}</div>
                <div className="text-sm text-gray-500">Est. Duration</div>
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Identified Issues ({analysis.issues.length})
                </h4>
                <div className="space-y-3">
                  {analysis.issues.map(issue => (
                    <div key={issue.id} className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium">{issue.title}</h5>
                        <span className="text-xs px-2 py-1 bg-white rounded-full font-medium capitalize">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{issue.description}</p>
                      <p className="text-sm font-medium">💡 {issue.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimizations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Optimization Recommendations
              </h4>
              <div className="space-y-4">
                {analysis.optimizations.map(optimization => (
                  <div key={optimization.id} className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedOptimizations.includes(optimization.id)}
                        onChange={() => handleOptimizationToggle(optimization.id)}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{optimization.title}</h5>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(optimization.difficulty)}`}>
                              {optimization.difficulty}
                            </span>
                            {optimization.autoApplyable && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                Auto-apply
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{optimization.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {optimization.estimatedImprovement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOptimizations.length > 0 && (
                <div className="mt-6 flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="font-medium text-purple-900">
                    {selectedOptimizations.length} optimization{selectedOptimizations.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={applyOptimizations}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply Optimizations
                  </button>
                </div>
              )}
            </div>

            {/* Re-analyze */}
            <div className="pt-6 border-t">
              <button
                onClick={analyzeFlow}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 font-medium"
              >
                <Brain className="w-5 h-5" />
                Re-analyze Flow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFlowOptimizer;
