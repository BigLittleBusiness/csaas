# UpliftCS Admin Dashboard

## Overview

The admin dashboard provides comprehensive user management, organization settings, and analytics for UpliftCS administrators. Built with React 19, Vite, and Tailwind CSS, it follows the UpliftCS brand guidelines with a clean, modern interface.

## Features

### 1. Admin Dashboard (`/admin/dashboard`)
- **Statistics Overview**: Total users, active users, customers, and current plan
- **Recent Activity**: New user registrations and recent logins
- **Organization Details**: Subscription info, usage limits, and status

### 2. User Management (`/admin/users`)
- **User List**: View all users in the organization with search functionality
- **User Details**: Edit user information, roles, and status
- **Role Management**: Assign roles (admin, user, viewer)
- **User Deactivation**: Soft delete users (deactivate accounts)
- **Status Tracking**: View last login and account creation dates

### 3. Organization Settings (`/admin/organization`)
- **Organization Details**: Update name and billing email
- **Current Subscription**: View plan tier, usage, and limits
- **Plan Management**: Switch between Starter, Growth, and Enterprise plans
- **Usage Metrics**: Track users and customers against plan limits

### 4. Authentication & Authorization
- **Login Page**: UpliftCS-branded login interface
- **Protected Routes**: Role-based access control
- **JWT Authentication**: Secure token-based authentication
- **Auto-redirect**: Redirect based on user role after login

## UI Components

All components follow UpliftCS brand guidelines:

### Colors
- **Deep Navy** (#0F172A): Primary text and headers
- **Vibrant Teal** (#14B8A6): Primary actions and CTAs
- **Ocean Blue** (#0891B2): Hover states and accents
- **Light Teal** (#5EEAD4): Backgrounds and highlights
- **Slate Gray** (#64748B): Secondary text
- **Cool Gray** (#F1F5F9): Backgrounds

### Typography
- **Display Font**: Poppins (600, 700) for headlines
- **Body Font**: Inter (400, 500, 600, 700) for UI text
- **Monospace**: JetBrains Mono for code/IDs

### Components
- **Button**: Primary, secondary, ghost, destructive, outline variants
- **Card**: White background with subtle shadows
- **Input**: Teal focus ring with rounded corners
- **Badge**: Status indicators with color variants
- **Table**: Clean data tables with hover states
- **Select**: Styled dropdowns with Teal focus

## API Integration

The dashboard integrates with the following backend endpoints:

### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Deactivate user

### Organization Management
- `GET /api/admin/organization` - Get organization details
- `PUT /api/admin/organization` - Update organization
- `GET /api/admin/organization/stats` - Get statistics
- `GET /api/admin/organization/plans` - Get available plans
- `PUT /api/admin/organization/plan` - Update plan tier

### Dashboard Stats
- `GET /api/admin/stats` - Get comprehensive admin statistics

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      # Main admin dashboard
│   │   │   ├── UserManagement.jsx      # User list and search
│   │   │   ├── UserDetail.jsx          # User edit page
│   │   │   └── OrganizationSettings.jsx # Org settings and plans
│   │   ├── auth/
│   │   │   ├── Login.jsx               # Login page
│   │   │   └── ProtectedRoute.jsx      # Route protection HOC
│   │   ├── ui/
│   │   │   ├── button.jsx              # Button component
│   │   │   ├── card.jsx                # Card component
│   │   │   ├── input.jsx               # Input component
│   │   │   ├── label.jsx               # Label component
│   │   │   ├── badge.jsx               # Badge component
│   │   │   ├── table.jsx               # Table component
│   │   │   └── select.jsx              # Select component
│   │   └── Sidebar.jsx                 # Navigation sidebar
│   ├── services/
│   │   └── api.js                      # API service layer
│   ├── lib/
│   │   └── utils.js                    # Utility functions
│   ├── App.jsx                         # Main app with routing
│   ├── App.css                         # Global styles
│   └── main.jsx                        # Entry point
├── index.html                          # HTML template
├── vite.config.js                      # Vite configuration
├── tailwind.config.js                  # Tailwind with UpliftCS colors
└── package.json                        # Dependencies
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Usage

### Logging In
1. Navigate to `/login`
2. Enter email and password
3. Upon successful login, admins are redirected to `/admin/dashboard`
4. Regular users are redirected to `/dashboard`

### Managing Users
1. Navigate to `/admin/users` (admin only)
2. Search for users using the search bar
3. Click on a user to edit their details
4. Update name, role, or status
5. Deactivate users if needed

### Managing Organization
1. Navigate to `/admin/organization` (admin only)
2. Update organization name and billing email
3. View current plan and usage metrics
4. Switch plans by clicking "Switch to [plan]" button

### Role-Based Access
- **Admin**: Full access to all features including admin dashboard
- **User**: Access to main dashboard, customers, and playbooks
- **Viewer**: Read-only access to main features

## Security

- JWT tokens stored in localStorage
- Protected routes check authentication and role
- Admin routes require admin role
- API requests include Authorization header
- Token refresh mechanism for expired tokens

## Responsive Design

The dashboard is fully responsive:
- **Desktop**: Full sidebar with labels
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu with backdrop

## Next Steps

1. **Testing**: Add unit and integration tests
2. **Error Handling**: Implement comprehensive error boundaries
3. **Loading States**: Add skeleton loaders for better UX
4. **Notifications**: Enhance toast notifications with more feedback
5. **Analytics**: Add charts and graphs for usage trends
6. **Audit Log**: Track admin actions for compliance
7. **Bulk Operations**: Add bulk user management features
8. **Export**: Add data export functionality (CSV, PDF)

## Support

For issues or questions, please refer to the main project README or contact the development team.
