import React from 'react';
import { Plus, Minus, RotateCcw, Maximize, Map, Grid, Layers, Clock, Moon, X, Eye } from 'lucide-react';

const FlowDesignerCanvasControls = ({
  isDarkMode,
  currentZoom,
  minimapVisible,
  layersVisible,
  historyVisible,
  nodes,
  zoomIn,
  zoomOut,
  resetZoom,
  toggleFullscreen,
  toggleMinimap,
  toggleGrid,
  toggleLayers,
  toggleHistory,
  toggleDarkMode
}) => {
  return (
    <>
      {/* Canvas Controls */}
      <div className="absolute top-5 right-5 z-20 flex gap-2">
        {[
          { icon: Plus, action: zoomIn, tooltip: 'Zoom In' },
          { icon: Minus, action: zoomOut, tooltip: 'Zoom Out' },
          { icon: RotateCcw, action: resetZoom, tooltip: 'Reset Zoom' },
          { icon: Maximize, action: toggleFullscreen, tooltip: 'Toggle Fullscreen' },
          { icon: Map, action: toggleMinimap, tooltip: 'Toggle Minimap' },
          { icon: Grid, action: toggleGrid, tooltip: 'Toggle Grid' },
          { icon: Layers, action: toggleLayers, tooltip: 'Layers' },
          { icon: Clock, action: toggleHistory, tooltip: 'History' },
          { icon: Moon, action: toggleDarkMode, tooltip: 'Dark Mode' }
        ].map(({ icon: Icon, action, tooltip }, idx) => (
          <button
            key={idx}
            onClick={action}
            className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-blue-600 hover:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-500'
            }`}
            title={tooltip}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Zoom Indicator */}
      <div className={`absolute bottom-5 right-5 z-20 px-3 py-2 rounded-full text-sm font-medium shadow-lg border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600 text-white' 
          : 'bg-white border-gray-300 text-gray-900'
      }`}>
        {Math.round(currentZoom * 100)}%
      </div>

      {/* Minimap */}
      {minimapVisible && (
        <div className={`absolute bottom-5 left-5 w-48 h-36 rounded-lg shadow-lg z-20 border-2 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-300'
        }`}>
          <div className={`flex items-center justify-between p-2 border-b text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-gray-50 border-gray-200 text-gray-900'
          }`}>
            <span>Navigator</span>
            <button onClick={toggleMinimap} className={`p-1 rounded hover:bg-opacity-80 ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}>
              <X size={14} />
            </button>
          </div>
          <div className={`relative h-full overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            {nodes.map(node => (
              <div
                key={node.id}
                className="absolute w-4 h-3 bg-blue-600 rounded-sm"
                style={{
                  left: `${(node.position.x / 10)}px`,
                  top: `${(node.position.y / 10)}px`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Layers Panel */}
      {layersVisible && (
        <div className={`absolute top-5 left-5 w-60 rounded-xl shadow-lg z-20 border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-300'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode 
              ? 'border-gray-600 text-white' 
              : 'border-gray-200 text-gray-900'
          }`}>
            <span className="font-semibold">Layers</span>
            <button onClick={toggleLayers} className={`p-1 rounded hover:bg-opacity-80 ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}>
              <X size={16} />
            </button>
          </div>
          {['Workflow Nodes', 'Connections', 'Comments', 'Grid'].map((layer, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-200' 
                : 'hover:bg-gray-50 text-gray-800'
            }`}>
              <Eye size={16} className="text-blue-600" />
              <span className="text-sm">{layer}</span>
            </div>
          ))}
        </div>
      )}

      {/* History Panel */}
      {historyVisible && (
        <div className={`absolute top-20 right-5 w-48 rounded-xl shadow-lg z-20 border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-300'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode 
              ? 'border-gray-600 text-white' 
              : 'border-gray-200 text-gray-900'
          }`}>
            <span className="font-semibold">History</span>
            <button onClick={toggleHistory} className={`p-1 rounded hover:bg-opacity-80 ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}>
              <X size={16} />
            </button>
          </div>
          {['Current State', 'Added Technology Node', 'Modified Introduction', 'Added End Call Node', 'Initial Setup'].map((item, idx) => (
            <div key={idx} className={`p-3 text-xs cursor-pointer border-b last:border-b-0 transition-colors ${
              idx === 0 
                ? isDarkMode 
                  ? 'text-blue-400 font-medium hover:bg-gray-700' 
                  : 'text-blue-600 font-medium hover:bg-gray-50'
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-50'
            } ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              {item}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FlowDesignerCanvasControls;
