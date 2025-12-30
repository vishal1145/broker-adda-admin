'use client';

import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-hot-toast';

type ImportType = 'brokers' | 'leads' | 'properties';

interface ImportResult {
  message: string;
  summary: {
    totalRows: number;
    successfulImports: number;
    failedImports: number;
  };
  imported: Array<{
    row: number;
    id: string;
    name: string;
    phone?: string;
    [key: string]: unknown;
  }>;
  failedRows: Array<{
    row: number;
    data: Record<string, string>;
    error: string;
  }>;
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<ImportType>('brokers');
  const [files, setFiles] = useState<Record<ImportType, File | null>>({
    brokers: null,
    leads: null,
    properties: null
  });
  const [importing, setImporting] = useState<Record<ImportType, boolean>>({
    brokers: false,
    leads: false,
    properties: false
  });
  const [results, setResults] = useState<Record<ImportType, ImportResult | null>>({
    brokers: null,
    leads: null,
    properties: null
  });
  const [errors, setErrors] = useState<Record<ImportType, string>>({
    brokers: '',
    leads: '',
    properties: ''
  });
  
  const fileInputRefs = {
    brokers: useRef<HTMLInputElement>(null),
    leads: useRef<HTMLInputElement>(null),
    properties: useRef<HTMLInputElement>(null)
  };

  const tabs = [
    { id: 'brokers' as ImportType, name: 'Brokers', icon: '👥' },
    { id: 'leads' as ImportType, name: 'Enquiries', icon: '📋' },
    { id: 'properties' as ImportType, name: 'Properties', icon: '🏘️' }
  ];

