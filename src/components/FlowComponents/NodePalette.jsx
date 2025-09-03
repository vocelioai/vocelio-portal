import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  PhoneCall, 
  GitBranch, 
  StopCircle, 
  Play, 
  Pause,
  MessageSquare,
  Settings,
  Volume2,
  Mic,
  Brain,
  Database,
  Share2,
  Timer,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';

const NodePalette = ({ isDarkMode, onNodeDrag }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Node definitions with categories
  const nodeTypes = useMemo(() => [
    // Communication Nodes
    {
      id: 'say',
      type: 'Say',
      icon: MessageCircle,
      category: 'communication',
      description: 'Play a message to the caller',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      darkBgColor: 'dark:bg-blue-900/20'
    },
    {
      id: 'collect',
      type: 'Collect Input',
      icon: Mic,
      category: 'communication',
      description: 'Collect user input (voice/DTMF)',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      darkBgColor: 'dark:bg-green-900/20'
    },
    {
      id: 'transfer',
      type: 'Transfer',
      icon: PhoneCall,
      category: 'communication',
      description: 'Transfer call to another number',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      darkBgColor: 'dark:bg-purple-900/20'
    },
    {
      id: 'record',
      type: 'Record',
      icon: Volume2,
      category: 'communication',
      description: 'Record caller message',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      darkBgColor: 'dark:bg-red-900/20'
    },
    
    // Logic Nodes
    {
      id: 'decision',
      type: 'Decision',
      icon: GitBranch,
      category: 'logic',
      description: 'Branch flow based on conditions',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      darkBgColor: 'dark:bg-orange-900/20'
    },
    {
      id: 'condition',
      type: 'Condition',
      icon: CheckCircle,
      category: 'logic',
      description: 'Evaluate conditions',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      darkBgColor: 'dark:bg-yellow-900/20'
    },
    {
      id: 'switch',
      type: 'Switch',
      icon: Share2,
      category: 'logic',
      description: 'Multi-path branching',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      darkBgColor: 'dark:bg-indigo-900/20'
    },
    
    // Control Nodes
    {
      id: 'start',
      type: 'Start',
      icon: Play,
      category: 'control',
      description: 'Flow entry point',
      color: 'bg-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-800/20'
    },
    {
      id: 'end',
      type: 'End',
      icon: StopCircle,
      category: 'control',
      description: 'Flow termination',
      color: 'bg-red-600',
      textColor: 'text-red-700',
      bgColor: 'bg-red-100',
      darkBgColor: 'dark:bg-red-800/20'
    },
    {
      id: 'pause',
      type: 'Pause',
      icon: Pause,
      category: 'control',
      description: 'Add delay in flow',
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      darkBgColor: 'dark:bg-gray-900/20'
    },
    {
      id: 'timer',
      type: 'Timer',
      icon: Timer,
      category: 'control',
      description: 'Time-based actions',
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      darkBgColor: 'dark:bg-cyan-900/20'
    },
    
    // AI Nodes
    {
      id: 'ai-response',
      type: 'AI Response',
      icon: Brain,
      category: 'ai',
      description: 'Generate AI-powered responses',
      color: 'bg-violet-500',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
      darkBgColor: 'dark:bg-violet-900/20'
    },
    {
      id: 'sentiment',
      type: 'Sentiment',
      icon: MessageSquare,
      category: 'ai',
      description: 'Analyze caller sentiment',
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
      darkBgColor: 'dark:bg-pink-900/20'
    },
    
    // Data Nodes
    {
      id: 'database',
      type: 'Database',
      icon: Database,
      category: 'data',
      description: 'Query/update database',
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      darkBgColor: 'dark:bg-teal-900/20'
    },
    {
      id: 'variable',
      type: 'Set Variable',
      icon: Settings,
      category: 'data',
      description: 'Set flow variables',
      color: 'bg-slate-500',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
      darkBgColor: 'dark:bg-slate-900/20'
    }
  ], []);

  const categories = [
    { id: 'all', name: 'All Nodes', icon: null },
    { id: 'communication', name: 'Communication', icon: MessageCircle },
    { id: 'logic', name: 'Logic', icon: GitBranch },
    { id: 'control', name: 'Control', icon: Play },
    { id: 'ai', name: 'AI', icon: Brain },
    { id: 'data', name: 'Data', icon: Database }
  ];

  const filteredNodes = useMemo(() => {
    return nodeTypes.filter(node => {
      const matchesSearch = searchTerm === '' || 
        node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || node.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [nodeTypes, searchTerm, activeCategory]);

  const handleDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`w-72 border-r flex flex-col ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Node Palette
        </h3>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {IconComponent && <IconComponent className="w-3 h-3" />}
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredNodes.map((node) => {
            const IconComponent = node.icon;
            return (
              <div
                key={node.id}
                draggable
                onDragStart={(e) => handleDragStart(e, node)}
                className={`p-3 rounded-lg border cursor-move transition-all hover:shadow-md ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : `${node.bgColor} ${node.darkBgColor} border-gray-200 hover:shadow-lg`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${node.color}`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm truncate ${
                      isDarkMode ? 'text-white' : node.textColor
                    }`}>
                      {node.type}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNodes.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No nodes found</p>
          </div>
        )}
      </div>

      {/* Footer with Tips */}
      <div className={`p-3 border-t text-xs ${
        isDarkMode 
          ? 'border-gray-700 text-gray-400 bg-gray-800' 
          : 'border-gray-200 text-gray-500 bg-gray-50'
      }`}>
        💡 Drag nodes onto the canvas to add them to your flow
      </div>
    </div>
  );
};

export default NodePalette;
