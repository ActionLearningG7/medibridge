/**
 * Admin Doctors Management Page
 */

import { PageHeader } from '../../components/layout';

const AdminDoctors = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Doctors"
        subtitle="Manage doctor accounts and verifications"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Doctors' }
        ]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Doctor management content will be implemented here.</p>
      </div>
    </div>
  );
};

export default AdminDoctors;
