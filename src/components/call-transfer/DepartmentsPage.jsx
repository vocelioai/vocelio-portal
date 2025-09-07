import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Phone, Building2, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { callTransferAPI } from '../../config/api.js';
import { getCurrentUser } from '../../utils/auth.js';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone_number: '' });
  const [submitting, setSubmitting] = useState(false);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.user_metadata?.role === 'admin';

  // Department colors for badge styling
  const departmentColors = {
    billing: 'bg-blue-100 text-blue-800 border-blue-200',
    sales: 'bg-green-100 text-green-800 border-green-200',
    support: 'bg-orange-100 text-orange-800 border-orange-200',
    management: 'bg-purple-100 text-purple-800 border-purple-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const getDepartmentColor = (name) => {
    const lowerName = name.toLowerCase();
    return departmentColors[lowerName] || departmentColors.default;
  };

  // Load departments
  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading departments...');
      const data = await callTransferAPI.getDepartments();
      console.log('Departments loaded:', data);
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
      
      // Check if it's a network error (backend not available)
      if (err.message.includes('Network error') || err.message.includes('Cannot connect')) {
        setError('Call Transfer Service is not available yet. Please implement the backend API endpoints for departments management.');
      } else {
        setError('Failed to load departments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDepartments();
    }
  }, [isAdmin]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone_number.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null); // Clear any previous errors
    
    try {
      console.log('Attempting to save department:', formData);
      
      if (editingDepartment) {
        // Update existing department
        console.log('Updating department:', editingDepartment.id);
        await callTransferAPI.updateDepartment(editingDepartment.id, formData);
      } else {
        // Create new department
        console.log('Creating new department');
        const result = await callTransferAPI.createDepartment(formData);
        console.log('Department created successfully:', result);
      }
      
      // Reset form and close modal
      setFormData({ name: '', phone_number: '' });
      setShowAddModal(false);
      setEditingDepartment(null);
      
      // Reload departments
      await loadDepartments();
    } catch (err) {
      console.error('Failed to save department - Full error:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create department.';
      if (editingDepartment) {
        errorMessage = 'Failed to update department.';
      }
      
      if (err.message) {
        errorMessage += ` Error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (department) => {
    if (!window.confirm(`Are you sure you want to delete the ${department.name} department?`)) {
      return;
    }

    try {
      await callTransferAPI.deleteDepartment(department.id);
      await loadDepartments();
    } catch (err) {
      console.error('Failed to delete department:', err);
      setError('Failed to delete department.');
    }
  };

  // Handle edit
  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({ name: department.name, phone_number: department.phone_number });
    setShowAddModal(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowAddModal(false);
    setEditingDepartment(null);
    setFormData({ name: '', phone_number: '' });
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium mb-2 text-red-600">Access Restricted</h3>
          <p>Only administrators can manage departments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
          <p className="text-gray-600 mt-1">Manage call transfer departments and phone numbers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Departments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Departments</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first department.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Add Department
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {department.name}
                          </div>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDepartmentColor(department.name)}`}>
                            {department.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {formatPhoneNumber(department.phone_number)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(department)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(department)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sales, Support, Billing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting || !formData.name.trim() || !formData.phone_number.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                >
                  {submitting ? (
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {submitting ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
