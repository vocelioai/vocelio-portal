import React, { useState, useCallback, useMemo } from 'react';
import {
  Filter, X, Calendar, Users, MessageSquare, Clock,
  Download, FileText, FileSpreadsheet, Image, Search,
  ChevronDown, ChevronUp, RotateCcw, Check
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import { format, subDays } from 'date-fns';

// ===== COPILOT PROMPT #5: Advanced Filter & Export Components =====
// Sophisticated filtering system and data export functionality

export const AdvancedFilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onApply, 
  onReset,
  availableOptions = {},
  isOpen = false,
  onToggle,
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeSection, setActiveSection] = useState('dateRange');

  const filterSections = [
    {
      id: 'dateRange',
      title: 'Date Range',
      icon: Calendar,
      component: DateRangeFilter
    },
    {
      id: 'channels',
      title: 'Channels',
      icon: MessageSquare,
      component: MultiSelectFilter,
      options: availableOptions.channels || []
    },
    {
      id: 'agents',
      title: 'Agents',
      icon: Users,
      component: MultiSelectFilter,
      options: availableOptions.agents || []
    },
    {
      id: 'metrics',
      title: 'Performance Metrics',
      icon: Clock,
      component: RangeFilter
    }
  ];

  const handleFilterChange = useCallback((section, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [section]: value
    }));
  }, []);

  const handleApply = useCallback(() => {
    onFiltersChange(localFilters);
    onApply?.(localFilters);
  }, [localFilters, onFiltersChange, onApply]);

  const handleReset = useCallback(() => {
    const resetFilters = {
      dateRange: { start: subDays(new Date(), 30), end: new Date() },
      channels: [],
      agents: [],
      satisfactionRange: [0, 100],
      responseTimeRange: [0, 3600]
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset?.(resetFilters);
  }, [onFiltersChange, onReset]);

  const hasActiveFilters = useMemo(() => {
    return (
      localFilters.channels?.length > 0 ||
      localFilters.agents?.length > 0 ||
      localFilters.satisfactionRange?.[0] > 0 ||
      localFilters.satisfactionRange?.[1] < 100 ||
      localFilters.responseTimeRange?.[0] > 0 ||
      localFilters.responseTimeRange?.[1] < 3600
    );
  }, [localFilters]);

  if (!isOpen) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={onToggle}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            hasActiveFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {Object.values(localFilters).filter(v => 
                Array.isArray(v) ? v.length > 0 : v !== undefined
              ).length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
          </h3>
          <button
            onClick={onToggle}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Filter Sections Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-200">
          {filterSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Content */}
        <div className="flex-1 p-6">
          {filterSections.map((section) => {
            if (activeSection !== section.id) return null;
            
            const Component = section.component;
            return (
              <Component
                key={section.id}
                value={localFilters[section.id]}
                onChange={(value) => handleFilterChange(section.id, value)}
                options={section.options}
                title={section.title}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset All</span>
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Date Range Filter Component
const DateRangeFilter = ({ value = {}, onChange, title }) => {
  const presets = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last 12 months', days: 365 }
  ];

  const handlePresetClick = (days) => {
    onChange({
      start: subDays(new Date(), days),
      end: new Date()
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <DatePicker
            selected={value.start}
            onChange={(date) => onChange({ ...value, start: date })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="MMM dd, yyyy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <DatePicker
            selected={value.end}
            onChange={(date) => onChange({ ...value, end: date })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="MMM dd, yyyy"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.days}
              onClick={() => handlePresetClick(preset.days)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Multi-Select Filter Component
const MultiSelectFilter = ({ value = [], onChange, options = [], title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2">
        {filteredOptions.map((option) => (
          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => toggleOption(option.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
            {option.count && (
              <span className="text-xs text-gray-500">({option.count})</span>
            )}
          </label>
        ))}
      </div>

      {value.length > 0 && (
        <div className="border-t pt-4">
          <div className="text-sm text-gray-700 mb-2">Selected ({value.length}):</div>
          <div className="flex flex-wrap gap-1">
            {value.map((selectedValue) => {
              const option = options.find(opt => opt.value === selectedValue);
              return (
                <span
                  key={selectedValue}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                >
                  {option?.label || selectedValue}
                  <button
                    onClick={() => toggleOption(selectedValue)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Range Filter Component
const RangeFilter = ({ value = {}, onChange, title }) => {
  const ranges = {
    satisfactionRange: {
      label: 'Customer Satisfaction (%)',
      min: 0,
      max: 100,
      step: 1,
      format: (val) => `${val}%`
    },
    responseTimeRange: {
      label: 'Response Time (minutes)',
      min: 0,
      max: 60,
      step: 1,
      format: (val) => `${val}min`
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900">{title}</h4>
      
      {Object.entries(ranges).map(([key, config]) => (
        <div key={key} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">{config.label}</label>
          <div className="px-3">
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value[key]?.[0] || config.min}
                onChange={(e) => onChange({
                  ...value,
                  [key]: [parseInt(e.target.value), value[key]?.[1] || config.max]
                })}
                className="flex-1"
              />
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value[key]?.[1] || config.max}
                onChange={(e) => onChange({
                  ...value,
                  [key]: [value[key]?.[0] || config.min, parseInt(e.target.value)]
                })}
                className="flex-1"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>{config.format(value[key]?.[0] || config.min)}</span>
              <span>{config.format(value[key]?.[1] || config.max)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Data Export Component
export const DataExportPanel = ({ 
  data, 
  fileName = 'analytics-export', 
  onExport,
  formats = ['csv', 'json', 'pdf', 'png'],
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    includeMetadata: true,
    compressed: false
  });

  const formatConfigs = {
    csv: {
      icon: FileSpreadsheet,
      label: 'CSV',
      description: 'Comma-separated values',
      mimeType: 'text/csv',
      extension: 'csv'
    },
    json: {
      icon: FileText,
      label: 'JSON',
      description: 'JavaScript Object Notation',
      mimeType: 'application/json',
      extension: 'json'
    },
    pdf: {
      icon: FileText,
      label: 'PDF',
      description: 'Portable Document Format',
      mimeType: 'application/pdf',
      extension: 'pdf'
    },
    png: {
      icon: Image,
      label: 'PNG',
      description: 'Portable Network Graphics',
      mimeType: 'image/png',
      extension: 'png'
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        data,
        format: selectedFormat,
        options: exportOptions,
        timestamp: new Date().toISOString(),
        fileName: `${fileName}.${formatConfigs[selectedFormat].extension}`
      };

      if (onExport) {
        await onExport(exportData);
      } else {
        // Default export behavior
        await defaultExport(exportData);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const defaultExport = async (exportData) => {
    let content;
    const config = formatConfigs[selectedFormat];

    switch (selectedFormat) {
      case 'csv':
        content = convertToCSV(data, exportOptions);
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'pdf':
        // Would integrate with a PDF library in a real implementation
        content = JSON.stringify(data, null, 2);
        break;
      case 'png':
        // Would capture chart as image in a real implementation
        content = 'Chart export not implemented';
        break;
      default:
        content = JSON.stringify(data, null, 2);
    }

    const blob = new Blob([content], { type: config.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportData.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data, options) => {
    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      options.includeHeaders ? headers.join(',') : null,
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].filter(Boolean).join('\n');

    return csvContent;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Data</span>
        </h3>
        <p className="text-gray-600">Choose format and options for exporting your data</p>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
        <div className="grid grid-cols-2 gap-3">
          {formats.map((format) => {
            const config = formatConfigs[format];
            const Icon = config.icon;
            return (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                  selectedFormat === format
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs opacity-75">{config.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Options</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeHeaders}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeHeaders: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include column headers</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeMetadata}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                includeMetadata: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include metadata</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.compressed}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                compressed: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Compress file</span>
          </label>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !data || data.length === 0}
        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
          isExporting || !data || data.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Download className="h-4 w-4" />
        <span>{isExporting ? 'Exporting...' : `Export as ${formatConfigs[selectedFormat].label}`}</span>
      </button>

      {data && data.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Ready to export {data.length} records
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;
