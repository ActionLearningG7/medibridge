# UI Kit - Quick Start Guide

**Status**: ✅ Complete & Ready to Use
**Components**: 10 + PageHeader
**Date**: January 25, 2026

---

## 📦 What Was Created

### UI Components (10 files)
✅ **Button.jsx** - Versatile button with variants & sizes
✅ **Input.jsx** - Text input with validation
✅ **Select.jsx** - Dropdown with icon
✅ **Badge.jsx** - Status badges
✅ **Card.jsx** - Container with header/content/footer
✅ **Modal.jsx** - Dialog with backdrop
✅ **Table.jsx** - Table with loading/empty states
✅ **Tabs.jsx** - Tab navigation (simple & manual)
✅ **Toast.jsx** - Notifications with hook
✅ **PageHeader.jsx** - Page header with actions

### Export & Documentation
✅ **index.js** - Centralized export
✅ **UI_KIT_DOCUMENTATION.md** - Complete guide

---

## 🚀 Quick Start

### 1. Import Components
```jsx
import { Button, Input, Select, Badge, Card, Modal, Table, Tabs, Toast, PageHeader } from '../ui';
```

### 2. Use Button
```jsx
<Button variant="primary" size="md">Click Me</Button>
<Button loading>Processing...</Button>
<Button variant="danger" disabled>Delete</Button>
```

### 3. Use Form Inputs
```jsx
<Input 
  label="Name" 
  placeholder="John Doe"
  required
  error={error}
/>

<Select 
  label="Role"
  options={[
    { value: 'patient', label: 'Patient' },
    { value: 'doctor', label: 'Doctor' }
  ]}
/>
```

### 4. Use Card
```jsx
<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer here</CardFooter>
</Card>
```

### 5. Use PageHeader
```jsx
<PageHeader 
  title="Lab Orders"
  subtitle="Manage your orders"
  actions={[
    { label: 'New Order', icon: Plus, onClick: handleNew }
  ]}
/>
```

---

## 🎨 All Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| Button | Action | variant, size, loading, disabled |
| Input | Text field | label, error, required, type |
| Select | Dropdown | label, options, error, placeholder |
| Badge | Status tag | variant, size |
| Card | Container | (subcomponents: Header, Title, Content, Footer) |
| Modal | Dialog | isOpen, onClose, title, size |
| Table | Data grid | (subcomponents: Head, Header, Body, Row, Cell + Empty, Loading) |
| Tabs | Navigation | tabs, onChange (or manual: TabButton, TabContent) |
| Toast | Notification | variant, title, message, duration |
| PageHeader | Page top | title, subtitle, actions, breadcrumbs |

---

## 💡 Common Patterns

### Form with Validation
```jsx
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

<Input 
  label="Email"
  error={errors.email}
  onChange={(e) => setFormData({...formData, email: e.target.value})}
/>
```

### Modal Confirmation
```jsx
const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
  footer={
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="danger">Delete</Button>
    </div>
  }
>
  Are you sure?
</Modal>
```

### Toast Notifications
```jsx
const { toasts, addToast, removeToast } = useToast();

const handleSuccess = () => {
  addToast({
    variant: 'success',
    title: 'Success!',
    message: 'Order created',
  });
};

return (
  <>
    <button onClick={handleSuccess}>Create</button>
    <ToastContainer toasts={toasts} removeToast={removeToast} />
  </>
);
```

### Table with Data
```jsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Email</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.length === 0 ? (
      <TableEmpty message="No orders found" />
    ) : (
      data.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.email}</TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>
```

---

## 🎯 Component Variants

### Button Variants
- `primary` - Main action (blue)
- `secondary` - Secondary (gray)
- `danger` - Destructive (red)
- `success` - Positive (green)
- `warning` - Warning (yellow)
- `outline` - Bordered
- `ghost` - Transparent

### Button Sizes
- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

### Badge Variants
- `primary`, `success`, `danger`, `warning`, `info`, `gray`
- **Sizes**: `sm`, `md`, `lg`

### Toast Variants
- `success` - Green
- `error` - Red
- `info` - Blue
- `warning` - Yellow

### Modal Sizes
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large
- `2xl` - XXL

---

## 🎨 Styling & Customization

### Override Component Styles
```jsx
<Button className="bg-purple-600 hover:bg-purple-700">
  Custom Button
</Button>
```

### Consistent Spacing
- Use `space-y-4` for vertical gaps
- Use `gap-2` for flex gaps
- Use `p-6` for padding, `px-4` for horizontal

### Typography
- Page titles: `text-3xl font-bold`
- Section titles: `text-lg font-semibold`
- Body text: `text-sm text-gray-600`

---

## 🔧 Dependencies

All components use:
- ✅ React (hooks, forwardRef)
- ✅ Tailwind CSS (styling)
- ✅ Lucide React (icons)
- ✅ utils/cn (class merging)

---

## 📁 File Structure

```
src/ui/
├── Button.jsx         - Button component
├── Input.jsx          - Input field
├── Select.jsx         - Dropdown select
├── Badge.jsx          - Status badge
├── Card.jsx           - Card container
├── Modal.jsx          - Modal dialog
├── Table.jsx          - Table component
├── Tabs.jsx           - Tab navigation
├── Toast.jsx          - Toast notifications
├── PageHeader.jsx     - Page header
├── index.js           - Export barrel
```

---

## ✅ Features

- ✅ All components use `React.forwardRef` for ref support
- ✅ Loading states with spinners
- ✅ Error states with messages
- ✅ Empty states for tables
- ✅ Disabled states
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility features (ARIA, focus states)
- ✅ Consistent spacing & typography
- ✅ Tailwind CSS only (no external CSS)
- ✅ Tree-shakeable exports

---

## 🧪 Testing Example

```jsx
import { render, screen } from '@testing-library/react';
import { Button } from '../ui';

test('button renders', () => {
  render(<Button>Click</Button>);
  expect(screen.getByText('Click')).toBeInTheDocument();
});

test('button shows loading', () => {
  render(<Button loading />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

---

## 📝 Next Steps

1. **Use in Pages** - Replace placeholder styles with UI components
2. **Create Forms** - Use Input, Select, Button for forms
3. **Add Modals** - Use Modal for confirmations
4. **Implement Tables** - Use Table for data display
5. **Add Feedback** - Use Toast for notifications

---

**Status**: ✅ Complete & Production Ready
**Ready to use**: Yes
**Documentation**: Complete
