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
          { 
            icon: Plus, 
            action: zoomIn, 
            tooltip: 'Zoom In (Ctrl + +)',
            disabled: currentZoom >= 4
          },
          { 
            icon: Minus, 
            action: zoomOut, 
            tooltip: 'Zoom Out (Ctrl + -)',
            disabled: currentZoom <= 0.1
          },
          { 
            icon: RotateCcw, 
            action: resetZoom, 
            tooltip: 'Reset Zoom (Ctrl + 0)'
          },
          { 
            icon: Maximize, 
            action: toggleFullscreen, 
            tooltip: 'Toggle Fullscreen (F11)'
          },
          { 
            icon: Map, 
            action: toggleMinimap, 
            tooltip: 'Toggle Minimap',
            active: minimapVisible
          },
          { 
            icon: Grid, 
            action: toggleGrid, 
            tooltip: 'Toggle Grid'
          },
          { 
            icon: Layers, 
            action: toggleLayers, 
            tooltip: 'Layers Panel',
            active: layersVisible
          },
          { 
            icon: Clock, 
            action: toggleHistory, 
            tooltip: 'History Panel',
            active: historyVisible
          },
          { 
            icon: Moon, 
            action: toggleDarkMode, 
            tooltip: 'Toggle Dark Mode'
          }
        ].map(({ icon: Icon, action, tooltip, disabled, active }, idx) => (
          <button
            key={idx}
            onClick={action}
            disabled={disabled}
            className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 backdrop-blur-xl ${
              disabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-100/80 border-gray-200/50 text-gray-400 shadow-inner'
                : active
                ? isDarkMode 
                  ? 'bg-blue-600/90 border-blue-500/70 text-white shadow-xl shadow-blue-500/30 animate-pulse' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400/70 text-white shadow-xl shadow-blue-500/20 animate-pulse'
                : isDarkMode 
                  ? 'bg-gray-800/90 border-gray-600/50 text-gray-200 hover:bg-blue-600/90 hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-500/30' 
                  : 'bg-white/80 border-gray-200/60 text-gray-700 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-400/70 hover:shadow-xl hover:shadow-blue-500/20 shadow-lg shadow-gray-100/50'
            }`}
            title={tooltip}
          >
            <Icon size={20} className="drop-shadow-sm" />
          </button>
        ))}
      </div>

      {/* Zoom Indicator */}
      <div className={`absolute bottom-5 right-5 z-20 px-4 py-2.5 rounded-2xl text-sm font-semibold backdrop-blur-xl border ${
        isDarkMode 
          ? 'bg-gray-800/90 border-gray-600/50 text-white shadow-xl shadow-gray-900/30' 
          : 'bg-white/80 border-gray-200/60 text-gray-800 shadow-xl shadow-gray-100/50'
      }`}>
        <span className="text-xs opacity-70 mr-1">ZOOM</span>
        {Math.round(currentZoom * 100)}%
      </div>

      {/* Minimap */}
      {minimapVisible && (
        <div className={`absolute bottom-5 left-5 w-52 h-40 rounded-2xl backdrop-blur-xl z-20 border overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-600/50 shadow-xl shadow-gray-900/30' 
            : 'bg-white/80 border-gray-200/60 shadow-xl shadow-gray-100/50'
        }`}>
          <div className={`flex items-center justify-between p-3 border-b text-sm font-semibold ${
            isDarkMode 
              ? 'bg-gray-700/50 border-gray-600/50 text-white' 
              : 'bg-gray-50/60 border-gray-200/50 text-gray-800'
          }`}>
            <span className="flex items-center gap-2">
              <Map size={16} />
              Navigator
            </span>
            <button onClick={toggleMinimap} className={`p-1.5 rounded-lg hover:bg-opacity-80 transition-all duration-200 transform hover:scale-110 ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}>
              <X size={14} />
            </button>
          </div>
          <div className={`relative h-full overflow-hidden ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'
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
        <div className={`absolute top-5 left-5 w-64 rounded-2xl backdrop-blur-xl shadow-xl z-20 border overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-600/50 shadow-gray-900/30' 
            : 'bg-white/90 border-gray-200/60 shadow-gray-100/50'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode 
              ? 'border-gray-600/50 text-white bg-gray-700/50' 
              : 'border-gray-200/50 text-gray-800 bg-gray-50/60'
          }`}>
            <span className="font-semibold flex items-center gap-2">
              <Layers size={16} />
              Layers
            </span>
            <button onClick={toggleLayers} className={`p-1.5 rounded-lg hover:bg-opacity-80 transition-all duration-200 transform hover:scale-110 ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}>
              <X size={16} />
            </button>
          </div>
          {['Workflow Nodes', 'Connections', 'Comments', 'Grid'].map((layer, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:translate-x-1 ${
              isDarkMode 
                ? 'hover:bg-gray-700/60 text-gray-200' 
                : 'hover:bg-gray-50/80 text-gray-800'
            }`}>
              <Eye size={16} className="text-blue-500 drop-shadow-sm" />
              <span className="text-sm font-medium">{layer}</span>
            </div>
          ))}
        </div>
      )}

      {/* History Panel */}
      {historyVisible && (
        <div className={`absolute top-20 right-5 w-52 rounded-2xl backdrop-blur-xl shadow-xl z-20 border overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-600/50 shadow-gray-900/30' 
            : 'bg-white/90 border-gray-200/60 shadow-gray-100/50'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode 
              ? 'border-gray-600/50 text-white bg-gray-700/50' 
              : 'border-gray-200/50 text-gray-800 bg-gray-50/60'
          }`}>
            <span className="font-semibold flex items-center gap-2">
              <Clock size={16} />
              History
            </span>
            <button onClick={toggleHistory} className={`p-1.5 rounded-lg hover:bg-opacity-80 transition-all duration-200 transform hover:scale-110 ${
              isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}>
              <X size={16} />
            </button>
          </div>
          {['Current State', 'Added Technology Node', 'Modified Introduction', 'Added End Call Node', 'Initial Setup'].map((item, idx) => (
            <div key={idx} className={`p-4 text-sm cursor-pointer border-b last:border-b-0 transition-all duration-200 transform hover:scale-105 hover:translate-x-1 ${
              idx === 0 
                ? isDarkMode 
                  ? 'text-blue-400 font-semibold hover:bg-gray-700/60 bg-blue-900/20' 
                  : 'text-blue-600 font-semibold hover:bg-blue-50/80 bg-blue-50/40'
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700/60' 
                  : 'text-gray-600 hover:bg-gray-50/80'
            } ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100/50'}`}>
              <div className="flex items-center gap-2">
                {idx === 0 && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                {item}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FlowDesignerCanvasControls;
