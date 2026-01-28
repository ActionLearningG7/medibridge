# MediBridge UI Kit - Component Library

**Version**: 1.0
**Date**: January 25, 2026
**Status**: ✅ Production Ready

---

## 📦 Overview

Complete, production-ready UI component library built with React, Tailwind CSS, and Lucide icons. All components support:

- ✅ Consistent spacing and typography
- ✅ Empty/loading/error states
- ✅ Accessibility features
- ✅ Dark mode ready (Tailwind structure)
- ✅ Responsive design
- ✅ TypeScript ready (JSDoc comments)
- ✅ Forwardable refs

---

## 🎨 Components

### 1. **Button**
Versatile button component with multiple variants and sizes.

**Variants**: `primary`, `secondary`, `danger`, `success`, `warning`, `outline`, `ghost`
**Sizes**: `xs`, `sm`, `md`, `lg`, `xl`
**Props**:
- `variant`: Button style variant
- `size`: Button size
- `disabled`: Disable button
- `loading`: Show loading spinner
- `className`: Additional CSS classes

**Usage**:
```jsx
import { Button } from '../ui';

<Button variant="primary" size="md">Click Me</Button>
<Button loading>Processing...</Button>
<Button variant="danger">Delete</Button>
```

---

### 2. **Input**
Text input with label, error states, and validation.

**Props**:
- `label`: Label text
- `error`: Error message
- `helperText`: Helper text
- `disabled`: Disable input
- `required`: Required field indicator
- `type`: Input type (text, email, password, etc.)
- `size`: Input size (sm, md, lg)

**Usage**:
```jsx
import { Input } from '../ui';

<Input 
  label="Email" 
  type="email" 
  placeholder="your@email.com"
  required
  error={error}
  helperText="We'll never share your email"
/>
```

---

### 3. **Select**
Dropdown select with label and error states.

**Props**:
- `label`: Label text
- `error`: Error message
- `helperText`: Helper text
- `disabled`: Disable select
- `required`: Required field indicator
- `size`: Select size
- `options`: Array of {value, label} objects
- `placeholder`: Placeholder text

**Usage**:
```jsx
import { Select } from '../ui';

<Select 
  label="Choose Role"
  options={[
    { value: 'patient', label: 'Patient' },
    { value: 'doctor', label: 'Doctor' }
  ]}
  placeholder="Select a role"
/>
```

---

### 4. **Badge**
Status badge with multiple variants for tags and labels.

**Variants**: `primary`, `success`, `danger`, `warning`, `info`, `gray`
**Sizes**: `sm`, `md`, `lg`

**Usage**:
```jsx
import { Badge } from '../ui';

<Badge variant="success">Active</Badge>
<Badge variant="danger" size="sm">Error</Badge>
<Badge variant="warning">Pending</Badge>
```

---

### 5. **Card**
Container component for content with consistent styling.

**Subcomponents**: `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`

**Usage**:
```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui';

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

---

### 6. **Modal**
Dialog modal with backdrop and animations.

**Props**:
- `isOpen`: Show/hide modal
- `onClose`: Callback when closing
- `title`: Modal title
- `children`: Modal content
- `footer`: Modal footer content
- `size`: Modal size (sm, md, lg, xl, 2xl)
- `closeButton`: Show close button

**Usage**:
```jsx
import { Modal } from '../ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={<Button onClick={() => setIsOpen(false)}>Close</Button>}
>
  Are you sure?
</Modal>
```

---

### 7. **Table**
Reusable table component with header, body, rows, and cells.

**Subcomponents**: 
- `TableHead`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `TableEmpty`, `TableLoading` (state components)

**Usage**:
```jsx
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../ui';

<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Email</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 8. **Tabs**
Tab navigation with content panes.

**Variants**:
- Simple `Tabs` component (managed state)
- Manual `TabsManual`, `TabList`, `TabButton`, `TabContent` (unmanaged)

**Usage**:
```jsx
import { Tabs } from '../ui';

const tabs = [
  { label: 'Tab 1', content: <div>Content 1</div> },
  { label: 'Tab 2', content: <div>Content 2</div> }
];

<Tabs tabs={tabs} onChange={(index) => console.log(index)} />
```

