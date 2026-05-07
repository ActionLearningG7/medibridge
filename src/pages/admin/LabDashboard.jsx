/**
 * Admin Lab Dashboard Page
 * Premium, high-tech dashboard for managing laboratory collection tasks
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAdminLabOrdersQuery,
  useGetEligibleAdminLabOrdersQuery,
  useGetAdminLabTasksQuery,
  useAssignAdminLabTaskMutation,
  useReassignAdminLabTaskMutation,
  useCancelAdminLabTaskMutation,
  useCreateCollectionTaskMutation
} from '../../features/lab/labApi';
import { useGetAvailablePhlebotomistsQuery } from '../../app/api/adminUserApi';
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Input, Select, Button, Badge, Toast } from '../../ui';
import { KPICard } from '../../components/lab/KPICard';
import CreateCollectionTaskModal from '../../components/lab/CreateCollectionTaskModal';
import {
  CheckCircle, Clock, Navigation, AlertCircle, Edit2,
  XCircle, Eye, RefreshCcw, ClipboardList, UserCheck, Search, Filter
} from 'lucide-react';

const TASK_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'en_route', label: 'En Route' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'collect_samples', label: 'Collecting Samples' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const STATUS_LABELS = {
  CREATED: 'Pending Assignment',
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived',
  SAMPLES_COLLECTED: 'Collecting',
  IN_TRANSIT: 'In Transit',
  DELIVERED_TO_LAB: 'At Lab',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled'
};

const EMPTY_TASKS_RESPONSE = { content: [], totalElements: 0 };
const EMPTY_ORDERS_RESPONSE = { content: [], totalElements: 0 };

export default function AdminLabDashboard() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, taskId: null, mode: 'assign' });
  const [createTaskModal, setCreateTaskModal] = useState({
    isOpen: false,
    orderId: null,
    orderNumber: '',
    testCount: 0
  });
  const [toastState, setToastState] = useState({ isOpen: false, type: 'info', message: '' });

  // Dashboard Filters Memoization
  const queryParams = useMemo(() => ({
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [statusFilter, dateFrom, dateTo]);

  // Fetch tasks
  const {
    data: tasksResponse = EMPTY_TASKS_RESPONSE,
    isLoading,
    error,
    refetch: refetchTasks
  } = useGetAdminLabTasksQuery(queryParams);

  const tasks = tasksResponse.content || [];
  const serverStats = tasksResponse.stats || {};

  // Derive stats if not provided by backend
  const stats = useMemo(() => {
    if (Object.keys(serverStats).length > 0) return serverStats;

    return {
      totalToday: tasks.length,
      pendingAssignment: tasks.filter(t => t.status?.toUpperCase() === 'CREATED' || !t.phlebotomistId).length,
      completionTrend: Math.round((tasks.filter(t => t.status?.toUpperCase() === 'COMPLETED').length / (tasks.length || 1)) * 100)
    };
  }, [tasks, serverStats]);

  // Fetch unassigned orders (those needing task creation)
  const {
    data: unassignedResponse = EMPTY_ORDERS_RESPONSE,
    isLoading: ordersLoading,
    refetch: refetchOrders
  } = useGetEligibleAdminLabOrdersQuery({ page: 0, size: 50 });

  const unassignedOrders = unassignedResponse.content || [];
  const unassignedCount = unassignedOrders.length;

  // Mutations
  const [assignTask, { isLoading: isAssigning }] = useAssignAdminLabTaskMutation();
  const [reassignTask, { isLoading: isReassigning }] = useReassignAdminLabTaskMutation();
  const [cancelTask, { isLoading: isCancelling }] = useCancelAdminLabTaskMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateCollectionTaskMutation();

  const showToast = useCallback((type, message) => {
    setToastState({ isOpen: true, type, message });
    setTimeout(() => setToastState(prev => ({ ...prev, isOpen: false })), 5000);
  }, []);

  const handleRefreshAll = () => {
    refetchTasks();
    refetchOrders();
    showToast('info', 'Refreshing dashboard data...');
  };

  const handleAssign = async (taskId, phlebotomistId) => {
    try {
      await assignTask({ taskId, phlebotomistId }).unwrap();
      showToast('success', 'Phlebotomist assigned successfully');
      setAssignmentModal({ isOpen: false, taskId: null, mode: 'assign' });
      handleRefreshAll();
    } catch (err) {
      showToast('error', err?.data?.message || 'Failed to assign task');
    }
  };

  const handleReassign = async (taskId, phlebotomistId) => {
    try {
      await reassignTask({ taskId, phlebotomistId }).unwrap();
      showToast('success', 'Task successfully reassigned');
      setAssignmentModal({ isOpen: false, taskId: null, mode: 'assign' });
      handleRefreshAll();
    } catch (err) {
      showToast('error', err?.data?.message || 'Failed to reassign task');
    }
  };

  const handleCancel = async (taskId) => {
    if (window.confirm('Are you sure you want to cancel this collection task?')) {
      try {
        await cancelTask({ taskId }).unwrap();
        showToast('success', 'Task has been cancelled');
        handleRefreshAll();
      } catch (err) {
        showToast('error', err?.data?.message || 'Failed to cancel task');
      }
    }
  };

  const handleOpenCreateTaskModal = (orderId, orderNumber, testCount) => {
    setCreateTaskModal({
      isOpen: true,
      orderId,
      orderNumber,
      testCount,
    });
  };

  const handleCreateTaskSubmit = async (orderId, phlebotomistId) => {
    try {
      await createTask({ orderId, phlebotomistId }).unwrap();
      showToast('success', 'Collection task created and dispatched');
      handleRefreshAll();
    } catch (err) {
      showToast('error', err?.data?.message || 'Order might already have a task. Syncing...');
      handleRefreshAll(); // Refresh to clear any stale data
    }
  };

  const hasActiveFilters = statusFilter || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-[1600px] mx-auto px-6 py-8">

        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">
              <ClipboardList size={14} />
              Operations Center
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lab Command Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefreshAll}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCcw size={20} />
            </button>
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-sm text-sm">Dashboard</button>
              <button onClick={() => navigate('/admin/lab/reports')} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 text-sm">Reports</button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Left Column: Stats & Filters */}
          <div className="xl:col-span-1 space-y-8">

            {/* KPI Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              <KPICard
                title="Active Missions"
                value={stats.totalToday || 0}
                icon={Navigation}
                color="primary"
                loading={isLoading}
              />
              <KPICard
                title="Pending Dispatch"
                value={stats.pendingAssignment || 0}
                icon={Clock}
                color="warning"
                loading={isLoading}
              />
              <KPICard
                title="Success Rate"
                value={`${stats.completionTrend || 0}%`}
                icon={CheckCircle}
                color="success"
                loading={isLoading}
              />
              <KPICard
                title="Action Required"
                value={unassignedCount}
                icon={AlertCircle}
                color={unassignedCount > 0 ? "danger" : "success"}
                loading={ordersLoading}
              />
            </div>

            {/* Filter Panel */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <Filter size={18} className="text-indigo-500" />
                  Grid Filters
                </h3>
                {hasActiveFilters && (
                  <button onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); }} className="text-xs font-bold text-rose-500">Reset</button>
                )}
              </div>
              <div className="space-y-4">
                <Select
                  label="Mission Status"
                  options={TASK_STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50/50 border-slate-100"
                />
                <Input
                  type="date"
                  label="Start Window"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-slate-50/50 border-slate-100 font-bold"
                />
                <Input
                  type="date"
                  label="End Window"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-slate-50/50 border-slate-100 font-bold"
                />
                <Button onClick={handleRefreshAll} className="w-full mt-2 rounded-xl py-4 bg-slate-900 font-black">Apply Configuration</Button>
              </div>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="xl:col-span-3 space-y-8">

            {/* Unassigned Missions (If any) */}
            {unassignedCount > 0 && (
              <div className="bg-white border-2 border-amber-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-amber-900/5 transition-all">
                <div className="p-8 bg-amber-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-amber-200">
                      Alert Level: Medium
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Waitlist for Assignment</h2>
                    <p className="text-slate-500 font-medium">These orders require an immediate collection task dispatch.</p>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-amber-100 shadow-sm">
                    <span className="text-3xl font-black text-amber-600">{unassignedCount}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Awaiting<br />Dispatch</span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
                  {unassignedOrders.map((order) => (
                    <div key={order.id} className="bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-amber-200 p-5 rounded-3xl transition-all group flex items-center justify-between shadow-sm">
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black font-mono bg-white px-2 py-0.5 rounded border border-slate-200">#{order.orderNumber?.slice(-8) || order.id?.slice(0, 8)}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 truncate tracking-tight">{order.patientId}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {order.items?.length || 0} Diagnostics Identified
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenCreateTaskModal(order.id, order.orderNumber, order.items?.length || 0)}
                        className="h-12 px-6 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                      >
                        Dispatch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task Grid / Table */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Collection Tasks</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none w-48" placeholder="Search missions..." />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="p-12 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />)}
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <ClipboardList size={32} className="text-slate-200" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Synchronized State</h4>
                  <p className="text-slate-500">No active laboratory missions found for the current configuration.</p>
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-visible">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Identity</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Subject</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Status</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Phlebotomist</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="text-xs font-black font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">#{task.id?.slice(-8)}</span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-bold text-slate-900 tracking-tight">{task.patientName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.patientCity}</p>
                          </td>
                          <td className="px-8 py-5">
                            <Badge
                              variant={
                                task.status?.toUpperCase() === 'COMPLETED' ? 'success' :
                                  (task.status?.toUpperCase() === 'FAILED' || task.status?.toUpperCase() === 'CANCELLED') ? 'danger' : 'warning'
                              }
                              className="font-black uppercase text-[9px] tracking-widest px-3 py-1"
                            >
                              {STATUS_LABELS[task.status?.toUpperCase()] || task.status}
                            </Badge>
                          </td>
                          <td className="px-8 py-5">
                            {task.phlebotomistName ? (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                  <UserCheck size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 underline decoration-indigo-200 underline-offset-2">{task.phlebotomistName}</p>
                                  <p className="text-[9px] font-bold text-slate-400">{task.phlebotomistPhone}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-widest">Unassigned</span>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => navigate(`/admin/lab/tasks/${task.id}`)}
                                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                title="Mission Intel"
                              >
                                <Eye size={16} />
                              </button>

                              {!task.phlebotomistName && (
                                <button
                                  onClick={() => setAssignmentModal({ isOpen: true, taskId: task.id, mode: 'assign' })}
                                  className="p-2.5 text-amber-500 hover:text-amber-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                  title="Dispatch Personnel"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}

                              {task.phlebotomistName && task.status?.toUpperCase() !== 'COMPLETED' && (
                                <button
                                  onClick={() => setAssignmentModal({ isOpen: true, taskId: task.id, mode: 'reassign' })}
                                  className="p-2.5 text-indigo-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                  title="Reassign Personnel"
                                >
                                  <RefreshCcw size={16} />
                                </button>
                              )}

                              {task.status?.toUpperCase() !== 'COMPLETED' && task.status?.toUpperCase() !== 'FAILED' && task.status?.toUpperCase() !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleCancel(task.id)}
                                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                  title="Terminate Mission"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      {assignmentModal.isOpen && (
        <AssignmentModal
          isOpen={assignmentModal.isOpen}
          taskId={assignmentModal.taskId}
          mode={assignmentModal.mode}
          isLoading={isAssigning || isReassigning}
          onAssign={handleAssign}
          onReassign={handleReassign}
          onClose={() => setAssignmentModal({ isOpen: false, taskId: null, mode: 'assign' })}
        />
      )}

      <CreateCollectionTaskModal
        isOpen={createTaskModal.isOpen}
        orderId={createTaskModal.orderId}
        orderNumber={createTaskModal.orderNumber}
        testCount={createTaskModal.testCount}
        onClose={() => setCreateTaskModal({ isOpen: false, orderId: null, orderNumber: '', testCount: 0 })}
        onSubmit={handleCreateTaskSubmit}
        isLoading={isCreatingTask}
      />

      <Toast
        isOpen={toastState.isOpen}
        variant={toastState.type}
        message={toastState.message}
        onClose={useCallback(() => setToastState(prev => ({ ...prev, isOpen: false })), [])}
      />
    </div>
  );
}

// Assignment Modal Component (Modernized)
function AssignmentModal({ isOpen, taskId, mode, isLoading: isActionLoading, onAssign, onReassign, onClose }) {
  const [selectedPhlebotomist, setSelectedPhlebotomist] = React.useState('');

  const { data: phlebotomistsResponse, isLoading: loadingPhlebotomists } = useGetAvailablePhlebotomistsQuery(
    {},
    { skip: !isOpen }
  );

  const phlebotomists = useMemo(() => phlebotomistsResponse?.content || [], [phlebotomistsResponse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in duration-300">

        {/* Modal Header */}
        <div className="p-10 border-b border-slate-50 relative">
          <div className="absolute top-10 right-10">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <UserCheck size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {mode === 'assign' ? 'Mission Dispatch' : 'Personnel Swap'}
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            Targeting Mission: <span className="font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">#{taskId?.slice(-8)}</span>
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-10 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 flex-1">
          {loadingPhlebotomists ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCcw className="animate-spin mb-4" size={32} />
              <p className="text-xs font-black uppercase tracking-widest">Scanning Available Units...</p>
            </div>
          ) : phlebotomists.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <p className="text-sm font-bold text-slate-400 italic">No operators currently active in this sector.</p>
            </div>
          ) : (
            phlebotomists.map((p) => (
              <label
                key={p.userId}
                className={`flex items-center gap-5 p-5 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 group ${selectedPhlebotomist === p.userId
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'
                  : 'bg-white border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50 shadow-sm'
                  }`}
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="phlebotomist"
                    value={p.userId}
                    checked={selectedPhlebotomist === p.userId}
                    onChange={(e) => setSelectedPhlebotomist(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPhlebotomist === p.userId ? 'bg-white border-white' : 'border-slate-200 bg-white group-hover:border-indigo-300'
                    }`}>
                    {selectedPhlebotomist === p.userId && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-lg font-black tracking-tight ${selectedPhlebotomist === p.userId ? 'text-white' : 'text-slate-900'}`}>
                      {p.firstName} {p.lastName}
                    </p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedPhlebotomist === p.userId ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {p.shiftType || 'Standard'}
                    </span>
                  </div>
                  <p className={`text-xs font-bold ${selectedPhlebotomist === p.userId ? 'text-indigo-200' : 'text-slate-400'}`}>
                    ID: {p.userId?.slice(0, 8)} • {p.phoneNumber || 'No contact info'}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Action Panel */}
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isActionLoading}
            className="flex-1 h-16 rounded-[1.5rem] font-black text-slate-500 tracking-tight"
          >
            Abort Dispatch
          </Button>
          <Button
            onClick={() => mode === 'assign' ? onAssign(taskId, selectedPhlebotomist) : onReassign(taskId, selectedPhlebotomist)}
            disabled={!selectedPhlebotomist || isActionLoading}
            loading={isActionLoading}
            className="flex-1 h-16 rounded-[1.5rem] font-black bg-indigo-600 text-white shadow-lg shadow-indigo-100"
          >
            Confirm Deployment
          </Button>
        </div>
      </div>
    </div>
  );
}
