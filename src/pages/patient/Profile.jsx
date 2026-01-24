/**
 * Patient Profile Page
 * Uses GET/PUT endpoints from PatientController
 */

import { useState } from 'react';
import { useGetMyPatientProfileQuery, useUpdateMyPatientProfileMutation } from '../../features/user/patientApi';
import ProfileLayout from '../../components/profile/ProfileLayout';
import {
  ProfileField,
  EditableField,
  ProfileSection,
  StatusBadge,
  InfoCard,
  ActionButton,
} from '../../components/profile/ProfileFields';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';

const PatientProfile = () => {
  const { data: profile, isLoading, error } = useGetMyPatientProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyPatientProfileMutation();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Initialize form data when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        bloodGroup: profile.bloodGroup || '',
        phoneNumber: profile.phoneNumber || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        postalCode: profile.postalCode || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
      // Show success message
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Show error message
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Profile Completion"
          value={`${profile?.profileCompleteness || 0}%`}
          color="blue"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <InfoCard
          title="Appointments"
          value={profile?.totalAppointments || 0}
          color="green"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <InfoCard
          title="Last Visit"
          value={profile?.lastVisitDate ? new Date(profile.lastVisitDate).toLocaleDateString() : 'N/A'}
          color="primary"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <ProfileSection title="Basic Information">
        <ProfileField label="Full Name" value={`${profile?.firstName} ${profile?.lastName}`} />
        <ProfileField label="Email" value={profile?.email} />
        <ProfileField label="Phone" value={profile?.phoneNumber} />
        <ProfileField label="Date of Birth" value={profile?.dateOfBirth} />
        <ProfileField label="Gender" value={profile?.gender} />
        <ProfileField label="Blood Group" value={profile?.bloodGroup} />
      </ProfileSection>
    </div>
  );

  const renderPersonal = () => (
    <ProfileSection title="Personal Information" subtitle="Your personal and medical details">
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <EditableField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <EditableField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
          <EditableField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
          />
          <EditableField
            label="Blood Group"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleInputChange}
          />
          <div className="flex space-x-3 pt-4">
            <ActionButton type="submit" loading={isUpdating}>
              Save Changes
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </ActionButton>
          </div>
        </form>
      ) : (
        <>
          <ProfileField label="First Name" value={profile?.firstName} />
          <ProfileField label="Last Name" value={profile?.lastName} />
          <ProfileField label="Date of Birth" value={profile?.dateOfBirth} />
          <ProfileField label="Gender" value={profile?.gender} />
          <ProfileField label="Blood Group" value={profile?.bloodGroup} />
          <ProfileField label="Allergies" value={profile?.allergies?.join(', ')} />
          <ProfileField label="Chronic Conditions" value={profile?.chronicConditions?.join(', ')} />
        </>
      )}
    </ProfileSection>
  );

  const renderContact = () => (
    <ProfileSection title="Contact Information" subtitle="Your contact details and emergency contacts">
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <EditableField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
          <EditableField
            label="Emergency Contact Name"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleInputChange}
          />
          <EditableField
            label="Emergency Contact Phone"
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={handleInputChange}
          />
          <EditableField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
          <EditableField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />
          <div className="flex space-x-3 pt-4">
            <ActionButton type="submit" loading={isUpdating}>
              Save Changes
            </ActionButton>
            <ActionButton variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </ActionButton>
          </div>
        </form>
      ) : (
        <>
          <ProfileField label="Phone Number" value={profile?.phoneNumber} />
          <ProfileField label="Emergency Contact" value={profile?.emergencyContactName} />
          <ProfileField label="Emergency Phone" value={profile?.emergencyContactPhone} />
          <ProfileField label="Address" value={profile?.address} />
          <ProfileField label="City" value={profile?.city} />
          <ProfileField label="State" value={profile?.state} />
          <ProfileField label="Postal Code" value={profile?.postalCode} />
        </>
      )}
    </ProfileSection>
  );

  const renderStatus = () => (
    <ProfileSection title="Account Status" subtitle="Your account status and permissions">
      <ProfileField label="Account Status" value={<StatusBadge status={profile?.status} />} />
      <ProfileField label="Email Verified" value={profile?.emailVerified ? 'Yes' : 'No'} />
      <ProfileField label="Treatment Consent" value={profile?.treatmentConsent ? 'Given' : 'Not Given'} />
      <ProfileField label="Profile Complete" value={`${profile?.profileCompleteness || 0}%`} />
      <ProfileField label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'} />
    </ProfileSection>
  );

  const renderSecurity = () => (
    <ProfileSection title="Security Settings" subtitle="Manage your account security">
      <ProfileField label="Email" value={profile?.email} />
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
      subtitle={`${profile?.firstName} ${profile?.lastName} - Patient`}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        !isEditing && (activeTab === 'personal' || activeTab === 'contact') && (
          <ActionButton onClick={() => setIsEditing(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </ActionButton>
        )
      }
    >
      {renderContent()}
    </ProfileLayout>
  );
};

export default PatientProfile;
