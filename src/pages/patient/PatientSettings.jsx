/**
 * Patient Settings Page
 */

import { PageHeader } from '../../components/layout';

const PatientSettings = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your account settings and preferences"
        breadcrumbs={[
          { label: 'Patient', href: '/patient' },
          { label: 'Settings' }
        ]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Patient settings content will be implemented here.</p>
      </div>
    </div>
  );
};

export default PatientSettings;