**Manual Usage**:
```jsx
import { TabsManual, TabList, TabButton, TabContent } from '../ui';

const [active, setActive] = useState(0);

<TabsManual>
  <TabList>
    <TabButton isActive={active === 0} onClick={() => setActive(0)}>Tab 1</TabButton>
    <TabButton isActive={active === 1} onClick={() => setActive(1)}>Tab 2</TabButton>
  </TabList>
  <TabContent isActive={active === 0}>Content 1</TabContent>
  <TabContent isActive={active === 1}>Content 2</TabContent>
</TabsManual>
```

---

### 9. **Toast**
Toast notifications with auto-dismiss.

**Variants**: `success`, `error`, `info`, `warning`
**Hook**: `useToast()` for managing multiple toasts

**Usage**:
```jsx
import { Toast, useToast, ToastContainer } from '../ui';

const { toasts, addToast, removeToast } = useToast();

const showToast = () => {
  addToast({
    variant: 'success',
    title: 'Success!',
    message: 'Operation completed',
    duration: 3000
  });
};

return (
  <>
    <button onClick={showToast}>Show Toast</button>
    <ToastContainer toasts={toasts} removeToast={removeToast} />
  </>
);
```

---

### 10. **PageHeader**
Reusable page header with title, subtitle, breadcrumbs, and actions.

**Props**:
- `title`: Page title
- `subtitle`: Page subtitle
- `breadcrumbs`: Array of {label, href} objects
- `actions`: Array of action buttons

**Action Structure**:
```jsx
{
  label: 'Button Label',
  variant: 'outline' | 'primary',
  icon: IconComponent,
  onClick: () => {},
  disabled: false,
  render: () => <CustomComponent /> // Optional custom render
}
```

**Usage**:
```jsx
import { PageHeader } from '../ui';
import { Plus, Download } from 'lucide-react';

<PageHeader 
  title="Lab Orders"
  subtitle="Manage your lab test orders"
  breadcrumbs={[
    { label: 'Home' },
    { label: 'Labs', href: '/labs' },
    { label: 'Orders' }
  ]}
  actions={[
    { 
      label: 'Download', 
      icon: Download,
      variant: 'outline'
    },
    { 
      label: 'New Order', 
      icon: Plus,
      onClick: () => navigate('/labs/booking')
    }
  ]}
/>
```

---

## 🎨 Design System

### Typography
- **Page Title**: `text-3xl font-bold text-gray-900`
- **Section Title**: `text-lg font-semibold text-gray-900`
- **Body Text**: `text-sm text-gray-600`
- **Small Text**: `text-xs text-gray-500`
- **Bold**: `font-semibold`
- **Medium**: `font-medium`

### Spacing
- **None**: `0`
- **XS**: `px-2 py-1` (8px)
- **SM**: `px-3 py-1.5` (12px)
- **MD**: `px-4 py-2` (16px)
- **LG**: `px-6 py-3` (24px)
- **XL**: `px-8 py-4` (32px)

### Colors
- **Primary**: `primary-600` (blue)
- **Success**: `green-600`
- **Danger**: `red-600`
- **Warning**: `yellow-600`
- **Gray**: `gray-600`

