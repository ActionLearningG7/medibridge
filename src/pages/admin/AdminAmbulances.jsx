
import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Users, Search, MapPin, Phone, Loader, AlertCircle } from 'lucide-react';
import {
  useGetAmbulancesQuery,
  useCreateAmbulanceMutation,
  useUpdateAmbulanceMutation,
  useUpdateAmbulanceStatusMutation,
  useAssignAmbulanceDriverMutation,
  useGetAmbulanceDriversQuery,
} from '../../app/api/ambulanceApi';

const SAMPLE_AMBULANCES = [
  {
    id: 'demo-1',
    registrationNumber: 'AMB-001',
    contactPhone: '+91-911',
    status: 'ON_DUTY',
    driverUserId: '',
    lastLat: null,
    lastLng: null,
    homeBaseLat: 0,
    homeBaseLng: 0,
    serviceRadiusKm: 5,
  },
  {
    id: 'demo-2',
    registrationNumber: 'AMB-002',
    contactPhone: '+91-912',
    status: 'OFF_DUTY',
    driverUserId: 'driver-uuid-123',
    lastLat: 48.8566,
    lastLng: 2.3522,
    homeBaseLat: 48.8566,
    homeBaseLng: 2.3522,
    serviceRadiusKm: 8,
  },
];

export default function AdminAmbulances() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningAmbulance, setAssigningAmbulance] = useState(null);

  // RTK Query hooks
  const { data: ambulancesData, isLoading, error } = useGetAmbulancesQuery({ page, size: 10 });

  const [createAmbulance, { isLoading: isCreating }] = useCreateAmbulanceMutation();
  const [updateAmbulance, { isLoading: isUpdating }] = useUpdateAmbulanceMutation();
  const [updateStatus] = useUpdateAmbulanceStatusMutation();
  const [assignDriver, { isLoading: isAssigning }] = useAssignAmbulanceDriverMutation();

  // Prefer API data
  const ambulances = useMemo(() => {
    const list = ambulancesData?.content;
    return Array.isArray(list) ? list : [];
  }, [ambulancesData]);

  // Make RTK error printable
  const errorMessage = useMemo(() => {
    if (!error) return null;
    // RTK Query error shapes vary (fetchBaseQueryError / serialized error)
    return (
      error?.data?.message ||
      error?.error ||
      error?.message ||
      'Failed to load ambulances'
    );
  }, [error]);

  const handleCreateAmbulance = async (formData) => {
    try {
      await createAmbulance(formData).unwrap();
      setShowModal(false);
      alert('Ambulance created successfully');
    } catch (err) {
      console.error('Error creating ambulance:', err);
      alert('Failed to create ambulance');
    }
  };

  const handleUpdateAmbulance = async (formData) => {
    try {
      await updateAmbulance({ id: editingAmbulance.id, ...formData }).unwrap();
      setShowModal(false);
      setEditingAmbulance(null);
      alert('Ambulance updated successfully');
    } catch (err) {
      console.error('Error updating ambulance:', err);
      alert('Failed to update ambulance');
    }
  };

  const handleAssignDriver = async (formData) => {
    try {
      await assignDriver({
        ambulanceId: assigningAmbulance.id,
        driverUserId: formData.driverUserId,
      }).unwrap();

      setShowAssignModal(false);
      setAssigningAmbulance(null);
      alert('Driver assigned successfully');
    } catch (err) {
      console.error('Error assigning driver:', err);
      alert('Failed to assign driver');
    }
  };

  const handleStatusChange = async (ambulanceId, newStatus) => {
    try {
      await updateStatus({ ambulanceId, status: newStatus }).unwrap();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const filteredAmbulances = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ambulances;

    return ambulances.filter((ambulance) => {
      const reg = (ambulance.registrationNumber ?? '').toLowerCase();
      const phone = ambulance.contactPhone ?? '';
      return reg.includes(term) || phone.includes(searchTerm.trim());
    });
  }, [ambulances, searchTerm]);

  const getStatusColor = (status) => {
    const colors = {
      ON_DUTY: 'bg-green-100 text-green-800',
      OFF_DUTY: 'bg-gray-100 text-gray-800',
      BUSY: 'bg-blue-100 text-blue-800',
      SUSPENDED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isSubmittingModal = editingAmbulance ? isUpdating : isCreating;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ambulance Fleet</h1>
            <p className="text-gray-600 mt-1">Manage your ambulance fleet and assignments</p>
          </div>
          <button
            onClick={() => {
              setEditingAmbulance(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} /> Add Ambulance
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by registration number or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <div>
                <p className="font-medium text-red-900">Error Loading Ambulances</p>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-600 font-medium">Loading ambulances...</p>
            </div>
          </div>
        )}

        {/* Ambulances Grid */}
        {!isLoading && ambulances.length > 0 && filteredAmbulances.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAmbulances.map((ambulance) => (
              <div
                key={ambulance.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{ambulance.registrationNumber}</h3>
                      <div className="flex items-center gap-2 mt-1 text-blue-100">
                        <Phone size={16} />
                        <span className="text-sm">{ambulance.contactPhone}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        ambulance.status
                      )}`}
                    >
                      {ambulance.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Driver Assignment */}
                  <div className="border-b pb-3">
                    <p className="text-xs text-gray-500 font-semibold">ASSIGNED DRIVER</p>
                    {ambulance.driverUserId ? (
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {ambulance.driverUserId}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mt-1">No driver assigned</p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="border-b pb-3">
                    <p className="text-xs text-gray-500 font-semibold">LAST LOCATION</p>
                    {ambulance.lastLat != null && ambulance.lastLng != null ? (
                      <div className="flex items-center gap-2 mt-1 text-gray-700">
                        <MapPin size={16} />
                        <span className="text-sm">
                          {Number(ambulance.lastLat).toFixed(4)}, {Number(ambulance.lastLng).toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic mt-1">No location data</p>
                    )}
                  </div>

                  {/* Service Radius */}
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">SERVICE RADIUS</p>
                    <p className="text-sm text-gray-900 mt-1">{ambulance.serviceRadiusKm} km</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                  <select
                    value={ambulance.status}
                    onChange={(e) => handleStatusChange(ambulance.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ON_DUTY">On Duty</option>
                    <option value="OFF_DUTY">Off Duty</option>
                    <option value="BUSY">Busy</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAssigningAmbulance(ambulance);
                        setShowAssignModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="Assign Driver"
                    >
                      <Users size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingAmbulance(ambulance);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      title="Edit Ambulance"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State - No Data */}
        {!isLoading && ambulances.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 text-lg">No ambulances found</p>
          </div>
        )}

        {/* No Results After Search */}
        {!isLoading && ambulances.length > 0 && filteredAmbulances.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <Search className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 text-lg">No ambulances match your search</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <AmbulanceModal
          ambulance={editingAmbulance}
          onClose={() => {
            setShowModal(false);
            setEditingAmbulance(null);
          }}
          onSubmit={editingAmbulance ? handleUpdateAmbulance : handleCreateAmbulance}
          isSubmitting={isSubmittingModal}
        />
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <AssignDriverModal
          ambulance={assigningAmbulance}
          onClose={() => {
            setShowAssignModal(false);
            setAssigningAmbulance(null);
          }}
          onSubmit={handleAssignDriver}
          isSubmitting={isAssigning}
        />
      )}
    </div>
  );
}


function AmbulanceModal({ ambulance, onClose, onSubmit, isSubmitting }) {
  const { data: driversData, isLoading: isLoadingDrivers } = useGetAmbulanceDriversQuery({ page: 0, size: 100 });
  const [formData, setFormData] = React.useState(
    ambulance || {
      registrationNumber: '',
      driverUserId: '',
      contactPhone: '',
      homeBaseLat: 0,
      homeBaseLng: 0,
      serviceRadiusKm: 5,
      status: 'OFF_DUTY',
    }
  );

  const drivers = driversData?.content || [];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold">{ambulance ? 'Edit Ambulance' : 'Add Ambulance'}</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
            <input
              type="text"
              placeholder="e.g., AMB-001"
              value={formData.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Driver</label>
            <select
              value={formData.driverUserId}
              onChange={(e) => handleChange('driverUserId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Driver</option>
              {isLoadingDrivers ? (
                <option disabled>Loading drivers...</option>
              ) : (
                drivers.map((driver) => (
                  <option key={driver.id} value={driver.userId}>
                    {driver.firstName} {driver.lastName} ({driver.email})
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">Assign a driver now or later.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              placeholder="e.g., +91-911"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={formData.serviceRadiusKm}
              onChange={(e) => handleChange('serviceRadiusKm', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignDriverModal({ ambulance, onClose, onSubmit, isSubmitting }) {
  const { data: driversData, isLoading: isLoadingDrivers } = useGetAmbulanceDriversQuery({ page: 0, size: 100 });
  const [driverUserId, setDriverUserId] = React.useState('');
  const drivers = driversData?.content || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold">Assign Driver</h2>
        <p className="text-gray-600">Assign a driver to {ambulance?.registrationNumber}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ driverUserId });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
            <select
              value={driverUserId}
              onChange={(e) => setDriverUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            >
              <option value="">Select a Driver</option>
              {isLoadingDrivers ? (
                <option disabled>Loading drivers...</option>
              ) : (
                drivers.map((driver) => (
                  <option key={driver.id} value={driver.userId}>
                    {driver.firstName} {driver.lastName} ({driver.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
