# Admin Access System

## Overview
The admin access system allows users with admin privileges to access the admin panel and manage the application.

## Admin Authentication

### Admin User Setup
- **Email**: `admin@myslk.online`
- **Password**: `password`
- **Type**: `admin` (in user table)
- **Admin Type**: `main` (in admin table)

### How Admin Access Works

1. **User Login**: User logs in with admin credentials
2. **Session Storage**: User data is stored in session storage
3. **Admin Check**: System checks if user has admin privileges
4. **Access Control**: Admin panel access is granted based on admin status

### Admin Detection Logic

The system checks for admin access in two ways:

1. **User Type Check**: If `sessionStorage.getItem('type') === 'admin'`
2. **Admin Table Check**: If user email exists in the admin table

### Admin Routes

- `/admin` - Admin Dashboard
- `/admin/users` - User Management
- `/admin/courses` - Course Management
- `/admin/paid-users` - Paid User Management
- `/admin/admins` - Admin Management
- `/admin/contacts` - Contact Management
- `/admin/blogs` - Blog Management
- `/admin/terms` - Terms Management
- `/admin/privacy` - Privacy Management
- `/admin/cancellation` - Cancellation Policy
- `/admin/refund` - Refund Policy
- `/admin/subscription-billing` - Billing Policy
- `/admin/create-blog` - Create Blog

### Admin Panel Features

- **Dashboard**: Overview of users, courses, revenue
- **User Management**: View and manage all users
- **Course Management**: View and manage all courses
- **Admin Management**: Add/remove admin privileges
- **Contact Management**: View contact submissions
- **Blog Management**: Create, edit, delete blog posts
- **Policy Management**: Update terms, privacy, and policies

## Testing Admin Access

1. **Login**: Use admin credentials (`admin@myslk.online` / `password`)
2. **Dashboard**: Should see "Admin Panel" link in sidebar
3. **Admin Panel**: Should be able to access all admin pages
4. **Data Loading**: All admin pages should load data correctly

## Security

- Admin access is checked on every admin page load
- Non-admin users are redirected to dashboard
- Admin privileges are verified against both user type and admin table
- Session-based authentication with automatic logout on session expiry 