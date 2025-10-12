# ActionButton Icon Sizing Guide

## 🎯 **Smart Sizing for Icon-Only Buttons**

The ActionButton now uses different padding for text vs icon-only buttons:

### **📏 Padding Differences:**

#### **With Text (Rectangular)**
```jsx
<ActionButton action="delete" label="Delete" size="sm" />
// Padding: px-2 py-1 (horizontal: 8px, vertical: 4px)

<ActionButton action="delete" label="Delete" size="md" />
// Padding: px-4 py-2 (horizontal: 16px, vertical: 8px)

<ActionButton action="delete" label="Delete" size="lg" />
// Padding: px-6 py-3 (horizontal: 24px, vertical: 12px)
```

#### **Icon Only (Square)**
```jsx
<ActionButton action="delete" label={false} size="sm" />
// Padding: p-1 (all sides: 4px) ⬜

<ActionButton action="delete" label={false} size="md" />
// Padding: p-2 (all sides: 8px) ⬜

<ActionButton action="delete" label={false} size="lg" />
// Padding: p-3 (all sides: 12px) ⬜
```

## 🎨 **Visual Comparison:**

### **Text Buttons (Rectangular)**
```
┌─────────────────┐
│  [🗑️] Delete   │  ← px-4 py-2
└─────────────────┘
```

### **Icon-Only Buttons (Square)**
```
┌─────┐
│ 🗑️  │  ← p-2 (equal on all sides)
└─────┘
```

## 📱 **Real Examples:**

### **Table Actions (Icon-Only)**
```jsx
<div className="flex items-center gap-1">
  <ActionButton module="users" action="read" label={false} size="sm" onClick={onView} />
  <ActionButton module="users" action="update" label={false} size="sm" onClick={onEdit} />
  <ActionButton module="users" action="delete" label={false} size="sm" onClick={onDelete} />
</div>
// Result: [👁️] [✏️] [🗑️] - All square, compact
```

### **Header Actions (With Text)**
```jsx
<div className="flex items-center gap-2">
  <ActionButton module="users" action="create" label="Add User" onClick={onCreate} />
  <ActionButton module="users" action="read" label="Export" onClick={onExport} />
</div>
// Result: [➕ Add User] [👁️ Export] - Rectangular, readable
```

### **Mixed Usage**
```jsx
<div className="flex items-center gap-2">
  <ActionButton module="users" action="create" label="Add User" onClick={onCreate} />
  <ActionButton module="users" action="read" label={false} onClick={onRefresh} />
</div>
// Result: [➕ Add User] [👁️] - Mixed sizes work well together
```

## ✅ **Benefits:**

- **Square Icons** - Perfect for compact table actions
- **Balanced Look** - Equal padding creates visual harmony
- **Space Efficient** - Icon-only buttons take minimal space
- **Consistent** - All icon-only buttons have same proportions
- **Flexible** - Mix and match with text buttons seamlessly

## 🎯 **Size Guide:**

| Size | Text Button | Icon-Only | Best For |
|------|-------------|-----------|----------|
| `sm` | `px-2 py-1` | `p-1` | Table actions, compact UI |
| `md` | `px-4 py-2` | `p-2` | Standard buttons, forms |
| `lg` | `px-6 py-3` | `p-3` | Headers, primary actions |

Your icon-only buttons now have perfect square proportions! 🎯