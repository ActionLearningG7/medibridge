/**
 * Doctor Settings Page
 */

import { PageHeader } from '../../components/layout';

const DoctorSettings = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your consultation settings and preferences"
        breadcrumbs={[
          { label: 'Doctor', href: '/doctor' },
          { label: 'Settings' }
        ]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Doctor settings content will be implemented here.</p>
      </div>
    </div>
  );
};

export default DoctorSettings;
