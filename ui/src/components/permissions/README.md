# Permission-Based ActionButton System

This system provides a single, reusable `ActionButton` component that automatically handles permission checking and renders buttons based on user roles.

## Quick Start

### 1. Import the components
```jsx
import { ActionButton, PermissionGuard } from '@/components/permissions';
```

### 2. Basic Usage
```jsx
// Simple action button
<ActionButton 
  module="users" 
  action="delete" 
  onClick={() => handleDelete()} 
/>

// Custom label and styling
<ActionButton 
  module="loans" 
  action="create" 
  label="Add New Loan"
  className="bg-indigo-500 hover:bg-indigo-600"
  onClick={() => handleCreate()} 
/>

// Custom icon
<ActionButton 
  module="users" 
  action="read" 
  label="Download Report"
  icon={<FaDownload className="mr-1" />}
  onClick={() => handleDownload()} 
/>
```

### 3. Page-level Protection
```jsx
<PermissionGuard module="users" showMessage>
  <UsersPage />
</PermissionGuard>
```

## ActionButton Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `module` | string | ✅ | Module name (users, loans, insurance, etc.) |
| `action` | string | ✅ | Action type (read, create, update, delete, manage) |
| `onClick` | function | ✅ | Click handler |
| `label` | string | ❌ | Custom button text (defaults to capitalized action) |
| `icon` | ReactElement | ❌ | Custom icon (has smart defaults) |
| `className` | string | ❌ | Additional Tailwind classes |
| `size` | string | ❌ | Button size: 'sm', 'md', 'lg' (default: 'md') |
| `disabled` | boolean | ❌ | Disable button |
| `style` | object | ❌ | Inline styles |

## Available Modules
- `users` - User management
- `roles` - Role management  
- `loans` - Loan products
- `credit-cards` - Credit card products
- `insurance` - Insurance products
- `applications` - Application management
- `employees` - Employee management
- `departments` - Department management

## Available Actions
- `read` - View/read access (blue button)
- `create` - Create new items (green button)
- `update` - Edit existing items (yellow button)
- `delete` - Delete items (red button)
- `manage` - Full management access (purple button)

## Examples for Your App

### In Table Actions Column
```jsx
// Replace old buttons with ActionButton
<div className="flex items-center gap-1">
  <ActionButton
    module="loans"
    action="read"
    label="View"
    size="sm"
    onClick={() => onView(row.original)}
  />
  <ActionButton
    module="loans"
    action="update"
    label="Edit"
    size="sm"
    onClick={() => onEdit(row.original)}
  />
  <ActionButton
    module="loans"
    action="delete"
    label="Delete"
    size="sm"
    onClick={() => onDelete(row.original)}
  />
</div>
```

### In Page Headers
```jsx
<div className="flex items-center gap-2">
  <ActionButton
    module="users"
    action="create"
    label="Add User"
    onClick={() => setShowCreateModal(true)}
  />
  <ActionButton
    module="users"
    action="read"
    label="Export"
    icon={<FaDownload className="mr-1" />}
    onClick={handleExport}
    className="bg-green-600 hover:bg-green-700"
  />
</div>
```

### Page Protection
```jsx
// Wrap entire pages
<PermissionGuard module="users" showMessage>
  <UsersManagementPage />
</PermissionGuard>

// Or redirect if no access
<PermissionGuard module="admin" redirect="/dashboard">
  <AdminPanel />
</PermissionGuard>
```

## How It Works

1. **Permission Context**: The `PermissionProvider` wraps your app and provides user permissions
2. **Automatic Checking**: Each `ActionButton` checks if the user has permission for that module/action
3. **Smart Rendering**: Buttons only render if user has permission (returns `null` otherwise)
4. **Default Styling**: Each action has default colors and icons, but fully customizable

## Migration Guide

Replace your existing buttons:

**Before:**
```jsx
<button className="bg-red-500 text-white px-4 py-2 rounded">
  Delete User
</button>
```

**After:**
```jsx
<ActionButton 
  module="users" 
  action="delete" 
  label="Delete User"
  onClick={handleDelete}
/>
```

The ActionButton will automatically:
- Check if user can delete users
- Show appropriate icon and styling
- Only render if permission exists
- Handle all the styling and states

## Benefits

✅ **Single Component**: One button for all actions across your app
✅ **Permission-Aware**: Automatically checks user permissions  
✅ **Consistent Styling**: Unified look and feel
✅ **Smart Defaults**: Icons and colors per action type
✅ **Fully Customizable**: Override any styling or behavior
✅ **Type Safety**: Clear props and expected values
✅ **Easy Migration**: Drop-in replacement for existing buttons