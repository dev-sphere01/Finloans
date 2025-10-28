# Contact Links Components

This module provides reusable components for displaying clickable contact information (emails, phone numbers, and websites) throughout the application.

## Components

### EmailLink
Renders an email address as a clickable `mailto:` link.

```jsx
import { EmailLink } from '@/components/common/ContactLinks';

// Basic usage
<EmailLink email="user@example.com" />

// With custom styling and no icon
<EmailLink 
  email="user@example.com" 
  className="text-blue-500 font-medium" 
  showIcon={false} 
/>

// With custom children
<EmailLink email="user@example.com">
  Contact Support
</EmailLink>
```

### PhoneLink
Renders a phone number as a clickable `tel:` link (automatically adds +91 country code).

```jsx
import { PhoneLink } from '@/components/common/ContactLinks';

// Basic usage
<PhoneLink phone="9876543210" />

// With custom styling
<PhoneLink 
  phone="9876543210" 
  className="text-green-600 font-medium" 
  showIcon={true} 
/>

// With custom children
<PhoneLink phone="9876543210">
  Call Now
</PhoneLink>
```

### WebsiteLink
Renders a URL as a clickable external link (opens in new tab).

```jsx
import { WebsiteLink } from '@/components/common/ContactLinks';

// Basic usage
<WebsiteLink url="https://example.com" />

// With custom styling and no icon
<WebsiteLink 
  url="example.com" 
  className="text-blue-600 font-medium" 
  showIcon={false} 
/>

// With custom children
<WebsiteLink url="https://example.com">
  Visit Website
</WebsiteLink>
```

### ContactInfo
Renders both email and phone information together.

```jsx
import { ContactInfo } from '@/components/common/ContactLinks';

<ContactInfo 
  email="user@example.com" 
  phone="9876543210" 
  className="space-y-2" 
/>
```

## Props

### EmailLink Props
- `email` (string, required): The email address
- `className` (string, optional): Additional CSS classes
- `showIcon` (boolean, optional, default: true): Whether to show the email icon
- `children` (ReactNode, optional): Custom content to display instead of the email

### PhoneLink Props
- `phone` (string, required): The phone number
- `className` (string, optional): Additional CSS classes
- `showIcon` (boolean, optional, default: true): Whether to show the phone icon
- `children` (ReactNode, optional): Custom content to display instead of the phone number

### WebsiteLink Props
- `url` (string, required): The website URL
- `className` (string, optional): Additional CSS classes
- `showIcon` (boolean, optional, default: true): Whether to show the external link icon
- `children` (ReactNode, optional): Custom content to display instead of the URL

### ContactInfo Props
- `email` (string, optional): The email address
- `phone` (string, optional): The phone number
- `className` (string, optional): Additional CSS classes for the container

## Features

- **Automatic Protocol Handling**: URLs without `http://` or `https://` are automatically prefixed with `https://`
- **Country Code**: Phone numbers automatically get `+91` country code for Indian numbers
- **Accessibility**: All links include appropriate `title` attributes for better accessibility
- **Icons**: Uses Lucide React icons (FaEnvelope, FaPhone, FaExternalLinkAlt)
- **Responsive**: Works well on both desktop and mobile devices
- **Click-to-Action**: 
  - Email links open the default email client
  - Phone links initiate calls on mobile devices
  - Website links open in new tabs with security attributes

## Usage Examples in the Application

### In Lead Details
```jsx
// Before
<p className="text-sm text-gray-900">{lead.contactNo}</p>
<p className="text-sm text-gray-900">{lead.email}</p>

// After
<PhoneLink phone={lead.contactNo} className="text-sm font-medium" />
<EmailLink email={lead.email} className="text-sm font-medium" />
```

### In Tables/Lists
```jsx
// Before
<div className="text-sm text-gray-500">{lead.contactNo}</div>

// After
<PhoneLink phone={lead.contactNo} className="text-gray-500" showIcon={true} />
```

### Service Provider Websites
```jsx
// Before
<a href={provider.website} target="_blank" rel="noopener noreferrer">
  Visit Website
</a>

// After
<WebsiteLink url={provider.website} showIcon={false}>
  Visit Website
</WebsiteLink>
```

## Benefits

1. **Consistent Styling**: All contact links have consistent styling across the application
2. **Better UX**: Users can directly interact with contact information (call, email, visit)
3. **Mobile Friendly**: Phone links work seamlessly on mobile devices
4. **Security**: External links include proper security attributes
5. **Maintainable**: Centralized component makes it easy to update styling or behavior
6. **Accessible**: Proper ARIA attributes and titles for screen readers