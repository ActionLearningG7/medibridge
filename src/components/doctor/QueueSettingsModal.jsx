/**
 * Queue Settings Modal Component
 * Configure queue settings like average consultation time
 */

import { useState } from 'react';

const QueueSettingsModal = ({ currentSettings, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    avgConsultationMinutes: currentSettings.avgConsultationMinutes || 15,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.avgConsultationMinutes < 5) {
      newErrors.avgConsultationMinutes = 'Must be at least 5 minutes';
    }
    if (formData.avgConsultationMinutes > 120) {
      newErrors.avgConsultationMinutes = 'Must be less than 120 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-medium text-gray-900">
            Queue Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Average Consultation Time */}
          <div>
            <label htmlFor="avgConsultationMinutes" className="block text-sm font-medium text-gray-700 mb-1">
              Average Consultation Time (minutes)
            </label>
            <input
              type="number"
              id="avgConsultationMinutes"
              name="avgConsultationMinutes"
              value={formData.avgConsultationMinutes}
              onChange={handleChange}
              min="5"
              max="120"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.avgConsultationMinutes
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
            />
            {errors.avgConsultationMinutes && (
              <p className="mt-1 text-sm text-red-600">{errors.avgConsultationMinutes}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This is used to calculate estimated wait times for patients
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">How this works</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Wait time = Position × Avg consultation time</li>
                    <li>Emergency patients are prioritized</li>
                    <li>Adjust based on your typical consultation duration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Recommended Settings
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Quick Consultation:</span>
                <span className="font-medium">10-15 minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Consultation:</span>
                <span className="font-medium">15-20 minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Detailed Consultation:</span>
                <span className="font-medium">20-30 minutes</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QueueSettingsModal;
