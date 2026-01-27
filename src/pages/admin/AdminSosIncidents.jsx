/**
 * Admin SOS Incidents Management Page
 * View all SOS incidents, assignments, and tracking information
 */
import React, { useState, useMemo } from 'react';
import { AlertCircle, MapPin, Clock, Phone, TrendingUp, Search, Filter, CheckCircle, Navigation, Headphones, Loader } from 'lucide-react';
import { useGetSosIncidentsQuery } from '../../app/api/ambulanceApi';

// Sample SOS incidents data for fallback
const SAMPLE_INCIDENTS = [
    {
        id: '1',
        patientName: 'Robert Johnson',
        patientPhone: '+1 (555) 123-4567',
        pickupLocation: '123 Main St, Apt 4B, Downtown',
        status: 'COMPLETED',
        driverAssigned: 'John Smith',
        ambulanceNumber: 'AMB-2024-001',
        timeCreated: '2024-12-20 14:30:00',
        timeCompleted: '2024-12-20 15:15:00',
        distance: '5.2 km',
        duration: '45 min'
    },
    {
        id: '2',
        patientName: 'Maria Garcia',
        patientPhone: '+1 (555) 234-5678',
        pickupLocation: '456 Oak Ave, Suite 200, Midtown',
        status: 'IN_PROGRESS',
        driverAssigned: 'Sarah Johnson',
        ambulanceNumber: 'AMB-2024-002',
        timeCreated: '2024-12-20 15:45:00',
        timeCompleted: null,
        distance: '8.7 km',
        duration: '22 min (ETA: 8 min)'
    },
    {
        id: '3',
        patientName: 'James Williams',
        patientPhone: '+1 (555) 345-6789',
        pickupLocation: '789 Pine Rd, Building C, Northside',
        status: 'PENDING',
        driverAssigned: 'Unassigned',
        ambulanceNumber: 'Awaiting dispatch',
        timeCreated: '2024-12-20 16:10:00',
        timeCompleted: null,
        distance: 'N/A',
        duration: 'Waiting for driver'
    },
    {
        id: '4',
        patientName: 'Patricia Davis',
        patientPhone: '+1 (555) 456-7890',
        pickupLocation: '321 Elm St, Unit 5, Westside',
        status: 'COMPLETED',
        driverAssigned: 'Michael Williams',
        ambulanceNumber: 'AMB-2024-004',
        timeCreated: '2024-12-20 13:20:00',
        timeCompleted: '2024-12-20 14:10:00',
        distance: '6.5 km',
        duration: '50 min'
    }
];

