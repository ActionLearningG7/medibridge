/**
 * Doctor Details Drawer
 * Side drawer for viewing and managing doctor details
 */

import { useState } from 'react';
import { StatusBadge } from '../../components/profile/ProfileFields';

const DoctorDetails = ({ doctor, onClose, onDelete, onVerify, isVerifying }) => {
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [verificationData, setVerificationData] = useState({
    verified: true,
    verificationNotes: '',
  });

  const handleVerifySubmit = () => {
    onVerify(doctor.id, verificationData);
    setShowVerifyForm(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </h2>
              <p className="text-sm text-gray-500">{doctor.specialization}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <StatusBadge status={doctor.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Verification Status</p>
                <StatusBadge status={doctor.verificationStatus || 'PENDING'} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available for Consultation</p>
                <p className="text-sm font-medium text-gray-900">
                  {doctor.availableForConsultation ? '✅ Yes' : '❌ No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available for Emergency</p>
                <p className="text-sm font-medium text-gray-900">
                  {doctor.availableForEmergency ? '✅ Yes' : '❌ No'}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{doctor.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{doctor.phoneNumber || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900">{doctor.dateOfBirth || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900">{doctor.gender || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                <dd className="mt-1 text-sm text-gray-900">{doctor.specialization}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{doctor.department || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Medical License Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {doctor.medicalLicenseNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">License Issued Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {doctor.licenseIssuedDate || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">License Expiry Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {doctor.licenseExpiryDate || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {doctor.yearsOfExperience} years
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Consultation Fee</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${doctor.consultationFee || 0}
                </dd>
              </div>
            </dl>
          </div>

          {/* Education */}
          {doctor.medicalSchool && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Medical School</dt>
                  <dd className="mt-1 text-sm text-gray-900">{doctor.medicalSchool}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Graduation Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{doctor.graduationYear || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Verification Details */}
          {doctor.verificationStatus === 'VERIFIED' && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-4">✓ Verification Details</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-green-700">Verified By</dt>
                  <dd className="mt-1 text-sm text-green-900">{doctor.verifiedBy || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-green-700">Verified At</dt>
                  <dd className="mt-1 text-sm text-green-900">
                    {doctor.verifiedAt ? new Date(doctor.verifiedAt).toLocaleString() : 'N/A'}
                  </dd>
                </div>
                {doctor.verificationNotes && (
                  <div>
                    <dt className="text-sm font-medium text-green-700">Notes</dt>
                    <dd className="mt-1 text-sm text-green-900">{doctor.verificationNotes}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Verification Form */}
          {showVerifyForm && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Verify Doctor</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={verificationData.verified}
                      onChange={(e) =>
                        setVerificationData({ ...verificationData, verified: e.target.checked })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Verify this doctor</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Notes
                  </label>
                  <textarea
                    rows={3}
                    value={verificationData.verificationNotes}
                    onChange={(e) =>
                      setVerificationData({
                        ...verificationData,
                        verificationNotes: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Enter verification notes..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleVerifySubmit}
                    disabled={isVerifying}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Confirm Verification'}
                  </button>
                  <button
                    onClick={() => setShowVerifyForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">Total Patients</p>
                <p className="text-2xl font-bold text-blue-900">{doctor.totalPatients || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">Total Appointments</p>
                <p className="text-2xl font-bold text-green-900">
                  {doctor.totalAppointments || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bio</h3>
              <p className="text-sm text-gray-700">{doctor.bio}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex space-x-3">
            {doctor.verificationStatus !== 'VERIFIED' && (
              <button
                onClick={() => setShowVerifyForm(!showVerifyForm)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Verify Doctor
              </button>
            )}
            <button
              onClick={() => onDelete(doctor)}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Delete Doctor
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorDetails;
