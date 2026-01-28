import React from 'react';
import { PageHeader } from '../../components/layout';
import { Pill } from 'lucide-react';

const AdminPrescriptions = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Prescription Management"
                subtitle="Monitor all system prescriptions"
                icon={Pill}
            />

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-center min-h-[400px]">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                    <Pill className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Data Available
                </h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    There are no prescriptions in the system yet.
                </p>
            </div>
        </div>
    );
};

export default AdminPrescriptions;
