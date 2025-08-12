# Admin Endpoints - PostgreSQL Server

## Overview
This document lists all the admin endpoints that have been added to the PostgreSQL server (`server/server-prisma.js` and `api/index.js`) to support the admin panel functionality.

## Dashboard Endpoints

### `/api/dashboard` (POST)
- **Purpose**: Get dashboard statistics and data
- **Response**: Returns user counts, course counts, revenue data, and admin information
- **Data**: `{ users, courses, total, sum, paid, videoType, textType, free, admin }`

## User Management Endpoints

### `/api/getusers` (GET)
- **Purpose**: Get all users for admin panel
- **Response**: Array of all users

### `/api/getpaid` (GET)
- **Purpose**: Get all paid users (non-free types)
- **Response**: Array of paid users

### `/api/getadmins` (GET)
- **Purpose**: Get all admins and users who are not admins
- **Response**: `{ users, admins }`

### `/api/addadmin` (POST)
- **Purpose**: Add a user as an admin
- **Body**: `{ email }`
- **Response**: Success message

### `/api/removeadmin` (POST)
- **Purpose**: Remove admin privileges from a user
- **Body**: `{ email }`
- **Response**: Success message

## Course Management Endpoints

### `/api/getcourses` (GET)
- **Purpose**: Get all courses with user information
- **Response**: Array of courses with user data

## Contact Management Endpoints

### `/api/getcontact` (GET)
- **Purpose**: Get all contact submissions
- **Response**: Array of contact entries

## Blog Management Endpoints

### `/api/getblogs` (GET)
- **Purpose**: Get all blogs for admin panel
- **Response**: Array of all blogs

### `/api/createblog` (POST)
- **Purpose**: Create a new blog post
- **Body**: `{ title, excerpt, content, image, category, tags }`
- **Response**: Success message

### `/api/deleteblogs` (POST)
- **Purpose**: Delete a blog post
- **Body**: `{ id }`
- **Response**: Success message

### `/api/updateblogs` (POST)
- **Purpose**: Update blog properties (popular/featured)
- **Body**: `{ id, type, value }`
- **Response**: Success message

## Policy Management Endpoints

### `/api/saveadmin` (POST)
- **Purpose**: Save admin policies (terms, privacy, cancel, refund, billing)
- **Body**: `{ data, type }`
- **Response**: Success message

### `/api/policies` (GET)
- **Purpose**: Get all admin policies
- **Response**: Array of admin records with policy data

## Testing Results
All endpoints have been tested and are working correctly:
- ✅ Dashboard data loading
- ✅ User management
- ✅ Admin management
- ✅ Contact management
- ✅ Blog management
- ✅ Policy management

## Usage
These endpoints are used by the admin panel pages:
- `AdminDashboard.tsx` - Uses `/api/dashboard`
- `AdminUsers.tsx` - Uses `/api/getusers`
- `AdminCourses.tsx` - Uses `/api/getcourses`
- `AdminContacts.tsx` - Uses `/api/getcontact`
- `AdminBlogs.tsx` - Uses `/api/getblogs`, `/api/createblog`, `/api/deleteblogs`, `/api/updateblogs`
- `AdminAdmins.tsx` - Uses `/api/getadmins`, `/api/addadmin`, `/api/removeadmin`
- Policy pages - Use `/api/saveadmin`, `/api/policies`

## Database Schema
All endpoints work with the existing Prisma schema:
- `User` model for user management
- `Admin` model for admin management
- `Course` model for course management
- `Contact` model for contact management
- `Blog` model for blog management 