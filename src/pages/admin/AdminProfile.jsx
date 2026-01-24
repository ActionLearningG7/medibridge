/**
 * Admin Profile Page
 */

import { PageHeader } from '../../components/layout';

const AdminProfile = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Profile"
        subtitle="Manage your admin profile"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Profile' }
        ]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Admin profile content will be implemented here.</p>
      </div>
    </div>
  );
};

export default AdminProfile;
