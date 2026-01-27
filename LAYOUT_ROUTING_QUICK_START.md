# App Layout & Routing - Quick Start Guide

**Status**: ✅ Complete & Ready to Use
**Files Created**: 21 total

---

## 🚀 Quick Start

### 1. The Layout System
```javascript
// Every protected route uses AppShell
<AppShell>
  <Routes>
    {/* Your page routes */}
  </Routes>
</AppShell>
```

AppShell provides:
- ✅ Sidebar with role-based menu
- ✅ Topbar with user dropdown
- ✅ Mobile drawer support
- ✅ Responsive layout

### 2. Route Protection
```javascript
// Only allows PATIENT role
<ProtectedRoute allowedRoles={['PATIENT']}>
  <AppShell>
    <Routes>{/* patient routes */}</Routes>
  </AppShell>
</ProtectedRoute>

// Allows multiple roles
<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
  <AppShell>
    <Routes>{/* shared routes */}</Routes>
  </AppShell>
</ProtectedRoute>
```

ProtectedRoute checks:
1. Token exists
2. Role matches
3. Force password change
4. Loading state

### 3. Navigation Menu
```javascript
import { getNavigation } from '../utils/navConfig';

const items = getNavigation('PATIENT');
// Returns menu items for patient

items.forEach(item => {
  if (item.isDivider) {
    // Section divider (e.g., "Lab Services")
  } else {
    // Clickable menu item with icon
  }
});
```

---

## 📁 File Structure

### Layout (3 files)
```
src/components/layout/
├── AppShell.jsx      - Main container
├── Sidebar.jsx       - Navigation sidebar
├── Topbar.jsx        - Top bar
└── index.js
```

### Routing (3 files + utilities)
```
src/router/
├── AppRouter.jsx      - Route configuration
├── ProtectedRoute.jsx - Route protection
├── RoleRedirect.jsx   - Role-based redirects
└── index.js

src/utils/
└── navConfig.js       - Navigation config
```

### Pages - Patient (5 files)
```
src/pages/patient/
├── LabCatalog.jsx
├── LabBooking.jsx
├── LabOrders.jsx
├── LabOrderDetails.jsx
└── LabTracking.jsx
```

### Pages - Doctor (4 files)
```
src/pages/doctor/
├── LabBooking.jsx
├── LabOrders.jsx
├── LabOrderDetails.jsx
└── LabTracking.jsx
```

### Pages - Admin (3 files)
```
src/pages/admin/
├── LabDashboard.jsx
├── LabTasks.jsx
└── LabTaskDetails.jsx
```

### Pages - Phlebotomist (3 files)
```
src/pages/phlebotomist/
├── Tasks.jsx
├── TaskDetails.jsx
└── LiveTracking.jsx
```

---

## 🎯 Route Examples

### Patient Routes
```
/patient/dashboard
/patient/appointments
/patient/prescriptions
/patient/labs/catalog        ✅ Browse tests
/patient/labs/booking        ✅ Book tests
/patient/labs/orders         ✅ View orders
/patient/labs/orders/123     ✅ Order details
/patient/labs/tracking/123   ✅ Track order
/patient/settings
```

### Doctor Routes
```
/doctor/dashboard
/doctor/queue
/doctor/prescriptions
/doctor/labs/booking         ✅ Prescribe tests
/doctor/labs/orders          ✅ View prescriptions
/doctor/labs/orders/123      ✅ Order details
/doctor/labs/tracking/123    ✅ Track tests
/doctor/settings
```

### Admin Routes
```
/admin/dashboard
/admin/doctors
/admin/queue-monitoring
/admin/prescriptions
/admin/labs/dashboard        ✅ Lab overview
/admin/labs/tasks            ✅ Manage tasks
/admin/labs/tasks/456        ✅ Task details
/admin/settings
```

### Phlebotomist Routes
```
/phlebotomist/tasks          ✅ My tasks
/phlebotomist/tasks/789      ✅ Task details
/phlebotomist/tracking       ✅ Live tracking
/phlebotomist/settings
```

---

## 🔐 Authentication Flow

### Login → Home
```
1. User at /login
2. Enters credentials
3. Redux stores token + role
4. Redirects to / (RoleRedirect)
5. RoleRedirect checks role
6. Redirects to /patient/dashboard (or /doctor, /admin, /phlebotomist)
```

### Protected Route Access
```
1. User clicks /patient/labs/orders
2. ProtectedRoute checks token
   - ✅ Found → Continue
   - ❌ Missing → Redirect /login
3. ProtectedRoute checks role
   - ✅ PATIENT → Continue
   - ❌ DOCTOR → Redirect /unauthorized
4. AppShell wraps page
5. Sidebar loads role-specific menu
6. Page renders
```

---

## 🎨 Component Hierarchy

