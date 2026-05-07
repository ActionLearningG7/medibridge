import React, { useState } from 'react';
import {
    Search, Eye, FileText,
    Calendar, User, Filter,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { useGetAdminPrescriptionsQuery } from '../../app/api/prescriptionApi';
import {
    Table, TableHead, TableHeader, TableBody, TableRow, TableCell,
    Badge, Button, Input, Card
} from '../../ui';
import { PageHeader } from '../../components/layout';
import PrescriptionDetailDrawer from '../../components/prescription/PrescriptionDetailDrawer';

const AdminPrescriptions = () => {
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    // Fetch administrative prescriptions
    const { data, isLoading, isError } = useGetAdminPrescriptionsQuery({
        page,
        size: 10,
        status: statusFilter || undefined,
        sort: 'createdAt,desc'
    });

    const prescriptions = data?.content || [];
    const totalPages = data?.totalPages || 0;

    const handleView = (prescription) => {
        setSelectedPrescription(prescription);
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'ISSUED': return 'success';
            case 'DRAFT': return 'warning';
            case 'CANCELLED': return 'danger';
            default: return 'neutral';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <PageHeader
                title="Prescriptions"
                subtitle="Monitor and manage all system prescriptions"
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Prescriptions' }
                ]}
            />

            {/* Simple Filter Card */}
            <Card className="p-4 rounded-xl border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by ID or Patient..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="ISSUED">Issued</option>
                            <option value="DRAFT">Draft</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => { setStatusFilter(''); setSearchQuery(''); }}
                        className="text-gray-500"
                    >
                        Reset
                    </Button>
                </div>
            </Card>

            {/* Main Table Card */}
            <Card className="rounded-xl border-gray-200 overflow-hidden">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Number</TableHeader>
                            <TableHeader>Patient ID</TableHeader>
                            <TableHeader>Doctor ID</TableHeader>
                            <TableHeader>Date</TableHeader>
                            <TableHeader>Status</TableHeader>
                            <TableHeader className="text-right">Actions</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(6)].map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-gray-100 animate-pulse rounded w-24"></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : prescriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                    <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                    No prescriptions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            prescriptions.map((px) => (
                                <TableRow key={px.id}>
                                    <TableCell className="font-medium text-gray-900">
                                        {px.prescriptionNumber || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-gray-600 font-mono text-xs">
                                        {px.patientId || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-gray-600 font-mono text-xs">
                                        {px.doctorId || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {formatDate(px.issuedAt || px.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(px.status)}>
                                            {px.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleView(px)}
                                            className="text-primary-600 hover:bg-primary-50"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium tracking-tight">
                            Showing page <span className="text-gray-900 font-bold">{page + 1}</span> of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Detail Drawer */}
            <PrescriptionDetailDrawer
                prescription={selectedPrescription}
                isOpen={!!selectedPrescription}
                onClose={() => setSelectedPrescription(null)}
            />
        </div>
    );
};

export default AdminPrescriptions;