  const handleFileSelect = (type: ImportType, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setErrors({ ...errors, [type]: 'Please select a CSV file' });
        toast.error('Please select a CSV file');
        setFiles({ ...files, [type]: null });
        return;
      }
      setFiles({ ...files, [type]: selectedFile });
      setErrors({ ...errors, [type]: '' });
      setResults({ ...results, [type]: null });
    }
  };

  const handleImport = async (type: ImportType) => {
    const file = files[type];
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setImporting({ ...importing, [type]: true });
    setErrors({ ...errors, [type]: '' });

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('csvFile', file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://broker-adda-be.algofolks.com/api';
      const endpoint = type === 'brokers' ? '/import/brokers' : 
                       type === 'leads' ? '/import/leads' : 
                       '/import/properties';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || errorData.message || `Failed to import ${type}`);
        } catch {
          throw new Error(errorText || `Failed to import ${type}`);
        }
      }

      const responseData = await response.json();

      // Handle different response structures - check message first, then data
      const importData = responseData.message || responseData.data || responseData;

      // Extract summary
      const summary = importData.summary || {
        totalRows: importData.totalRows || 0,
        successfulImports: importData.successfulImports || 0,
        failedImports: importData.failedImports || 0
      };

      // Extract imported items (try multiple field names)
      const imported = importData.importedBrokers || 
                       importData.importedLeads || 
                       importData.importedProperties ||
                       importData.imported || 
                       importData.success || 
                       [];

      // Extract failed rows
      const failedRows = importData.failedRows || 
                        importData.failed || 
                        importData.errors || 
                        [];

      const normalizedResult: ImportResult = {
        message: importData.message || 'Import completed',
        summary: {
          totalRows: summary.totalRows || (imported.length + failedRows.length) || 0,
          successfulImports: summary.successfulImports || imported.length || 0,
          failedImports: summary.failedImports || failedRows.length || 0
        },
        imported: imported,
        failedRows: failedRows
      };

      setResults({ ...results, [type]: normalizedResult });

      if (normalizedResult.summary.successfulImports > 0) {
        toast.success(
          `Successfully imported ${normalizedResult.summary.successfulImports} ${type}!`
        );
      }

      if (normalizedResult.summary.failedImports > 0) {
        toast.error(
          `${normalizedResult.summary.failedImports} import(s) failed. Check details below.`
        );
      }

      if (normalizedResult.summary.totalRows === 0) {
        toast.error('No data found in CSV file');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to import ${type}`;
      setErrors({ ...errors, [type]: errorMessage });
      toast.error(errorMessage);
    } finally {
      setImporting({ ...importing, [type]: false });
    }
  };

  const handleReset = (type: ImportType) => {
    setFiles({ ...files, [type]: null });
    setResults({ ...results, [type]: null });
    setErrors({ ...errors, [type]: '' });
    if (fileInputRefs[type].current) {
      fileInputRefs[type].current.value = '';
    }
  };

  const getHelpText = (type: ImportType) => {
    switch (type) {
      case 'brokers':
        return {
          required: 'Full Name, Phone',
          optional: 'Email, Gender, Firm Name, WhatsApp Number, Experience, etc.',
          notes: 'Phone must be 10-15 digits and unique'
        };
      case 'leads':
        return {
          required: 'Customer Name, Phone, Requirement, Property Type, Primary Region',
          optional: 'Email, Budget, Optional Region',
          notes: 'Use "Phone" (not "Contact Phone"), Primary Region must have a value'
        };
      case 'properties':
        return {
          required: 'Title, Location, Property Type, Price',
          optional: 'Bedrooms, Bathrooms, Area, Description',
          notes: 'Price must be numeric value'
        };
    }
  };

  const currentResult = results[activeTab];
  const currentFile = files[activeTab];
  const currentError = errors[activeTab];
  const isImporting = importing[activeTab];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Import multiple records from CSV files - Brokers, Enquiries, or Properties
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Error Message */}
          {currentError && !currentResult && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {currentError}
              </div>
            </div>
          )}


          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upload CSV File
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a CSV file containing {activeTab} data to import
            </p>

            {/* File Input */}
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <label className="relative cursor-pointer">
                  <input
                    ref={fileInputRefs[activeTab]}
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileSelect(activeTab, e)}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Choose File
                  </span>
                </label>

                {currentFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{currentFile.name}</span>
                    <span className="text-gray-500">
                      ({(currentFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleImport(activeTab)}
                disabled={!currentFile || isImporting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm shadow-sm transition-colors ${
                  !currentFile || isImporting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import {tabs.find(t => t.id === activeTab)?.name}
                  </>
                )}
              </button>

              {currentFile && !isImporting && (
                <button
                  onClick={() => handleReset(activeTab)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Import Results */}
          {currentResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Import Results
              </h2>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-xs font-medium">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-900">{currentResult?.summary?.totalRows || 0}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-green-600 text-xs font-medium">Successful</p>
                  <p className="text-2xl font-bold text-green-700">{currentResult?.summary?.successfulImports || 0}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-red-600 text-xs font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{currentResult?.summary?.failedImports || 0}</p>
                </div>
              </div>

              {/* Successfully Imported */}
              {currentResult?.imported && currentResult.imported.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Successfully Imported ({currentResult.imported.length})
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="min-w-full divide-y divide-green-200">
                        <thead className="bg-green-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Row</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Name</th>
                            {activeTab !== 'properties' && (
                              <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Phone</th>
                            )}
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                          {currentResult.imported.map((item, index) => {
                            // Handle different field names from API
                            const name = String(item.name || item.customerName || item.title || '-');
                            const phone = String(item.phone || item.customerPhone || '-');
                            const id = String(item.id || item._id || item.userId || item.leadId || item.propertyId || '-');
                            const row = typeof item.row === 'number' ? item.row : index + 1;
                            
                            return (
                              <tr key={`${id}-${index}`} className="hover:bg-green-100 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900">{row}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{name}</td>
                                {activeTab !== 'properties' && (
                                  <td className="px-4 py-3 text-sm text-gray-900">{phone}</td>
                                )}
                                <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{id}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed Imports */}
              {currentResult?.failedRows && currentResult.failedRows.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Failed Imports ({currentResult.failedRows.length})
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg">
                    <div className="max-h-64 overflow-y-auto">
                      <div className="divide-y divide-red-200">
                        {currentResult.failedRows.map((failedRow, index) => (
                          <div key={index} className="p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-200 text-red-800 text-xs font-semibold">
                                  {typeof failedRow.row === 'number' ? failedRow.row : index + 1}
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-red-900 mb-1">
                                  {String(failedRow.error || 'Unknown error')}
                                </p>
                                <div className="text-xs text-red-700">
                                  <span className="font-semibold">Data:</span>{' '}
                                  {Object.entries(failedRow.data || {})
                                    .map(([key, value]) => `${key}: ${String(value)}`)
                                    .join(', ')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements for {tabs.find(t => t.id === activeTab)?.name}</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>Required columns:</strong> {getHelpText(activeTab).required}</li>
                  <li><strong>Optional columns:</strong> {getHelpText(activeTab).optional}</li>
                  <li><strong>Note:</strong> {getHelpText(activeTab).notes}</li>
                  <li><strong>File size:</strong> Maximum 5MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