```
AppRouter
├── BrowserRouter
│   └── Routes
│       ├── Public Routes
│       │   ├── /login
│       │   ├── /force-password-change
│       │   └── /unauthorized
│       │
│       ├── /patient/*
│       │   └── ProtectedRoute (PATIENT)
│       │       └── AppShell
│       │           ├── Sidebar (Patient Menu)
│       │           ├── Topbar
│       │           └── Routes (5 Lab pages)
│       │
│       ├── /doctor/*
│       │   └── ProtectedRoute (DOCTOR)
│       │       └── AppShell
│       │           ├── Sidebar (Doctor Menu)
│       │           ├── Topbar
│       │           └── Routes (4 Lab pages)
│       │
│       ├── /admin/*
│       │   └── ProtectedRoute (ADMIN)
│       │       └── AppShell
│       │           ├── Sidebar (Admin Menu)
│       │           ├── Topbar
│       │           └── Routes (3 Lab pages)
│       │
│       └── /phlebotomist/*
│           └── ProtectedRoute (PHLEBOTOMIST)
│               └── AppShell
│                   ├── Sidebar (Phlebotomist Menu)
│                   ├── Topbar
│                   └── Routes (3 Lab pages)
```

---

## 📱 Responsive Design

### Desktop (≥1024px)
- Sidebar: Fixed left 64 (256px width)
- Content: Takes remaining space
- Topbar: Spans across content

### Mobile (<1024px)
- Sidebar: Hidden by default
- Topbar: Shows hamburger menu
- Click hamburger: Sidebar slides in
- Click backdrop: Sidebar closes
- Content: Full width

---

## 🌈 UI Color Scheme

**Status Badges:**
```
✅ Completed/Active: Green (bg-green-100, text-green-700)
⏳ Pending: Yellow (bg-yellow-100, text-yellow-700)
🔄 In Progress: Blue (bg-blue-100, text-blue-700)
❌ Failed: Red (bg-red-100, text-red-700)
```

**Buttons:**
```
Primary: bg-primary-600 hover:bg-primary-700
Secondary: border border-gray-300 hover:bg-gray-50
Danger: bg-red-600 hover:bg-red-700
```

**Cards:**
```
bg-white rounded-lg border border-gray-200 p-6
```

---

## 🔧 Customization

### Add Menu Item
```javascript
// In navConfig.js
export const PATIENT_NAV = [
  {
    id: 'my-new-item',
    label: 'My New Item',
    href: '/patient/my-path',
    icon: MyIcon,
    description: 'Item description'
  },
  // ...
];
```

### Add New Route
```javascript
// In AppRouter.jsx
<Route path="/patient/*" element={
  <ProtectedRoute allowedRoles={['PATIENT']}>
    <AppShell>
      <Routes>
        <Route path="/my-new-route" element={<MyNewPage />} />
        {/* ... */}
      </Routes>
    </AppShell>
  </ProtectedRoute>
} />
```

### Add New Role
```javascript
// 1. In navConfig.js
export const NEW_ROLE_NAV = [/* items */];

export const getNavigation = (role) => {
  const navMap = {
    NEW_ROLE: NEW_ROLE_NAV,
    // ...
  };
  return navMap[role] || PATIENT_NAV;
};

// 2. In AppRouter.jsx
<Route path="/new-role/*" element={
  <ProtectedRoute allowedRoles={['NEW_ROLE']}>
    <AppShell>
      <Routes>{/* routes */}</Routes>
    </AppShell>
  </ProtectedRoute>
} />

// 3. In RoleRedirect.jsx
const roleRoutes = {
  NEW_ROLE: '/new-role/dashboard',
  // ...
};
```

---

## 🐛 Debugging

### Check Authentication
```javascript
// In Redux DevTools
store.auth.accessToken      // Should be JWT string
store.auth.currentUser.role // Should be PATIENT|DOCTOR|ADMIN|PHLEBOTOMIST
store.auth.initialized      // Should be true
```

### Check Route Protection
```javascript
// In browser console
// ProtectedRoute logs to console
// Look for:
// 🛡️ ProtectedRoute check
// ✓ ProtectedRoute: Access granted
// ❌ ProtectedRoute: No token
// ⚠️ ProtectedRoute: Wrong role
```

### Check Navigation
```javascript
// In Sidebar
import { getNavigation } from '../utils/navConfig';
const items = getNavigation(role);
console.log(items); // Should show role-specific items
```

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Layout files | 3 |
| Routing files | 3 |
| Lab pages - Patient | 5 |
| Lab pages - Doctor | 4 |
| Lab pages - Admin | 3 |
| Lab pages - Phlebotomist | 3 |
| Total pages | 14 |
| Total files | 21 |
| Protected routes | 4 (one per role) |
| Navigation items | 20+ |
| Supported roles | 4 |

---

## ✅ Checklist

### Setup
- [ ] All files created
- [ ] AppRouter imported in App.js
- [ ] Redux store configured
- [ ] Token stored in Redux auth
- [ ] Role stored in Redux auth

### Testing
- [ ] Login works
- [ ] Redirects to correct home
- [ ] Sidebar shows correct menu
- [ ] Can navigate lab pages
- [ ] Protected routes block unauthorized
- [ ] Mobile responsive
- [ ] Icons display

### Integration
- [ ] Connect to real auth API
- [ ] Connect to real lab API
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add toast notifications

---

## 🎯 Next Implementation Steps

1. **Connect to Auth API**
   - Replace login placeholder
   - Store real JWT token
   - Handle login errors

2. **Connect to Lab API**
   - Use RTK Query hooks (already created)
   - Replace placeholder data
   - Add loading/error states

3. **Enhance UI**
   - Add form validation
   - Add success messages
   - Add error messages
   - Add confirmation dialogs

4. **Add Features**
   - Real-time updates (WebSocket)
   - File uploads
   - PDF generation
   - Email notifications

---

**Created**: January 25, 2026
**Status**: ✅ Ready for Integration
