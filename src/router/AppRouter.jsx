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

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorProfile from '../pages/doctor/DoctorProfile';
import DoctorQueueConsole from '../pages/doctor/DoctorQueueConsole';
import DoctorSettings from '../pages/doctor/DoctorSettings';
import DoctorVideoConsultation from '../pages/doctor/VideoConsultation';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProfile from '../pages/admin/AdminProfile';
import AdminDoctors from '../pages/admin/AdminDoctors';
import AdminQueueMonitoring from '../pages/admin/AdminQueueMonitoring';
import AdminSettings from '../pages/admin/AdminSettings';

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
                  <Route path="/queue" element={<PatientQueue />} />
                  <Route path="/consultation/video" element={<PatientVideoConsultation />} />
                  <Route path="/settings" element={<PatientSettings />} />
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
                  <Route path="/queue" element={<DoctorQueueConsole />} />
                  <Route path="/consultation/video" element={<DoctorVideoConsultation />} />
                  <Route path="/settings" element={<DoctorSettings />} />
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
              <AppShell>
                <Routes>
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/profile" element={<AdminProfile />} />
                  <Route path="/doctors" element={<AdminDoctors />} />
                  <Route path="/queue-monitoring" element={<AdminQueueMonitoring />} />
                  <Route path="/settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
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
