# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## API Integration

The login page is configured to use the admin login API:
- **Endpoint**: `POST /api/auth/admin-login`
- **Default credentials**: 
  - Email: `admin@brokeradda.com`
  - Password: `admin123`

## Features Implemented

✅ **Login Page Design**
- Split-screen layout matching the provided design
- Left side: Branding with illustration and "Easy To Use Dashboard" text
- Right side: Clean login form with email/password fields
- API integration with error handling and loading states

✅ **Dashboard Design**
- Matches the first screenshot exactly
- Statistics cards with proper icons and metrics
- Charts section (placeholder for actual charts)
- Site/Project performance table
- Quick settings with toggle switches
- Recent activity feed

✅ **Sidebar Navigation**
- Dark theme with red accents
- SVG icons for all menu items
- Proper menu structure:
  1. Dashboard
  2. Brokers
  3. Properties / Sites
  4. Leads / Visitors
  5. Region Management
  6. Announcements

✅ **Layout Components**
- Professional header with notifications
- User profile section
- Responsive design
- Consistent styling

## Usage

1. Set up your environment variables
2. Start your backend API server on port 5000
3. Run `npm run dev` to start the Next.js development server
4. Visit `http://localhost:3000` to see the login page
5. Use the provided credentials to log in and access the dashboard
