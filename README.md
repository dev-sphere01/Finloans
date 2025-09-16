# Authentication System with Role-Based Permissions

A comprehensive authentication system built with Node.js/Express backend and React frontend, featuring JWT authentication, role-based access control, and user management.

## Features

### 🔐 Authentication
- JWT-based authentication with 8-hour token expiration
- Secure password hashing with bcrypt
- Account lockout after failed login attempts
- Password reset functionality
- Auto-logout on token expiration

### 👥 User Management
- Create, read, update, and deactivate users
- User profile management
- Account unlock functionality for admins
- Force password change for new users

### 🛡️ Role-Based Access Control
- Dynamic role creation and management
- Granular permission system (create, read, update, delete, manage)
- Resource-based permissions
- Runtime role assignment

### 📊 Audit Logging
- Comprehensive activity tracking
- Login/logout monitoring
- User and role modification logs
- Failed authentication attempts

### 🎨 Modern UI
- Responsive React interface
- Role-based navigation
- Real-time notifications
- Professional dashboard design

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **express-rate-limit** for API protection

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Icons** for UI icons

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to API directory:**
   ```bash
   cd api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install missing dependency:**
   ```bash
   npm install express-validator
   ```

4. **Configure environment variables:**
   ```bash
   # Copy and edit the .env file
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/auth_system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=8h
   BCRYPT_ROUNDS=12
   ```

5. **Start MongoDB:**
   Make sure MongoDB is running on your system.

6. **Seed the database:**
   ```bash
   npm run seed
   ```
   This creates default roles and admin user.

7. **Start the server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to UI directory:**
   ```bash
   cd ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Default Login Credentials

After running the database seeder, you can use these credentials:

### Super Admin
- **Username:** `admin`
- **Password:** `Admin123!`

### Manager
- **Username:** `manager1`
- **Password:** `Manager123!`

### Employee
- **Username:** `employee1`
- **Password:** `Employee123!`

> **Note:** All users must change their password on first login.

## API Endpoints

### Authentication
- `POST /api/auth/Login` - User login
- `PUT /api/auth/ChangePassword` - Change password
- `PUT /api/auth/Forgotpassword` - Reset password
- `POST /api/auth/logout` - Logout (optional)
- `GET /api/auth/verify` - Verify token

### User Management
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `POST /api/users/:id/unlock` - Unlock user account

### Role Management
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Deactivate role
- `POST /api/roles/:id/permissions` - Add permission to role
- `DELETE /api/roles/:id/permissions` - Remove permission from role
- `GET /api/roles/permissions/available` - Get available permissions

## Permission System

The system uses a resource-action based permission model:

### Resources
- `users` - User management
- `roles` - Role management
- `dashboard` - Dashboard access
- `reports` - Report generation
- `settings` - System settings
- `audit` - Audit log access

### Actions
- `create` - Create new resources
- `read` - View resources
- `update` - Modify resources
- `delete` - Remove resources
- `manage` - Full control (includes all actions)

### Example Permission Structure
```json
{
  "resource": "users",
  "actions": ["create", "read", "update", "delete"]
}
```

## Security Features

### Password Security
- Minimum 6 characters with complexity requirements
- Bcrypt hashing with configurable rounds
- Force password change for new users
- Password history prevention

### Account Security
- Account lockout after 5 failed attempts
- 2-hour lockout duration
- IP address tracking
- User agent logging

### API Security
- JWT token validation
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS configuration
- Request/response logging

## Development

### Project Structure
```
├── api/                    # Backend API
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middleware
│   ├── models/            # Database models
│   ├── services/          # Business logic
│   └── app.js             # Express app setup
├── ui/                    # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md
```

### Adding New Permissions

1. **Update available permissions** in `api/controllers/roleController.js`:
   ```javascript
   const availablePermissions = {
     newResource: {
       description: 'New Resource Management',
       actions: ['create', 'read', 'update', 'delete']
     }
   };
   ```

2. **Add middleware checks** in your routes:
   ```javascript
   router.get('/new-resource', 
     authenticateToken, 
     authorize('newResource', 'read'),
     controller
   );
   ```

3. **Update frontend navigation** in `ui/src/layouts/components/menuConfig.jsx`

### Adding New Roles

Roles can be created dynamically through the admin interface or programmatically:

```javascript
const newRole = new Role({
  name: 'Custom Role',
  description: 'Custom role description',
  permissions: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'reports', actions: ['read', 'create'] }
  ]
});
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12
```

### Build Frontend
```bash
cd ui
npm run build
```

### PM2 Process Manager (Recommended)
```bash
npm install -g pm2
pm2 start api/app.js --name "auth-api"
pm2 startup
pm2 save
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints and examples

---

**Note:** This is a comprehensive authentication system designed for production use. Make sure to:
- Change default passwords
- Use strong JWT secrets
- Configure proper CORS settings
- Set up SSL/TLS in production
- Regular security audits
- Monitor audit logs