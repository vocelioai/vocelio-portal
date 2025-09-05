import React, { useState } from 'react';
import { Zap, Brain, Wand2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const AIOptimizer = ({ nodes, edges, onOptimize }) => {
  const [analysis, setAnalysis] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedOptimizations, setSelectedOptimizations] = useState([]);

  const analyzeFlow = () => {
    setOptimizing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const mockAnalysis = {
        performance: {
          score: 75,
          issues: [
            {
              id: 1,
              type: 'performance',
              severity: 'medium',
              title: 'Long conversation path detected',
              description: 'Users may experience delays in nodes 3-7',
              suggestion: 'Consider adding parallel processing or shorter paths',
              impact: 'Medium'
            },
            {
              id: 2,
              type: 'ux',
              severity: 'low',
              title: 'Missing fallback responses',
              description: 'Some decision nodes lack proper fallback handling',
              suggestion: 'Add default responses for unhandled inputs',
              impact: 'Low'
            }
          ]
        },
        suggestions: [
          {
            id: 'opt1',
            type: 'efficiency',
            title: 'Merge consecutive Say nodes',
            description: 'Combine nodes 2 and 3 to reduce execution time',
            estimatedImprovement: '15% faster execution',
            difficulty: 'Easy'
          },
          {
            id: 'opt2',
            type: 'user_experience',
            title: 'Add confirmation steps',
            description: 'Insert confirmation nodes before critical actions',
            estimatedImprovement: '20% better user satisfaction',
            difficulty: 'Medium'
          },
          {
            id: 'opt3',
            type: 'error_handling',
            title: 'Improve error recovery',
            description: 'Add retry logic and better error messages',
            estimatedImprovement: '30% fewer failed conversations',
            difficulty: 'Medium'
          }
        ],
        metrics: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          complexity: 'Medium',
          estimatedDuration: '2.3 minutes',
          errorProneness: 'Low'
        }
      };
      
      setAnalysis(mockAnalysis);
      setOptimizing(false);
    }, 2000);
  };

  const handleOptimizationSelect = (optimizationId) => {
    setSelectedOptimizations(prev => 
      prev.includes(optimizationId)
        ? prev.filter(id => id !== optimizationId)
        : [...prev, optimizationId]
    );
  };

  const applyOptimizations = () => {
    if (selectedOptimizations.length === 0) return;
    
    // This would typically apply the selected optimizations to the flow
    console.log('Applying optimizations:', selectedOptimizations);
    
    if (onOptimize) {
      onOptimize(selectedOptimizations);
    }
    
    // Reset selections
    setSelectedOptimizations([]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
      <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Flow Optimizer
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Analyze and optimize your flow for better performance and user experience
        </p>
      </div>

      <div className="p-4">
        {!analysis ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {optimizing ? (
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              ) : (
                <Zap className="w-8 h-8 text-purple-600" />
              )}
            </div>
            
            {optimizing ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Analyzing Your Flow</h4>
                <p className="text-sm text-gray-600">
                  AI is examining your flow structure, performance patterns, and user experience...
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ready to Optimize</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Let AI analyze your flow and suggest improvements for better performance and user experience.
                </p>
                <button
                  onClick={analyzeFlow}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 mx-auto"
                >
                  <Brain className="w-4 h-4" />
                  Analyze Flow
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Performance Score */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Performance Score</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.performance.score}/100
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.performance.score}%` }}
                ></div>
              </div>
            </div>

            {/* Flow Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.nodeCount}</div>
                <div className="text-sm text-gray-500">Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.edgeCount}</div>
                <div className="text-sm text-gray-500">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.complexity}</div>
                <div className="text-sm text-gray-500">Complexity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.estimatedDuration}</div>
                <div className="text-sm text-gray-500">Est. Duration</div>
              </div>
            </div>

            {/* Issues */}
            {analysis.performance.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Identified Issues
                </h4>
                <div className="space-y-3">
                  {analysis.performance.issues.map(issue => (
                    <div key={issue.id} className={`border rounded-lg p-3 ${getSeverityColor(issue.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium">{issue.title}</h5>
                        <span className="text-xs px-2 py-1 bg-white rounded capitalize">
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

            {/* Optimization Suggestions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" />
                Optimization Suggestions
              </h4>
              <div className="space-y-3">
                {analysis.suggestions.map(suggestion => (
                  <div key={suggestion.id} className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOptimizations.includes(suggestion.id)}
                        onChange={() => handleOptimizationSelect(suggestion.id)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(suggestion.difficulty)}`}>
                            {suggestion.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {suggestion.estimatedImprovement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOptimizations.length > 0 && (
                <div className="mt-4 flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-800">
                    {selectedOptimizations.length} optimization{selectedOptimizations.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={applyOptimizations}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply Selected
                  </button>
                </div>
              )}
            </div>

            {/* Re-analyze Button */}
            <div className="pt-4 border-t">
              <button
                onClick={analyzeFlow}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Re-analyze Flow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIOptimizer;
