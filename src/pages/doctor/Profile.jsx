/**
 * Doctor Profile Page
 * Uses GET endpoint from DoctorController
 */

import { useState } from 'react';
import { useGetMyDoctorProfileQuery } from '../../features/user/doctorApi';
import ProfileLayout from '../../components/profile/ProfileLayout';
import {
  ProfileField,
  ProfileSection,
  StatusBadge,
  InfoCard,
  ActionButton,
} from '../../components/profile/ProfileFields';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';

const DoctorProfile = () => {
  const { data: profile, isLoading, error } = useGetMyDoctorProfileQuery();
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InfoCard
          title="Patients Today"
          value={profile?.patientsToday || 0}
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <InfoCard
          title="Total Patients"
          value={profile?.totalPatients || 0}
          color="green"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <InfoCard
          title="Experience"
          value={`${profile?.yearsOfExperience || 0} years`}
          color="primary"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
        <InfoCard
          title="Verification"
          value={profile?.verificationStatus || 'Pending'}
          color={profile?.verificationStatus === 'VERIFIED' ? 'green' : 'yellow'}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
      </div>

      <ProfileSection title="Professional Information">
        <ProfileField label="Full Name" value={`Dr. ${profile?.firstName} ${profile?.lastName}`} />
        <ProfileField label="Specialization" value={profile?.specialization} />
        <ProfileField label="Department" value={profile?.department} />
        <ProfileField label="Medical License" value={profile?.medicalLicenseNumber} />
        <ProfileField label="License Expiry" value={profile?.licenseExpiryDate} />
        <ProfileField label="Consultation Fee" value={`$${profile?.consultationFee || 0}`} />
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
        <ProfileField label="Date of Birth" value={profile?.dateOfBirth} />
        <ProfileField label="Gender" value={profile?.gender} />
      </ProfileSection>

      <ProfileSection title="Professional Details">
        <ProfileField label="Medical License Number" value={profile?.medicalLicenseNumber} />
        <ProfileField label="License Issued Date" value={profile?.licenseIssuedDate} />
        <ProfileField label="License Expiry Date" value={profile?.licenseExpiryDate} />
        <ProfileField label="Years of Experience" value={`${profile?.yearsOfExperience} years`} />
        <ProfileField label="Medical School" value={profile?.medicalSchool} />
        <ProfileField label="Graduation Year" value={profile?.graduationYear} />
      </ProfileSection>

      <ProfileSection title="Specialization & Expertise">
        <ProfileField label="Primary Specialization" value={profile?.specialization} />
        <ProfileField label="Sub-Specializations" value={profile?.subSpecializations?.join(', ')} />
        <ProfileField label="Languages Spoken" value={profile?.languagesSpoken?.join(', ')} />
        <ProfileField label="Bio" value={profile?.bio} />
      </ProfileSection>
    </div>
  );

  const renderContact = () => (
    <ProfileSection title="Contact Information">
      <ProfileField label="Phone Number" value={profile?.phoneNumber} />
      <ProfileField label="Email" value={profile?.email} />
      <ProfileField label="Department" value={profile?.department} />
      <ProfileField label="Office Location" value={profile?.officeLocation} />
      <ProfileField label="Office Hours" value={profile?.officeHours} />
    </ProfileSection>
  );

  const renderStatus = () => (
    <div className="space-y-6">
      <ProfileSection title="Account Status">
        <ProfileField label="Account Status" value={<StatusBadge status={profile?.status} />} />
        <ProfileField label="Verification Status" value={<StatusBadge status={profile?.verificationStatus} />} />
        <ProfileField label="Available for Consultation" value={profile?.availableForConsultation ? 'Yes' : 'No'} />
        <ProfileField label="Available for Emergency" value={profile?.availableForEmergency ? 'Yes' : 'No'} />
        <ProfileField label="Email Verified" value={profile?.emailVerified ? 'Yes' : 'No'} />
      </ProfileSection>

      {profile?.verificationStatus === 'VERIFIED' && (
        <ProfileSection title="Verification Details">
          <ProfileField label="Verified By" value={profile?.verifiedBy} />
          <ProfileField label="Verified At" value={profile?.verifiedAt ? new Date(profile.verifiedAt).toLocaleDateString() : 'N/A'} />
          <ProfileField label="Verification Notes" value={profile?.verificationNotes} />
        </ProfileSection>
      )}

      <ProfileSection title="Activity">
        <ProfileField label="Total Appointments" value={profile?.totalAppointments || 0} />
        <ProfileField label="Total Patients" value={profile?.totalPatients || 0} />
        <ProfileField label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'} />
        <ProfileField label="Last Active" value={profile?.lastActiveAt ? new Date(profile.lastActiveAt).toLocaleString() : 'N/A'} />
      </ProfileSection>
    </div>
  );

  const renderSecurity = () => (
    <ProfileSection title="Security Settings">
      <ProfileField label="Email" value={profile?.email} />
      <ProfileField label="Two-Factor Authentication" value="Disabled" />
      <ProfileField label="Last Password Change" value="30 days ago" />
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
      title="My Profile"
      subtitle={`Dr. ${profile?.firstName} ${profile?.lastName} - ${profile?.specialization}`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <>
          {profile?.verificationStatus !== 'VERIFIED' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800">
              ⚠️ Verification Pending
            </div>
          )}
          <ActionButton variant="secondary">
            Edit Availability
          </ActionButton>
        </>
      }
    >
      {renderContent()}
    </ProfileLayout>
  );
};

export default DoctorProfile;
