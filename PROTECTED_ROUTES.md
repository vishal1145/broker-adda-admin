# Protected Routes Implementation

This document explains the protected route system implemented in the Broker Adda Admin Panel.

## Overview

The application now has a comprehensive authentication system that protects routes and redirects users based on their authentication status.

## Components

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)

The `AuthContext` provides global authentication state management:

- **State Management**: Tracks authentication status, loading state, and token
- **Token Storage**: Stores tokens in both localStorage and cookies for security
- **Login/Logout**: Handles authentication state changes
- **Auto-redirect**: Automatically redirects authenticated users away from login page

### 2. Protected Route Component (`src/components/ProtectedRoute.tsx`)

A wrapper component that protects routes:

- **Authentication Check**: Verifies user authentication before rendering content
- **Loading State**: Shows loading spinner while checking authentication
- **Auto-redirect**: Redirects unauthenticated users to login page
- **Configurable**: Allows custom redirect destinations

### 3. Middleware (`src/middleware.ts`)

Server-side route protection:

- **Server-side Check**: Validates authentication on the server
- **Cookie-based**: Uses cookies for server-side authentication
- **Route Matching**: Protects specific routes and allows public access to others
- **Performance**: Runs before page rendering for better security

## How It Works

### Authentication Flow

1. **Initial Load**: 
   - Context checks for existing token in localStorage
   - Sets authentication state based on token presence
   - Sets cookie for server-side middleware

2. **Login Process**:
   - User submits login form
   - Token is received from API
   - Token is stored in localStorage and cookie
   - User is redirected to protected area

3. **Route Protection**:
   - Client-side: `ProtectedRoute` component checks authentication
   - Server-side: Middleware validates cookies
   - Unauthenticated users are redirected to login

4. **Logout Process**:
   - Token is removed from localStorage and cookie
   - User is redirected to login page
   - Authentication state is reset

### Protected Routes

The following routes are protected:
- `/dashboard` - Main dashboard
- `/regions` - Regions management
- `/brokers` - Brokers management
- `/brokers/[id]` - Individual broker details

### Public Routes

The following routes are public:
- `/` - Home page (redirects to login or regions)
- `/login` - Login page

## Usage

### Protecting a New Route

To protect a new route, wrap the page component with `ProtectedRoute`:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <Layout>
        {/* Your page content */}
      </Layout>
    </ProtectedRoute>
  );
}
```

### Using Authentication Context

To access authentication state in any component:

```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { isAuthenticated, isLoading, token, login, logout } = useAuth();
  
  // Use authentication state
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Authenticated content</div>;
}
```

### Adding New Protected Routes to Middleware

To add new protected routes, update the `protectedRoutes` array in `src/middleware.ts`:

```typescript
const protectedRoutes = ['/dashboard', '/regions', '/brokers', '/new-route'];
```

## Security Features

1. **Dual Storage**: Tokens stored in both localStorage and cookies
2. **Server-side Validation**: Middleware validates authentication server-side
3. **Automatic Cleanup**: Tokens are properly removed on logout
4. **Secure Cookies**: Cookies use secure and samesite attributes
5. **Route-level Protection**: Each protected route is individually wrapped

## Error Handling

- **Network Errors**: Graceful handling of authentication failures
- **Token Validation**: Proper error handling for invalid tokens
- **Loading States**: User-friendly loading indicators
- **Fallback Redirects**: Automatic redirects for edge cases

## Testing

To test the protected routes:

1. **Without Authentication**:
   - Visit any protected route directly
   - Should be redirected to login page

2. **With Authentication**:
   - Login successfully
   - Should be able to access all protected routes
   - Should be redirected away from login page

3. **Logout**:
   - Click logout button
   - Should be redirected to login page
   - Should not be able to access protected routes

## Configuration

### Token Storage Duration

The cookie expiration is set to 7 days. To change this, update the `max-age` value in the `login` function:

```typescript
document.cookie = `adminToken=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
```

### Redirect URLs

Default redirects can be changed by updating:
- `redirectTo` prop in `ProtectedRoute` component
- `router.push('/regions')` in various components
- Middleware redirect URLs

## Troubleshooting

### Common Issues

1. **Infinite Redirects**: Check that public routes are properly excluded from middleware
2. **Token Not Persisting**: Verify localStorage and cookie settings
3. **Server-side Issues**: Check middleware configuration and cookie settings
4. **Loading States**: Ensure proper loading state management in components

### Debug Mode

To debug authentication issues, check browser console for:
- Token storage/retrieval logs
- Authentication state changes
- Redirect attempts
- Cookie settings

## Future Enhancements

Potential improvements to consider:

1. **Token Refresh**: Implement automatic token refresh
2. **Role-based Access**: Add role-based route protection
3. **Session Management**: Implement session timeout
4. **Audit Logging**: Log authentication events
5. **Multi-device Support**: Handle multiple device sessions
