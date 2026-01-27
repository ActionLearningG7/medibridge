/**
 * Result Upload Modal
 * Modal for uploading lab result files with drag-and-drop
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal, Button, Toast } from '../../ui';
import { useUploadLabResultMutation } from '../../app/api/phlebotomistResultsApi';

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ResultUploadModal({ isOpen, onClose, order, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [toastState, setToastState] = useState({ isOpen: false, type: 'success', message: '' });

  const [uploadResult, { isLoading: isUploading }] = useUploadLabResultMutation();

  const showToast = (type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState({ ...toastState, isOpen: false }), 5000);
  };

  const validateFile = (file) => {
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return 'Only PDF and image files (JPG, PNG) are allowed';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setValidationError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setValidationError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setValidationError('Invalid file type. Only PDF and images are allowed');
      } else {
        setValidationError('File was rejected. Please try another file');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const error = validateFile(file);

      if (error) {
        setValidationError(error);
        return;
      }

      setSelectedFile(file);
      setValidationError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setValidationError('Please select a file to upload');
      return;
    }

    try {
      const result = await uploadResult({
        orderId: order.id,
        file: selectedFile,
        notes: notes.trim() || undefined,
      }).unwrap();

      showToast('success', 'Lab result uploaded successfully!');

      // Reset form
      setSelectedFile(null);
      setNotes('');
      setValidationError(null);

      // Call success callback
      setTimeout(() => {
        onSuccess && onSuccess(result);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to upload result';
      showToast('error', errorMessage);
      setValidationError(errorMessage);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Lab Result</h2>
              {order && (
                <p className="text-sm text-gray-600 mt-1">
                  Order: {order.orderNumber} - {order.testName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Patient Info */}
            {order && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Patient:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.patientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Collection Date:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.collectionDate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result File <span className="text-red-600">*</span>
              </label>

              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : validationError
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${
                    isDragActive ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  {isDragActive ? (
                    <p className="text-blue-600 font-medium">Drop the file here...</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium mb-1">
                        Drag and drop a file here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPG, or PNG (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedFile)}
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      disabled={isUploading}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {validationError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isUploading}
                rows={3}
                placeholder="Add any notes about this result..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Only upload verified and finalized lab results</li>
                    <li>Ensure patient information matches the order</li>
                    <li>File will be securely stored and accessible to the patient</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Result
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {toastState.isOpen && (
        <Toast
          variant={toastState.type}
          title={toastState.type === 'success' ? 'Success' : 'Error'}
          message={toastState.message}
          isOpen={toastState.isOpen}
          onClose={() => setToastState({ ...toastState, isOpen: false })}
        />
      )}
    </>
  );
}