export default function AdminSosIncidents() {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedIncident, setSelectedIncident] = useState(null);

    // RTK Query hook
    const { data: incidentsData, isLoading, error, isUninitialized } = useGetSosIncidentsQuery({ page, size: 10 });

    // Determine incidents source
    const incidents = incidentsData?.content || SAMPLE_INCIDENTS;
    const isUsingFallback = !incidentsData || error;

    // Filter incidents dynamically using useMemo
    const filteredIncidents = useMemo(() => {
        return incidents.filter((incident) => {
            const matchesSearch =
                incident.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                incident.patientPhone?.includes(searchTerm) ||
                incident.id?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || incident.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [incidents, searchTerm, statusFilter]);

    const getStatusColor = (status) => {
        const colors = {
            CREATED: 'bg-yellow-100 text-yellow-800',
            SEARCHING: 'bg-orange-100 text-orange-800',
            ASSIGNED: 'bg-blue-100 text-blue-800',
            EN_ROUTE: 'bg-cyan-100 text-cyan-800',
            ARRIVED: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const iconProps = { size: 18 };

        switch (status) {
            case 'CREATED':
                return <AlertCircle {...iconProps} />;
            case 'SEARCHING':
                return <TrendingUp {...iconProps} />;
            case 'ASSIGNED':
                return <Headphones {...iconProps} />;
            case 'EN_ROUTE':
                return <Navigation {...iconProps} />;
            case 'ARRIVED':
                return <MapPin {...iconProps} />;
            case 'COMPLETED':
                return <CheckCircle {...iconProps} />;
            case 'CANCELLED':
                return <AlertCircle {...iconProps} />;
            default:
                return <AlertCircle {...iconProps} />;
        }
    };

    const stats = [
        {
            label: 'Active Incidents',
            value: incidents.filter((i) => ['CREATED', 'SEARCHING', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED'].includes(i.status)).length
        },
        {
            label: 'Completed Today',
            value: incidents.filter((i) => i.status === 'COMPLETED' && new Date(i.createdAt).toDateString() === new Date().toDateString()).length
        },
        {
            label: 'Avg Response Time',
            value: incidents.length > 0
                ? (incidents.reduce((sum, i) => sum + (i.eta || 0), 0) / incidents.length).toFixed(1) + ' min'
                : '0 min'
        },
        {
            label: 'Success Rate',
            value: incidents.length > 0
                ? ((incidents.filter((i) => i.status === 'COMPLETED').length / incidents.length) * 100).toFixed(1) + '%'
                : '0%'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">SOS Incidents</h1>
                    <p className="text-gray-600 mt-1">Monitor and track all emergency requests</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-lg shadow-md p-4">
                            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Patient name, phone, or incident ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="CREATED">Created</option>
                                <option value="SEARCHING">Searching</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="EN_ROUTE">En Route</option>
                                <option value="ARRIVED">Arrived</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('ALL');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error / Fallback Banner */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-600" size={20} />
                            <div>
                                <p className="font-medium text-red-900">Error Loading Incidents</p>
                                <p className="text-sm text-red-700 mt-1">{error?.data?.message || 'Error loading incidents'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isUsingFallback && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-blue-600" size={20} />
                            <div>
                                <p className="font-semibold text-blue-800">Demo Mode</p>
                                <p className="text-sm text-blue-700">Displaying sample data. Start the backend to load real data: mvn spring-boot:run</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Loader className="animate-spin text-blue-600" size={40} />
                            <p className="text-gray-600 font-medium">Loading incidents...</p>
                        </div>
                    </div>
                )}

                {/* Incidents List */}
                {!isLoading && incidents.length > 0 && (
                    <div className="space-y-4">
                        {filteredIncidents.map((incident) => (
                            <div
                                key={incident.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                                onClick={() => setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)}
                            >
                                {/* Main Row */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                        {/* Status and Patient */}
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-full flex items-center justify-center ${getStatusColor(incident.status).split(' ')[0]}`}>
                                                <span className={getStatusColor(incident.status).split(' ')[1]}>
                                                    {getStatusIcon(incident.status)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{incident.patientName}</p>
                                                <p className="text-sm text-gray-600">{incident.patientPhone}</p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(incident.status)}`}>
                                                {incident.status}
                                            </span>
                                        </div>

                                        {/* Ambulance and Driver */}
                                        <div>
                                            {incident.assignedAmbulanceReg ? (
                                                <>
                                                    <p className="text-sm font-medium text-gray-900">{incident.assignedAmbulanceReg}</p>
                                                    <p className="text-xs text-gray-600">{incident.assignedDriverName}</p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No assignment</p>
                                            )}
                                        </div>

                                        {/* ETA and Distance */}
                                        <div>
                                            {incident.eta !== null ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                        <Clock size={16} />
                                                        <span>{incident.eta} min</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                        <MapPin size={14} />
                                                        <span>{incident.distance} km</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500">-</p>
                                            )}
                                        </div>

                                        {/* Time */}
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(incident.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {new Date(incident.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {selectedIncident?.id === incident.id && (
                                    <div className="border-t bg-gray-50 p-4 space-y-3">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600 font-medium">Incident ID</p>
                                                <p className="text-gray-900 font-mono text-xs mt-1 break-all">{incident.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium">Patient ID</p>
                                                <p className="text-gray-900 font-mono text-xs mt-1">{incident.patientId}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium">Pickup Location</p>
                                                <p className="text-gray-900 font-mono text-xs mt-1">
                                                    {incident.pickupLat.toFixed(4)}, {incident.pickupLng.toFixed(4)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium">Driver ID</p>
                                                <p className="text-gray-900 font-mono text-xs mt-1">
                                                    {incident.assignedDriverId || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                                                View Details
                                            </button>
                                            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                                                View Map
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State - No Data */}
                {!isLoading && incidents.length === 0 && !error && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500 text-lg">No incidents found</p>
                        <p className="text-gray-400 text-sm mt-1">Check back later for new emergency requests</p>
                    </div>
                )}

                {/* No Results After Filter */}
                {!isLoading && incidents.length > 0 && filteredIncidents.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <Search className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-500 text-lg">No incidents match your filters</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('ALL');
                            }}
                            className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
