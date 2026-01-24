/**
 * Admin Queue Monitoring Page
 */

import { PageHeader } from '../../components/layout';

const AdminQueueMonitoring = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Queue Monitoring"
        subtitle="Monitor all queues across the system"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Queue Monitoring' }
        ]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Queue monitoring content will be implemented here.</p>
      </div>
    </div>
  );
};

export default AdminQueueMonitoring;
