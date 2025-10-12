# ActionButton - Flexible Usage Guide

## 🎯 **Enhanced Flexibility**

The ActionButton now supports flexible props with smart defaults:

### **📋 Prop Options:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `module` | string | `'general'` | Module name (optional) |
| `action` | string | `'read'` | Action type (optional) |
| `label` | string\|boolean | `undefined` | Button text or false for icon-only |
| `onClick` | function | - | Click handler (required) |

## 🎨 **Label Behavior:**

### **✅ Default Text (label undefined)**
```jsx
<ActionButton action="delete" onClick={handleDelete} />
// Result: [🗑️] Delete
```

### **✅ Custom Text (label as string)**
```jsx
<ActionButton action="delete" label="Remove" onClick={handleDelete} />
// Result: [🗑️] Remove
```

### **✅ Icon Only (label as false)**
```jsx
<ActionButton action="delete" label={false} onClick={handleDelete} />
// Result: [🗑️]
```

### **✅ Empty Text (label as empty string)**
```jsx
<ActionButton action="delete" label="" onClick={handleDelete} />
// Result: [🗑️]
```

## 🔧 **Module & Action Defaults:**

### **✅ Minimal Usage (no permissions)**
```jsx
<ActionButton onClick={handleClick} />
// Uses: module="general", action="read"
// Result: [👁️] Read
```

### **✅ Action Only**
```jsx
<ActionButton action="create" onClick={handleCreate} />
// Uses: module="general"
// Result: [➕] Create
```

### **✅ Module Only**
```jsx
<ActionButton module="users" onClick={handleUsers} />
// Uses: action="read"
// Result: [👁️] Read (with permission check for users)
```

## 📱 **Real-World Examples:**

### **Table Actions**
```jsx
// With text
<ActionButton module="users" action="read" label="View" size="sm" onClick={onView} />
<ActionButton module="users" action="update" label="Edit" size="sm" onClick={onEdit} />
<ActionButton module="users" action="delete" label="Delete" size="sm" onClick={onDelete} />

// Icon only (compact)
<ActionButton module="users" action="read" label={false} size="sm" onClick={onView} />
<ActionButton module="users" action="update" label={false} size="sm" onClick={onEdit} />
<ActionButton module="users" action="delete" label={false} size="sm" onClick={onDelete} />
```

### **Header Buttons**
```jsx
<ActionButton module="users" action="create" label="Add User" onClick={onCreate} />
<ActionButton module="users" action="read" label="Export Users" onClick={onExport} />
```

### **Utility Buttons (No Permissions)**
```jsx
<ActionButton action="read" label="Refresh" onClick={onRefresh} />
<ActionButton action="create" label="New Item" onClick={onCreate} />
<ActionButton label={false} icon={<FaDownload />} onClick={onDownload} />
```

### **Custom Styled**
```jsx
<ActionButton 
  module="users" 
  action="delete" 
  label="Permanently Delete"
  className="bg-red-700 hover:bg-red-800"
  onClick={onDelete} 
/>
```

## 🎯 **Permission Logic:**

- **With Module**: Checks permissions for that module/action
- **module="general"**: Skips permission check (always shows)
- **No Module**: Defaults to "general" (no permission check)

## ✅ **Benefits:**

- **Flexible Props** - All props are optional except `onClick`
- **Smart Defaults** - Sensible fallbacks for all scenarios
- **Icon Control** - Easy icon-only buttons with `label={false}`
- **Permission Optional** - Can be used without permission system
- **Backward Compatible** - All existing usage still works

## 🚀 **Migration Examples:**

### **Before (Old Usage)**
```jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleClick}>
  Click Me
</button>
```

### **After (New ActionButton)**
```jsx
<ActionButton label="Click Me" onClick={handleClick} />
```

Your ActionButton is now super flexible and works for any scenario! 🎯