### Borders & Shadows
- **Border**: `border border-gray-200`
- **Border Color**: Gray 200 (#E5E7EB)
- **Shadow**: `shadow-md` on hover
- **Border Radius**: `rounded-lg` (8px)

---

## 🚀 State Management

### Loading States
- **Button Loading**: Use `loading` prop to show spinner
- **Table Loading**: Use `<TableLoading />` component
- **Input/Select**: Show with `disabled` prop

### Error States
- **Input/Select**: Use `error` prop for red styling + error message
- **Form Validation**: Show error message below field

### Empty States
- **Table Empty**: Use `<TableEmpty message="No data found" />`
- **Custom**: Use `<div className="py-12 text-center text-gray-500">Empty state</div>`

---

## 📱 Responsive Design

All components use Tailwind CSS responsive classes:
- **Mobile**: Default styles apply
- **Tablet**: `sm:` (640px), `md:` (768px)
- **Desktop**: `lg:` (1024px), `xl:` (1280px)

Example:
```jsx
<PageHeader 
  title="Mobile Title"
  className="px-4 sm:px-6 lg:px-8"
/>
```

---

## ♿ Accessibility

All components include:
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus states (focus ring)
- ✅ Semantic HTML
- ✅ Disabled state styling
- ✅ Error associations

---

## 🔧 Customization

### Override Styles
```jsx
import { Button } from '../ui';

<Button 
  className="bg-purple-600 hover:bg-purple-700"
>
  Custom Button
</Button>
```

### Extend Components
```jsx
// Create wrapper component
function MyButton(props) {
  return <Button variant="primary" {...props} />;
}
```

### Theme Colors
To change primary color across all components, update Tailwind config:
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ }
    }
  }
}
```

---

## 📊 Component Matrix

| Component | Type | States | Sizes | Variants |
|-----------|------|--------|-------|----------|
| Button | Action | Default, Hover, Disabled, Loading | 5 | 7 |
| Input | Form | Default, Focused, Error, Disabled | 3 | 1 |
| Select | Form | Default, Focused, Error, Disabled | 3 | 1 |
| Badge | Feedback | Default | 3 | 6 |
| Card | Layout | Default | 1 | 1 |
| Modal | Layout | Open, Closed | 5 | 1 |
| Table | Data | Loading, Empty, Error | 1 | 1 |
| Tabs | Navigation | Active, Inactive | 1 | 1 |
| Toast | Feedback | Auto-dismiss | 1 | 4 |
| PageHeader | Layout | With/without actions | 1 | 1 |

---

## 🎯 Usage Patterns

### Form Pattern
```jsx
import { Input, Select, Button } from '../ui';
import { useState } from 'react';

function MyForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  return (
    <div className="space-y-4">
      <Input 
        label="Name"
        error={errors.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <Select 
        label="Role"
        options={options}
        error={errors.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
      />
      <Button type="submit">Submit</Button>
    </div>
  );
}
```

### Page with Header Pattern
```jsx
import { PageHeader, Button } from '../ui';
import { Plus } from 'lucide-react';

function LabOrders() {
  return (
    <>
      <PageHeader 
        title="Lab Orders"
        subtitle="View and manage your lab orders"
        actions={[
          { label: 'New Order', icon: Plus, onClick: () => {} }
        ]}
      />
      <div className="p-6">
        {/* Content */}
      </div>
    </>
  );
}
```

---

## 📚 Import Examples

**Import all**:
```jsx
import { Button, Input, Select, Badge, Card, Modal, Table, Tabs, Toast, PageHeader } from '../ui';
```

**Import specific**:
```jsx
import { Button } from '../ui';
import { Input, Select } from '../ui';
import { Modal } from '../ui';
```

---

## 🧪 Testing

### Unit Test Example
```jsx
import { render, screen } from '@testing-library/react';
import { Button } from '../ui';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('button shows loading state', () => {
  render(<Button loading>Loading...</Button>);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

---

## 🚀 Performance

- ✅ All components use `React.forwardRef` for ref support
- ✅ No unnecessary re-renders (controlled vs uncontrolled patterns)
- ✅ Minimal dependencies (only Lucide for icons)
- ✅ Optimized CSS with Tailwind (no unused styles)
- ✅ Tree-shakeable exports

---

## ✅ Checklist

- [x] Button component
- [x] Input component
- [x] Select component
- [x] Badge component
- [x] Card component (with subcomponents)
- [x] Modal component
- [x] Table component (with subcomponents)
- [x] Tabs component (with variants)
- [x] Toast component (with hook)
- [x] PageHeader component
- [x] Consistent spacing & typography
- [x] Empty/loading/error states
- [x] Export barrel (index.js)
- [x] Complete documentation

---

## 📞 Quick Reference

**Location**: `src/ui/`
**Export Point**: `src/ui/index.js`
**Dependencies**: React, Tailwind CSS, Lucide React, utils/cn

**Usage**: 
```jsx
import { Button, Input, Select, ... } from '../ui';
```

---

**Status**: ✅ Complete & Production Ready
**Version**: 1.0
**Created**: January 25, 2026
