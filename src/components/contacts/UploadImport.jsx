import React, { useState, useRef } from 'react';
import { 
  Upload, Download, FileText, AlertCircle, CheckCircle, 
  X, Plus, Database, FileSpreadsheet, Users, Phone,
  Mail, User, MapPin, Building, Calendar, Loader
} from 'lucide-react';

const UploadImport = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadedFile, setUploadedFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [createNewList, setCreateNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  const fileInputRef = useRef(null);

  // Mock data for existing lists
  const existingLists = [
    { id: 'list_001', name: 'Real Estate Leads Q4 2025', contactCount: 1247 },
    { id: 'list_002', name: 'Follow-up Callbacks', contactCount: 89 },
    { id: 'list_003', name: 'Customer Support Queue', contactCount: 23 }
  ];

  // Mock import results
  const mockImportResults = {
    totalRows: 1250,
    validContacts: 1180,
    invalidContacts: 70,
    duplicates: 45,
    imported: 1135,
    skipped: 115,
    errors: [
      { row: 15, error: 'Invalid phone number format: "555-CALL"' },
      { row: 23, error: 'Missing required field: phone' },
      { row: 47, error: 'Invalid email format: "john@example"' },
      { row: 89, error: 'Duplicate phone number: +1234567890' }
    ]
  };

  // Sample CSV template data
  const csvTemplate = [
    ['first_name', 'last_name', 'phone', 'email', 'company', 'address', 'city', 'state', 'zip'],
    ['John', 'Doe', '+1234567890', 'john@example.com', 'Acme Corp', '123 Main St', 'New York', 'NY', '10001'],
    ['Jane', 'Smith', '+0987654321', 'jane@example.com', 'Tech Inc', '456 Oak Ave', 'Los Angeles', 'CA', '90210'],
    ['Mike', 'Johnson', '+1122334455', 'mike@example.com', 'Design Co', '789 Pine Rd', 'Chicago', 'IL', '60601']
  ];

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('idle');
      setImportResults(null);
      setValidationErrors([]);
    }
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus('idle');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Simulate file upload and processing
  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate processing time
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setImportResults(mockImportResults);
      
      // Simulate validation errors
      if (mockImportResults.errors.length > 0) {
        setValidationErrors(mockImportResults.errors);
      }
    }, 3000);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = csvTemplate
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Manual contact form
  const [manualContact, setManualContact] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });

  const handleManualSubmit = () => {
    console.log('Adding manual contact:', manualContact);
    // Reset form
    setManualContact({
      firstName: '', lastName: '', phone: '', email: '', company: '',
      address: '', city: '', state: '', zip: '', notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upload & Import</h2>
          <p className="text-gray-600">Import contacts from CSV, Excel files or add manually</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Template</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'upload', label: 'File Upload', icon: Upload },
              { id: 'manual', label: 'Manual Entry', icon: User },
              { id: 'api', label: 'API Import', icon: Database }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* File Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Destination Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import Destination
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="existing-list"
                        name="destination"
                        value="existing"
                        checked={!createNewList}
                        onChange={() => setCreateNewList(false)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="existing-list" className="text-sm text-gray-700">
                        Add to existing list
                      </label>
                    </div>
                    
                    {!createNewList && (
                      <select
                        value={selectedList}
                        onChange={(e) => setSelectedList(e.target.value)}
                        className="ml-6 w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a list...</option>
                        {existingLists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name} ({list.contactCount} contacts)
                          </option>
                        ))}
                      </select>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="new-list"
                        name="destination"
                        value="new"
                        checked={createNewList}
                        onChange={() => setCreateNewList(true)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="new-list" className="text-sm text-gray-700">
                        Create new list
                      </label>
                    </div>
                    
                    {createNewList && (
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter list name..."
                        className="ml-6 w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* File Format Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Supported Formats</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>CSV files (.csv)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Excel files (.xlsx, .xls)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Text files (.txt)</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-blue-700">
                    Maximum file size: 10MB<br />
                    Maximum contacts: 50,000 per file
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  uploadedFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {!uploadedFile ? (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Drop your file here, or click to browse
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload CSV, Excel, or text files with your contacts
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">File Selected</h3>
                    <p className="text-gray-600 mb-4">
                      {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={handleUpload}
                        disabled={uploadStatus === 'uploading' || (!selectedList && !newListName)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploadStatus === 'uploading' ? (
                          <div className="flex items-center space-x-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          'Upload & Process'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadStatus('idle');
                          setImportResults(null);
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Processing file...</span>
                    <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {importResults && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{importResults.totalRows}</div>
                      <div className="text-sm text-blue-800">Total Rows</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                      <div className="text-sm text-green-800">Imported</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{importResults.duplicates}</div>
                      <div className="text-sm text-yellow-800">Duplicates</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{importResults.invalidContacts}</div>
                      <div className="text-sm text-red-800">Errors</div>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Validation Errors ({validationErrors.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-sm text-red-800 flex items-start space-x-2">
                            <span className="font-medium">Row {error.row}:</span>
                            <span>{error.error}</span>
                          </div>
                        ))}
                        {validationErrors.length > 10 && (
                          <div className="text-sm text-red-700 font-medium">
                            ... and {validationErrors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Import completed! {importResults.imported} contacts were successfully imported.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Entry Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Add Contact Manually</h3>
                <p className="text-sm text-blue-800">
                  Enter contact information below. Required fields are marked with an asterisk (*).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={manualContact.firstName}
                        onChange={(e) => setManualContact(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={manualContact.lastName}
                        onChange={(e) => setManualContact(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={manualContact.phone}
                      onChange={(e) => setManualContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={manualContact.email}
                      onChange={(e) => setManualContact(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={manualContact.company}
                      onChange={(e) => setManualContact(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Corporation"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Address Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={manualContact.address}
                      onChange={(e) => setManualContact(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={manualContact.city}
                        onChange={(e) => setManualContact(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={manualContact.state}
                        onChange={(e) => setManualContact(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={manualContact.zip}
                      onChange={(e) => setManualContact(prev => ({ ...prev, zip: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={manualContact.notes}
                      onChange={(e) => setManualContact(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes about this contact..."
                    />
                  </div>
                </div>
              </div>

              {/* List Selection for Manual Entry */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Add to List</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a list...</option>
                    {existingLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.contactCount} contacts)
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">or</span>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Create new list..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setManualContact({
                    firstName: '', lastName: '', phone: '', email: '', company: '',
                    address: '', city: '', state: '', zip: '', notes: ''
                  })}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualContact.firstName || !manualContact.lastName || !manualContact.phone}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          )}

          {/* API Import Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">API Integration</h3>
                <p className="text-sm text-purple-800">
                  Import contacts from external systems and CRM platforms using our API endpoints.
                </p>
              </div>

              {/* API Endpoints */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Available Endpoints</h4>
                
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">POST</span>
                        <code className="text-sm font-mono text-gray-800">/api/contacts/import</code>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Import contacts via JSON payload</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">GET</span>
                        <code className="text-sm font-mono text-gray-800">/api/contacts/sync/salesforce</code>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Sync contacts from Salesforce CRM</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">GET</span>
                        <code className="text-sm font-mono text-gray-800">/api/contacts/sync/hubspot</code>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">Sync contacts from HubSpot CRM</p>
                  </div>
                </div>
              </div>

              {/* Sample Code */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Sample Implementation</h4>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
{`// Import contacts via API
const importContacts = async (contacts) => {
  const response = await fetch('/api/contacts/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_TOKEN'
    },
    body: JSON.stringify({
      list_id: 'list_001',
      contacts: contacts,
      options: {
        skip_duplicates: true,
        validate_phone: true
      }
    })
  });
  
  return response.json();
};

// Sample contact format
const sampleContacts = [
  {
    first_name: "John",
    last_name: "Doe", 
    phone: "+1234567890",
    email: "john@example.com",
    company: "Acme Corp"
  }
];`}
                  </pre>
                </div>
              </div>

              {/* Documentation Link */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Full API Documentation</h4>
                    <p className="text-sm text-gray-600">
                      Complete documentation with authentication, rate limits, and examples
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Docs
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImport;
