/**
 * Admin Settings Page
 */

import { PageHeader } from '../../components/layout';

const AdminSettings = () => {
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Admin settings content will be implemented here.</p>
      </div>
    </div>
  );
};

export default AdminSettings;
