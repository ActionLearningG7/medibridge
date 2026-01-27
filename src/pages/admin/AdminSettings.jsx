/**
 * Admin Settings Page
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout';
import { useGetHospitalAddressQuery, useUpdateHospitalAddressMutation } from '../../features/user/adminApi';
import { AddressForm } from '../../components/lab/AddressForm';
import { Button, Toast, Input } from '../../ui';
import { Building, Shield, Bell, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminSettings = () => {
  const [updateAddress, { isLoading: isUpdating }] = useUpdateHospitalAddressMutation();
  const { data: addressData, isLoading, error, refetch } = useGetHospitalAddressQuery();
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('organization');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const tabs = [
    { id: 'organization', label: 'Organization Profile', icon: Building, description: 'Manage hospital address and details' },
    { id: 'security', label: 'Security & Access', icon: Shield, description: 'Configure system access protocols', disabled: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and SMS preferences', disabled: true },
  ];

  useEffect(() => {
    if (addressData) {
      console.log('Loaded organization address:', addressData);
      setFormData({
        name: addressData.name,
        line1: addressData.street,
        city: addressData.city,
        zipCode: addressData.zipCode,
        country: addressData.country,
        state: 'Île-de-France',
        coordinates: {
          lat: addressData.latitude,
          lng: addressData.longitude
        }
      });
    }
  }, [addressData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAddress({
        name: formData.name || 'MediBridge Hospital',
        street: formData.line1,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country || 'France',
        latitude: formData.coordinates?.lat,
        longitude: formData.coordinates?.lng
      }).unwrap();

      setToast({ show: true, message: 'Organization settings updated successfully!', type: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Failed to update settings', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PageHeader title="Settings" subtitle="System settings and configuration" />
        <div className="mt-8 flex justify-center text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PageHeader title="Settings" subtitle="System settings and configuration" />
        <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <p className="font-medium">Failed to load settings.</p>
          <p className="text-sm mt-1">{error.data?.message || 'Server error occurred'}</p>
          <Button onClick={refetch} className="mt-3" size="sm" variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        subtitle="System settings and configuration"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Settings' }
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === tab.id
                      ? "bg-white text-primary-700 shadow-sm ring-1 ring-gray-200"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-900",
                    tab.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className={cn("flex-shrink-0 -ml-1 mr-3 h-5 w-5", activeTab === tab.id ? "text-primary-600" : "text-gray-400")} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'organization' && (
            <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Organization Details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your hospital's main location and contact details. This address is used as the base for logistics.
                </p>

                {/* Info Alert */}
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Location updates may take up to 30 minutes to reflect in the active tracking system.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {formData && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <Input
                        label="Organization Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />

                      <AddressForm
                        data={formData}
                        errors={{}}
                        onChange={setFormData}
                      />
                      <div className="flex justify-end border-t pt-4">
                        <Button type="submit" loading={isUpdating} disabled={isUpdating}>
                          Save Organization Profile
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast.show && (
        <Toast
          isOpen={toast.show}
          message={toast.message}
          variant={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default AdminSettings;
