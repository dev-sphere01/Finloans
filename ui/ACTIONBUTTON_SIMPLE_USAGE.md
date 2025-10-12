# ActionButton - Simple Usage (Icon-Only Default)

## 🎯 **Default Behavior: Icon-Only**

The ActionButton now defaults to icon-only buttons. No need to pass `label={false}`:

### **✅ Simple Usage (Icon-Only)**
```jsx
<ActionButton action="delete" onClick={handleDelete} />
// Result: [🗑️] (just icon, no text)

<ActionButton module="users" action="update" onClick={handleEdit} />
// Result: [✏️] (just icon, no text)
```

### **✅ With Text (When Needed)**
```jsx
<ActionButton action="delete" label="Delete User" onClick={handleDelete} />
// Result: [🗑️] Delete User

<ActionButton action="create" label="Add New Item" onClick={handleCreate} />
// Result: [➕] Add New Item
```

## 📱 **Perfect for Tables**

### **Before (Old Way)**
```jsx
<ActionButton module="users" action="read" label={false} size="sm" onClick={onView} />
<ActionButton module="users" action="update" label={false} size="sm" onClick={onEdit} />
<ActionButton module="users" action="delete" label={false} size="sm" onClick={onDelete} />
```

### **After (New Way)**
```jsx
<ActionButton module="users" action="read" size="sm" onClick={onView} />
<ActionButton module="users" action="update" size="sm" onClick={onEdit} />
<ActionButton module="users" action="delete" size="sm" onClick={onDelete} />
```

**Result:** Three clean icon buttons: [👁️] [✏️] [🗑️]

## 🎨 **Usage Examples:**

### **Table Actions (Clean & Simple)**
```jsx
<div className="flex items-center gap-1">
  <ActionButton module="users" action="read" size="sm" onClick={onView} />
  <ActionButton module="users" action="update" size="sm" onClick={onEdit} />
  <ActionButton module="users" action="delete" size="sm" onClick={onDelete} />
</div>
```

### **Header Actions (With Text)**
```jsx
<div className="flex items-center gap-2">
  <ActionButton module="users" action="create" label="Add User" onClick={onCreate} />
  <ActionButton module="users" action="read" label="Export Data" onClick={onExport} />
</div>
```

### **Mixed Usage**
```jsx
<div className="flex items-center gap-2">
  <ActionButton module="users" action="create" label="Add User" onClick={onCreate} />
  <ActionButton module="users" action="read" onClick={onRefresh} />
  <ActionButton module="users" action="delete" onClick={onDelete} />
</div>
// Result: [➕ Add User] [👁️] [🗑️]
```

### **Minimal Usage**
```jsx
<ActionButton onClick={handleClick} />
// Result: [👁️] (uses defaults: module="general", action="read")
```

## ✅ **Benefits:**

- **Cleaner Code** - No need for `label={false}`
- **Icon-First** - Perfect for modern UI design
- **Space Efficient** - Compact buttons for tables
- **Still Flexible** - Add text when needed
- **Consistent** - All icon buttons have perfect square proportions

## 🎯 **When to Use Text:**

- **Primary Actions** - Important buttons in headers
- **Unclear Icons** - When the action might be ambiguous
- **Accessibility** - When screen readers need descriptive text
- **Marketing** - Call-to-action buttons

## 🚀 **Migration:**

### **Old Usage**
```jsx
<ActionButton module="users" action="delete" label={false} onClick={onDelete} />
```

### **New Usage**
```jsx
<ActionButton module="users" action="delete" onClick={onDelete} />
```

Your ActionButton is now simpler and cleaner by default! 🎯