import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

const MobileFlowBuilder = ({ nodes, edges, onViewportChange }) => {
  const [viewMode, setViewMode] = useState('desktop');
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const viewModes = [
    { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
    { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' }
  ];

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (onViewportChange) {
      const selectedMode = viewModes.find(m => m.id === mode);
      onViewportChange({
        mode,
        width: selectedMode.width
      });
    }
  };

  if (!isMobileView) {
    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Responsive Preview</h3>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {viewModes.map(mode => {
              const IconComponent = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleViewModeChange(mode.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === mode.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {mode.label}
                </button>
              );
            })}
          </div>
          
          <div className="text-sm text-gray-600">
            Current view: {viewMode} ({viewModes.find(m => m.id === viewMode)?.width})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Mobile Flow Builder
        </h3>
      </div>
      
      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          You're viewing the flow builder in mobile mode. 
          Some advanced features may be simplified for better mobile experience.
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-gray-700">Quick Stats:</div>
          <div className="text-sm text-gray-600">
            • Nodes: {nodes.length}
          </div>
          <div className="text-sm text-gray-600">
            • Connections: {edges.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFlowBuilder;
