/**
 * Admin Profile Page
 * Uses GET endpoint from AdminController
 * Admin sees more fields than other roles
 */

import { useState } from 'react';
import { useGetMyAdminProfileQuery, useGetSystemStatisticsQuery } from '../../features/user/adminApi';
import ProfileLayout from '../../components/profile/ProfileLayout';
import {
  ProfileField,
  ProfileSection,
  StatusBadge,
  InfoCard,
  ActionButton,
} from '../../components/profile/ProfileFields';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';

const AdminProfile = () => {
  const { data: profile, isLoading, error } = useGetMyAdminProfileQuery();
  const { data: statistics } = useGetSystemStatisticsQuery();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Profile</h2>
          <p className="mt-2 text-gray-600">{error?.data?.message || 'Failed to load profile'}</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Statistics */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoCard
            title="Total Users"
            value={statistics?.totalUsers || 0}
            color="blue"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <InfoCard
            title="Active Doctors"
            value={statistics?.activeDoctors || 0}
            color="green"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
          <InfoCard
            title="Total Patients"
            value={statistics?.totalPatients || 0}
            color="primary"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <InfoCard
            title="Today's Appointments"
            value={statistics?.todayAppointments || 0}
            color="yellow"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Admin Profile Info */}
      <ProfileSection title="Admin Information">
        <ProfileField label="Full Name" value={`${profile?.firstName} ${profile?.lastName}`} />
        <ProfileField label="Admin Level" value={<StatusBadge status={profile?.adminLevel} />} />
        <ProfileField label="Department" value={profile?.department} />
        <ProfileField label="Position" value={profile?.position} />
        <ProfileField label="Employee ID" value={profile?.employeeId} />
        <ProfileField label="Email" value={profile?.email} />
        <ProfileField label="Phone" value={profile?.phoneNumber} />
      </ProfileSection>

      {/* Permissions */}
      <ProfileSection title="Administrative Permissions">
        <ProfileField label="Can Verify Doctors" value={profile?.canVerifyDoctors ? '✅ Yes' : '❌ No'} />
        <ProfileField label="Can Manage Users" value={profile?.canManageUsers ? '✅ Yes' : '❌ No'} />
        <ProfileField label="Can Access Reports" value={profile?.canAccessReports ? '✅ Yes' : '❌ No'} />
        <ProfileField label="Can Modify System Settings" value={profile?.canModifySystemSettings ? '✅ Yes' : '❌ No'} />
      </ProfileSection>
    </div>
  );

  const renderPersonal = () => (
    <div className="space-y-6">
      <ProfileSection title="Personal Information">
        <ProfileField label="First Name" value={profile?.firstName} />
        <ProfileField label="Last Name" value={profile?.lastName} />
        <ProfileField label="Email" value={profile?.email} />
        <ProfileField label="Phone Number" value={profile?.phoneNumber} />
        <ProfileField label="Employee ID" value={profile?.employeeId} />
        <ProfileField label="Date of Birth" value={profile?.dateOfBirth} />
        <ProfileField label="Gender" value={profile?.gender} />
      </ProfileSection>

      <ProfileSection title="Professional Details">
        <ProfileField label="Admin Level" value={profile?.adminLevel} />
        <ProfileField label="Department" value={profile?.department} />
        <ProfileField label="Position" value={profile?.position} />
        <ProfileField label="Manager" value={profile?.managerName} />
        <ProfileField label="Office Location" value={profile?.officeLocation} />
        <ProfileField label="Extension" value={profile?.extension} />
      </ProfileSection>

      <ProfileSection title="Emergency Contact">
        <ProfileField label="Emergency Contact Name" value={profile?.emergencyContactName} />
        <ProfileField label="Emergency Contact Phone" value={profile?.emergencyContactPhone} />
        <ProfileField label="Emergency Contact Relationship" value={profile?.emergencyContactRelationship} />
      </ProfileSection>
    </div>
  );

  const renderContact = () => (
    <ProfileSection title="Contact Information">
      <ProfileField label="Work Email" value={profile?.email} />
      <ProfileField label="Work Phone" value={profile?.phoneNumber} />
      <ProfileField label="Extension" value={profile?.extension} />
      <ProfileField label="Department" value={profile?.department} />
      <ProfileField label="Office Location" value={profile?.officeLocation} />
      <ProfileField label="Working Hours" value={profile?.workingHours} />
    </ProfileSection>
  );

  const renderStatus = () => (
    <div className="space-y-6">
      <ProfileSection title="Account Status">
        <ProfileField label="Account Status" value={<StatusBadge status={profile?.status} />} />
        <ProfileField label="Admin Level" value={<StatusBadge status={profile?.adminLevel} />} />
        <ProfileField label="Email Verified" value={profile?.emailVerified ? '✅ Yes' : '❌ No'} />
        <ProfileField label="Active Sessions" value={profile?.activeSessions || 0} />
      </ProfileSection>

      <ProfileSection title="Compliance & Training">
        <ProfileField
          label="HIPAA Training Completed"
          value={profile?.hipaaTrainingCompleted ? '✅ Yes' : '❌ No'}
        />
        <ProfileField
          label="Security Training Completed"
          value={profile?.securityTrainingCompleted ? '✅ Yes' : '❌ No'}
        />
        <ProfileField
          label="Last Training Date"
          value={profile?.lastTrainingDate ? new Date(profile.lastTrainingDate).toLocaleDateString() : 'N/A'}
        />
        <ProfileField
          label="Policy Acknowledgement"
          value={profile?.policyAcknowledged ? '✅ Acknowledged' : '❌ Pending'}
        />
      </ProfileSection>

      <ProfileSection title="Activity & Audit">
        <ProfileField label="Total Actions Logged" value={profile?.totalActions || 0} />
        <ProfileField label="Last Login" value={profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'N/A'} />
        <ProfileField label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'} />
        <ProfileField label="Last Modified By" value={profile?.lastModifiedBy} />
      </ProfileSection>

      {profile?.suspensionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900">⚠️ Account Suspended</h4>
          <p className="text-sm text-red-700 mt-2">{profile.suspensionReason}</p>
          <p className="text-xs text-red-600 mt-1">Suspended by: {profile.suspendedBy}</p>
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <ProfileSection title="Security Settings">
        <ProfileField label="Email" value={profile?.email} />
        <ProfileField label="Two-Factor Authentication" value={profile?.twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'} />
        <ProfileField label="Last Password Change" value={profile?.lastPasswordChange ? new Date(profile.lastPasswordChange).toLocaleDateString() : 'N/A'} />
        <ProfileField label="Failed Login Attempts" value={profile?.failedLoginAttempts || 0} />
      </ProfileSection>

      <ProfileSection title="Access Control">
        <ProfileField label="IP Whitelist Enabled" value={profile?.ipWhitelistEnabled ? 'Yes' : 'No'} />
        <ProfileField label="Session Timeout" value={`${profile?.sessionTimeout || 30} minutes`} />
        <ProfileField label="Last Known IP" value={profile?.lastKnownIp} />
      </ProfileSection>

      <div className="space-y-3">
        <ActionButton variant="secondary">
          Change Password
        </ActionButton>
        <ActionButton variant="secondary">
          {profile?.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
        </ActionButton>
        <ActionButton variant="danger">
          View Security Logs
        </ActionButton>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonal();
      case 'contact':
        return renderContact();
      case 'status':
        return renderStatus();
      case 'security':
        return renderSecurity();
      default:
        return renderOverview();
    }
  };

  return (
    <ProfileLayout
      title="Admin Profile"
      subtitle={`${profile?.firstName} ${profile?.lastName} - ${profile?.adminLevel} Administrator`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          <ActionButton variant="secondary">
            View Audit Log
          </ActionButton>
          <ActionButton variant="secondary">
            System Dashboard
          </ActionButton>
        </>
      }
    >
      {renderContent()}
    </ProfileLayout>
  );
};

export default AdminProfile;
