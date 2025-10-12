# ActionButton Icon Usage Guide

## 🎯 **Smart Icon Spacing**

The ActionButton now automatically handles icon spacing based on whether there's text or not:

### **✅ With Text (Icon has `mr-1` margin)**
```jsx
// Default text (action name)
<ActionButton module="users" action="delete" onClick={handleDelete} />
// Result: [🗑️] Delete

// Custom text
<ActionButton module="users" action="delete" label="Remove User" onClick={handleDelete} />
// Result: [🗑️] Remove User
```

### **✅ Icon Only (No margin)**
```jsx
// Empty string for icon-only button
<ActionButton module="users" action="delete" label="" onClick={handleDelete} />
// Result: [🗑️]

// Custom icon with no text
<ActionButton 
  module="users" 
  action="delete" 
  label=""
  icon={<FaTrash />}
  onClick={handleDelete} 
/>
// Result: [🗑️]
```

### **✅ Custom Icon with Text**
```jsx
<ActionButton 
  module="users" 
  action="read" 
  label="Download"
  icon={<FaDownload className="mr-1" />}
  onClick={handleDownload} 
/>
// Result: [⬇️] Download
```

## 📋 **Usage Examples:**

### **Table Actions (Small with text)**
```jsx
<ActionButton module="users" action="read" label="View" size="sm" onClick={onView} />
<ActionButton module="users" action="update" label="Edit" size="sm" onClick={onEdit} />
<ActionButton module="users" action="delete" label="Delete" size="sm" onClick={onDelete} />
```

### **Icon-Only Buttons (Compact)**
```jsx
<ActionButton module="users" action="read" label="" size="sm" onClick={onView} />
<ActionButton module="users" action="update" label="" size="sm" onClick={onEdit} />
<ActionButton module="users" action="delete" label="" size="sm" onClick={onDelete} />
```

### **Header Buttons (Large with text)**
```jsx
<ActionButton module="users" action="create" label="Add User" size="lg" onClick={onCreate} />
```

## 🎨 **Icon Behavior:**

- **With Text**: Icon gets `mr-1` class for proper spacing
- **Without Text**: Icon has no margin, perfect for icon-only buttons
- **Custom Icons**: You control the spacing by adding `mr-1` yourself if needed
- **Automatic**: No need to think about it - just works!

## ✅ **Benefits:**

- **Smart Spacing** - Icons automatically adjust based on text presence
- **Flexible** - Support both text and icon-only buttons
- **Consistent** - Same component for all use cases
- **Clean** - No unnecessary margins on icon-only buttons

Your ActionButton now handles icon spacing intelligently! 🚀