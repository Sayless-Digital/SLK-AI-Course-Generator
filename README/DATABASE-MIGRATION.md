# Database Migration: MongoDB to PostgreSQL

## Overview
This document outlines the migration from MongoDB to PostgreSQL for the AiCourse application.

## Changes Made

### 1. Database Configuration
- **Old**: MongoDB with mongoose
- **New**: PostgreSQL with Prisma ORM
- **Connection String**: `postgresql://postgres:W902tiolK7HkXdtc@db.hpedivtpmdjnwetftiqr.supabase.co:5432/postgres`

### 2. Server Files
- **Primary Server**: `server/server-prisma.js` (PostgreSQL)
- **Legacy Server**: `server/server.js` (MongoDB - kept for reference)
- **API Server**: `api/index.js` (PostgreSQL)

### 3. Authentication Endpoints
- **Login**: `/api/login` (changed from `/api/signin`)
- **Signup**: `/api/signup`
- **Social Login**: `/api/social`

### 4. Frontend Updates
- Updated `LoginDialog.tsx` to use `/api/login` endpoint
- Updated `SignupDialog.tsx` to use correct response format
- Changed user ID field from `_id` to `id`
- Updated session storage to use `user` instead of `userData`

### 5. Environment Variables
- Removed `MONGODB_URI`
- Kept `DATABASE_URL` for PostgreSQL connection

## Testing
All authentication endpoints have been tested and are working correctly:
- ✅ User registration
- ✅ User login
- ✅ Social login/signup
- ✅ Database connectivity

## Running the Application
```bash
# Start the PostgreSQL server
npm run server

# Or explicitly
node server/server-prisma.js
```

## Database Schema
The Prisma schema is located in `prisma/schema.prisma` and includes:
- User model with authentication fields
- Course model with relationships
- Admin model for administrative functions
- Supporting models (Notes, Exams, Subscriptions, etc.)

## Migration Status
✅ **Complete** - Application is now fully using PostgreSQL for authentication and data storage. 