/**
 * App Router
 * Main routing configuration with protected routes
 * Routes: /login, /force-password-change, /patient/*, /doctor/*, /admin/*
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRedirect from './RoleRedirect';

// Layout
import { AppShell } from '../components/layout';
import AdminNavigation from '../components/admin/AdminNavigation';

// Auth pages
import Login from '../pages/auth/Login';
import ForcePasswordChange from '../pages/auth/ForcePasswordChange';
import Unauthorized from '../pages/Unauthorized';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientProfile from '../pages/patient/PatientProfile';
import PatientAppointments from '../pages/patient/PatientAppointments';
import PatientQueue from '../pages/patient/PatientQueue';
import PatientSettings from '../pages/patient/PatientSettings';
import PatientVideoConsultation from '../pages/patient/VideoConsultation';
import PatientPrescriptions from '../pages/patient/PatientPrescriptions';

// Patient Lab Pages
import LabCatalog from '../pages/patient/LabCatalog';
import LabBooking from '../pages/patient/LabBooking';
import LabOrders from '../pages/patient/LabOrders';
import LabOrderDetails from '../pages/patient/LabOrderDetails';
import LabOrderTracking from '../pages/patient/LabOrderTracking';
import MyReports from '../pages/patient/MyReports';
import ResultsDashboard from '../pages/phlebotomist/ResultsDashboard';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorProfile from '../pages/doctor/DoctorProfile';
import DoctorQueueConsole from '../pages/doctor/DoctorQueueConsole';
import DoctorSettings from '../pages/doctor/DoctorSettings';
import DoctorVideoConsultation from '../pages/doctor/VideoConsultation';
import DoctorPrescriptions from '../pages/doctor/DoctorPrescriptions';

// Doctor Lab Pages
import DoctorLabBooking from '../pages/doctor/LabBooking';
import DoctorLabOrders from '../pages/doctor/LabOrders';
import DoctorLabOrderDetails from '../pages/doctor/LabOrderDetails';
import DoctorLabTracking from '../pages/doctor/LabTracking';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProfile from '../pages/admin/AdminProfile';
import AdminDoctors from '../pages/admin/AdminDoctors';
import AdminQueueMonitoring from '../pages/admin/AdminQueueMonitoring';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminPrescriptions from '../pages/admin/AdminPrescriptions';

// Admin Lab Pages
import AdminLabDashboard from '../pages/admin/LabDashboard';
import AdminLabTaskDetails from '../pages/admin/LabTaskDetails';
import AdminPhlebotomists from '../pages/admin/AdminPhlebotomists';
import AdminPhlebotomistDetails from '../pages/admin/AdminPhlebotomistDetails';

// Admin SOS Pages
import AdminAmbulances from '../pages/admin/AdminAmbulances';
import AdminAmbulanceDrivers from '../pages/admin/AdminAmbulanceDrivers';
import AdminSosIncidents from '../pages/admin/AdminSosIncidents';

// Phlebotomist Pages
import PhlebotomistDashboard from '../pages/phlebotomist/Dashboard';
import PhlebotomistProfile from '../pages/phlebotomist/Profile';
import PhlebotomistSettings from '../pages/phlebotomist/Settings';
import PhlebotomistTasks from '../pages/phlebotomist/Tasks';
import PhlebotomistTaskDetails from '../pages/phlebotomist/TaskDetails';
import PhlebotomistLiveTracking from '../pages/phlebotomist/LiveTracking';
import PhlebTaskNavigation from '../pages/phlebotomist/PhlebTaskNavigation';
// SOS Patient Pages
import SOS from '../pages/patient/SOS';
import SOSTracking from '../pages/patient/SOSTracking';

// SOS Driver Pages
import AmbulanceDashboard from '../pages/driver/AmbulanceDashboard';
import AmbulanceRequest from '../pages/driver/AmbulanceRequest';

export const AppRouter = () => {
  // Auth is already restored in App.js wrapper
  // No need to restore here

  return (
    <BrowserRouter>
      <Routes>
        {/* ========== Root - Role Redirect ========== */}
        <Route path="/" element={<RoleRedirect />} />

        {/* ========== Public Routes ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/force-password-change" element={<ForcePasswordChange />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ========== Patient Routes ========== */}
        <Route
          path="/patient/*"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <AppShell>
                <Routes>
                  <Route path="/dashboard" element={<PatientDashboard />} />
                  <Route path="/profile" element={<PatientProfile />} />
                  <Route path="/appointments" element={<PatientAppointments />} />
                  <Route path="/prescriptions" element={<PatientPrescriptions />} />
                  <Route path="/queue" element={<PatientQueue />} />
                  <Route path="/consultation/video" element={<PatientVideoConsultation />} />
                  <Route path="/settings" element={<PatientSettings />} />
                  {/* Lab Routes */}
                  <Route path="/labs/catalog" element={<LabCatalog />} />
                  <Route path="/labs/booking" element={<LabBooking />} />
                  <Route path="/labs/orders" element={<LabOrders />} />
                  <Route path="/labs/orders/:orderId" element={<LabOrderDetails />} />
                  <Route path="/labs/tracking/:orderId" element={<LabOrderTracking />} />
                  <Route path="/labs/reports" element={<MyReports />} />

                  {/* SOS Routes */}
                  <Route path="/sos" element={<SOS />} />
                  <Route path="/sos/tracking" element={<SOSTracking />} />

                  <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ========== Doctor Routes ========== */}
        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <AppShell>
                <Routes>
                  <Route path="/dashboard" element={<DoctorDashboard />} />
                  <Route path="/profile" element={<DoctorProfile />} />
                  <Route path="/prescriptions" element={<DoctorPrescriptions />} />
                  <Route path="/queue" element={<DoctorQueueConsole />} />
                  <Route path="/consultation/video" element={<DoctorVideoConsultation />} />
                  <Route path="/settings" element={<DoctorSettings />} />
                  {/* Lab Routes */}
                  <Route path="/labs/booking" element={<DoctorLabBooking />} />
                  <Route path="/labs/orders" element={<DoctorLabOrders />} />
                  <Route path="/labs/orders/:orderId" element={<DoctorLabOrderDetails />} />
                  <Route path="/labs/tracking/:orderId" element={<DoctorLabTracking />} />
                  <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ========== Admin Routes ========== */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminNavigation>
                <Routes>
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/profile" element={<AdminProfile />} />
                  <Route path="/doctors" element={<AdminDoctors />} />
                  <Route path="/prescriptions" element={<AdminPrescriptions />} />
                  <Route path="/queue-monitoring" element={<AdminQueueMonitoring />} />
                  <Route path="/settings" element={<AdminSettings />} />
                  {/* Lab Routes */}
                  <Route path="/labs/dashboard" element={<AdminLabDashboard />} />
                  <Route path="/labs/tasks/:taskId" element={<AdminLabTaskDetails />} />
                  {/* Phlebotomist Management Routes */}
                  <Route path="/phlebotomists" element={<AdminPhlebotomists />} />
                  <Route path="/phlebotomists/:id" element={<AdminPhlebotomistDetails />} />
                  {/* SOS Management Routes */}
                  <Route path="/ambulances" element={<AdminAmbulances />} />
                  <Route path="/drivers" element={<AdminAmbulanceDrivers />} />
                  <Route path="/incidents" element={<AdminSosIncidents />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminNavigation>
            </ProtectedRoute>
          }
        />

        {/* ========== Phlebotomist Routes ========== */}
        <Route
          path="/phlebotomist/*"
          element={
            <ProtectedRoute allowedRoles={['PHLEBOTOMIST']}>
              <AppShell>
                <Routes>
                  <Route path="/dashboard" element={<PhlebotomistDashboard />} />
                  <Route path="/profile" element={<PhlebotomistProfile />} />
                  <Route path="/settings" element={<PhlebotomistSettings />} />
                  <Route path="/tasks" element={<PhlebotomistTasks />} />
                  <Route path="/tasks/:taskId" element={<PhlebotomistTaskDetails />} />
                  <Route path="/tasks/:taskId/navigation" element={<PhlebTaskNavigation />} />
                  <Route path="/tracking" element={<PhlebotomistLiveTracking />} />
                  <Route path="/results" element={<ResultsDashboard />} />

                  {/* Driver Routes (Nested for Phlebotomists acting as Drivers) */}
                  <Route path="/driver/dashboard" element={<AmbulanceDashboard />} />
                  <Route path="/driver/sos/:id" element={<AmbulanceRequest />} />

                  <Route path="*" element={<Navigate to="/phlebotomist/dashboard" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ========== Pure Driver Routes (If dedicated role exists) ========== */}
        <Route
          path="/driver/*"
          element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <AppShell>
                <Routes>
                  <Route path="/dashboard" element={<AmbulanceDashboard />} />
                  <Route path="/sos/:id" element={<AmbulanceRequest />} />
                  <Route path="*" element={<Navigate to="/driver/dashboard" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ========== 404 - Redirect to Root ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
