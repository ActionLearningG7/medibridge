/**
 * Admin Profile Page
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import ProfileLayout from '../../components/profile/ProfileLayout';
import {
  ProfileField,
  ProfileSection,
  StatusBadge,
  InfoCard,
  ActionButton,
} from '../../components/profile/ProfileFields';

const AdminProfile = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('overview');

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="System Role"
          value={currentUser?.role || 'ADMIN'}
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <InfoCard
          title="Account Status"
          value="ACTIVE"
          color="green"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <InfoCard
          title="Admin Since"
          value={currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
          color="primary"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      <ProfileSection title="Administrative Information">
        <ProfileField label="Full Name" value={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`} />
        <ProfileField label="Email" value={currentUser?.email} />
        <ProfileField label="Admin ID" value={currentUser?.id} />
        <ProfileField label="Role" value={currentUser?.role} />
      </ProfileSection>
    </div>
  );

  const renderPersonal = () => (
    <ProfileSection title="Personal Information">
      <ProfileField label="First Name" value={currentUser?.firstName} />
      <ProfileField label="Last Name" value={currentUser?.lastName} />
      <ProfileField label="Email" value={currentUser?.email} />
    </ProfileSection>
  );

  const renderContact = () => (
    <ProfileSection title="Contact Information">
      <ProfileField label="Email" value={currentUser?.email} />
      <ProfileField label="Department" value="Administration" />
    </ProfileSection>
  );

  const renderStatus = () => (
    <ProfileSection title="Account Status">
      <ProfileField label="Status" value={<StatusBadge status="ACTIVE" />} />
      <ProfileField label="Role" value={currentUser?.role} />
      <ProfileField label="Last Login" value={new Date().toLocaleString()} />
    </ProfileSection>
  );

  const renderSecurity = () => (
    <ProfileSection title="Security Settings">
      <ProfileField label="Email" value={currentUser?.email} />
      <ProfileField label="Two-Factor Authentication" value="Enabled" />
      <div className="pt-4">
        <ActionButton variant="secondary">
          Change Password
        </ActionButton>
      </div>
    </ProfileSection>
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
      subtitle={`${currentUser?.firstName} ${currentUser?.lastName} - System Administrator`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </ProfileLayout>
  );
};

export default AdminProfile;
