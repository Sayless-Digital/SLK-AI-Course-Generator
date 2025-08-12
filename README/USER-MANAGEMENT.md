# User Management System

## Overview

The User Management System provides comprehensive control over user accounts, subscriptions, and plan management. Admins can view detailed user information, modify plans, cancel subscriptions, extend access, and track user activity.

## Features

### 🔍 **User Overview**
- **Complete User List**: View all users with their current plan status
- **Advanced Search**: Search by name, email, plan type, or plan name
- **Real-time Status**: See active/inactive subscription status
- **Plan Information**: Display current plan details and pricing

### 👤 **User Details**
- **Basic Information**: Name, email, member since date
- **Current Plan**: Plan name, price, and billing period
- **Subscription History**: Complete subscription records
- **Activity Tracking**: Number of courses created

### ⚙️ **Plan Management**

#### **Update User Plan**
- Change user's plan to any available plan (Free, Monthly, Yearly)
- Automatic subscription record creation
- Reason tracking for plan changes
- Admin notes for internal reference

#### **Cancel Subscription**
- Immediately cancel user's subscription
- Set user to free plan
- Maintain audit trail with reasons
- Admin notes for documentation

#### **Extend Subscription**
- Add days to existing subscription
- Flexible extension periods (1-365 days)
- Reason tracking for extensions
- Admin notes for internal reference

## How to Access

1. **Login as Admin**: Use admin credentials
2. **Navigate to Admin Panel**: Go to `/admin`
3. **Click "Users"**: Access the user management interface

## User Table Columns

### **User Column**
- User's full name
- Email address
- Member since date

### **Plan Column**
- Plan icon (Free/Monthly/Yearly)
- Plan name and price
- Visual plan type indicators

### **Status Column**
- **Free**: Secondary badge
- **Active**: Default badge (paid users)
- **No Active Subscription**: Destructive badge (paid users without active subscription)

### **Subscription Column**
- Payment method used
- Subscription creation date
- Subscription status

### **Actions Column**
- **⋮ Menu**: Dropdown menu with all available actions:
  - **👁️ View Details**: Open detailed user information
  - **✏️ Change Plan**: Change user's plan
  - **⏰ Extend Subscription**: Extend subscription (paid users only)
  - **❌ Cancel Subscription**: Cancel subscription (paid users only)

## Action Menu

### **⋮ Actions Dropdown**
Click the three-dot menu (⋮) next to any user to access all available actions:

### **👁️ View Details**
Opens a comprehensive dialog with three tabs:

#### **Basic Info Tab**
- User's full name and email
- Current plan details (name, price, period)
- Member since date
- Account creation information

#### **Subscription Tab**
- Subscription ID and payment method
- Start date and current status
- Active/inactive status indicator
- Complete subscription history

#### **Activity Tab**
- Total courses created by user
- Usage statistics
- Activity tracking

### **✏️ Update Plan**
- **Plan Selection**: Choose from available plans
- **Reason Field**: Document why plan is being changed
- **Admin Notes**: Internal notes for reference
- **Confirmation**: Review changes before applying

### **⏰ Extend Subscription**
- **Extension Days**: Set number of days (1-365)
- **Reason Field**: Document extension reason
- **Admin Notes**: Internal documentation
- **Validation**: Ensure positive number of days

### **❌ Cancel Subscription**
- **Warning Message**: Clear indication of consequences
- **Reason Field**: Document cancellation reason
- **Admin Notes**: Internal documentation
- **Confirmation**: Final confirmation before cancellation

## API Endpoints

### **GET `/api/getusers`**
Returns enhanced user data including:
- User information
- Current subscription details
- Plan information
- Subscription history

### **POST `/api/update-user-plan`**
Updates user's plan:
- `userId`: User ID
- `newPlanType`: New plan type
- `reason`: Reason for change
- `adminNotes`: Admin notes

### **POST `/api/cancel-user-subscription`**
Cancels user subscription:
- `userId`: User ID
- `reason`: Cancellation reason
- `adminNotes`: Admin notes

### **POST `/api/extend-user-subscription`**
Extends subscription:
- `userId`: User ID
- `extensionDays`: Number of days to extend
- `reason`: Extension reason
- `adminNotes`: Admin notes

### **GET `/api/user/:userId`**
Returns detailed user information:
- Complete user profile
- Subscription history
- Course activity
- Plan details

## Data Flow

### **1. User Data Fetching**
- Fetches users with subscription data
- Includes plan settings for reference
- Enhances user objects with plan information

### **2. Plan Management**
- Validates plan changes against available plans
- Creates audit trail for all changes
- Updates user plan and subscription records

### **3. Subscription Tracking**
- Maintains complete subscription history
- Tracks admin-initiated changes
- Records reasons and notes for all actions

## Best Practices

### **Plan Changes**
- Always document reasons for plan changes
- Use admin notes for internal tracking
- Review user activity before making changes
- Consider impact on user experience

### **Subscription Management**
- Provide clear reasons for cancellations
- Use extensions for customer service
- Maintain audit trail for compliance
- Document all admin actions

### **Data Management**
- Regularly refresh user data
- Monitor subscription status
- Track user activity patterns
- Maintain accurate plan information

## Security Features

### **Access Control**
- Admin-only access to user management
- Secure API endpoints
- Input validation for all forms
- Audit trail for all actions

### **Data Protection**
- Secure user data handling
- Protected subscription information
- Encrypted communication
- Access logging

## Troubleshooting

### **Common Issues**

1. **User Not Found**
   - Verify user ID is correct
   - Check if user exists in database
   - Refresh user list

2. **Plan Update Fails**
   - Verify plan type exists
   - Check database connectivity
   - Review error logs

3. **Subscription Issues**
   - Verify subscription status
   - Check payment method
   - Review subscription history

### **Debug Steps**

1. **Check Console Logs**
   - Review browser console for errors
   - Check server logs for API errors
   - Verify network requests

2. **Validate Data**
   - Confirm user data is loaded
   - Verify plan settings are available
   - Check subscription records

3. **Test API Endpoints**
   - Test endpoints directly
   - Verify request/response format
   - Check authentication

## Future Enhancements

### **Planned Features**
- Bulk user operations
- Advanced filtering options
- Export user data
- Automated notifications
- Usage analytics
- Payment history tracking

### **Monitoring**
- User activity tracking
- Subscription conversion rates
- Plan change analytics
- Customer support integration

## Support

For issues with the User Management System:
1. Check admin access permissions
2. Verify database connectivity
3. Review API endpoint responses
4. Check server logs for errors
5. Test with different user accounts 