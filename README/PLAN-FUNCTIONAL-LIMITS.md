# Plan Functional Limits System

## Overview

The Plan Functional Limits System allows you to configure not just the display text of pricing plan features, but also the actual functional limits and capabilities that each plan provides to users. This gives you complete control over what users can actually do based on their subscription level.

## Features You Can Configure

### 1. Course Generation Limits
- **Max Sub-Topics**: Number of sub-topics users can add to their courses
- **Max Main Topics**: Number of main topics (4 or 8) users can generate

### 2. Feature Access Toggles
- **Unlimited Courses**: Whether users can create unlimited courses
- **AI Teacher Chat**: Access to AI teacher chat functionality
- **Video Courses**: Ability to create video-based courses
- **Theory Courses**: Ability to create theory-based courses
- **Image Courses**: Ability to create image-based courses

### 3. Available Course Types
- **Text & Image Course**: Traditional course format
- **Video & Text Course**: Video-enhanced course format

### 4. Available Languages
- Configure which of the 37+ supported languages are available for each plan
- Languages include: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Bengali, Dutch, Swedish, Norwegian, Danish, Finnish, Polish, Czech, Hungarian, Romanian, Bulgarian, Croatian, Slovak, Slovenian, Estonian, Latvian, Lithuanian, Greek, Hebrew, Turkish, Thai, Vietnamese, Indonesian, Malay, Filipino, Swahili

## How to Access the Admin Interface

1. **Login as Admin**: Use admin credentials (`admin@myslk.online` / `password`)
2. **Navigate to Admin Panel**: Go to `/admin` in your application
3. **Access Plan Settings**: Click on "Plan Settings" in the admin sidebar

## Admin Interface Sections

### Basic Settings
- **Plan Name**: Display name for the plan
- **Price**: Cost of the plan
- **Billing Period**: Duration (forever, monthly, yearly, weekly, daily)

### Functional Limits
- **Course Generation**: Configure max sub-topics and main topics
- **Feature Access**: Toggle switches for various features

### Available Course Types
- Checkboxes to enable/disable course types for each plan

### Available Languages
- Grid of checkboxes to select which languages are available

### Display Features
- Text fields to customize the feature descriptions shown to users

## Default Plan Configurations

### Free Plan
- **Max Sub-Topics**: 5
- **Max Topics**: 4
- **Course Types**: Text & Image Course only
- **Languages**: English only
- **Features**: Basic access with limitations

### Monthly Plan
- **Max Sub-Topics**: 10
- **Max Topics**: 8
- **Course Types**: Text & Image Course + Video & Text Course
- **Languages**: 23+ languages
- **Features**: Full access to all features

### Yearly Plan
- **Max Sub-Topics**: 10
- **Max Topics**: 8
- **Course Types**: Text & Image Course + Video & Text Course
- **Languages**: 23+ languages
- **Features**: Full access to all features

## How It Works in the Application

### 1. User Authentication
When a user logs in, their plan type is stored in session storage.

### 2. Plan Limits Fetching
The application fetches the user's plan limits from the `/api/user-plan-limits` endpoint.

### 3. Dynamic UI Updates
Based on the user's plan limits:
- Available course types are filtered
- Language options are limited
- Topic limits are enforced
- Feature access is controlled

### 4. Real-time Enforcement
- Users cannot exceed their sub-topic limits
- Course type selection is restricted
- Language selection is filtered
- Feature access is validated

## API Endpoints

### GET `/api/plan-settings`
Returns all plan configurations including functional limits.

### POST `/api/plan-settings`
Updates plan settings including functional limits.

### POST `/api/user-plan-limits`
Returns the functional limits for a specific user based on their plan.

## Database Schema

The `PlanSettings` table includes these new fields:

```sql
-- Functional limits
maxSubtopics     Int     @default(5)
maxTopics        Int     @default(4)
courseTypes      String[] @default(["Text & Image Course"])
languages        String[] @default(["English"])
unlimitedCourses Boolean @default(false)
aiTeacherChat    Boolean @default(true)
videoCourses     Boolean @default(false)
theoryCourses    Boolean @default(true)
imageCourses     Boolean @default(true)
```

## Migration and Setup

### 1. Database Migration
The database schema has been updated to include functional limits. Run:
```bash
npx prisma migrate dev --name add-plan-functional-limits
```

### 2. Seed Default Data
Populate the database with default plan settings:
```bash
node scripts/seed-plan-settings.js
```

### 3. Restart Server
Restart your server to ensure all changes are loaded.

## Best Practices

### 1. Plan Differentiation
- Ensure clear differentiation between plans
- Use functional limits to create value tiers
- Keep free plan limited but useful

### 2. User Experience
- Provide clear feedback when limits are reached
- Show upgrade prompts at appropriate times
- Maintain consistent UI across all plans

### 3. Testing
- Test each plan type thoroughly
- Verify limits are properly enforced
- Check that upgrades work correctly

## Troubleshooting

### Common Issues

1. **Limits Not Applied**: Ensure the user plan limits API is being called correctly
2. **UI Not Updating**: Check that the plan limits are being fetched on component mount
3. **Database Errors**: Verify the migration was applied successfully

### Debug Steps

1. Check browser console for API errors
2. Verify user plan type in session storage
3. Test API endpoints directly
4. Check database for plan settings

## Future Enhancements

### Potential Additions
- Course creation limits per month
- Storage limits for course content
- Export/import functionality limits
- Advanced AI features access
- Priority support access

### Monitoring
- Track feature usage by plan
- Monitor upgrade conversion rates
- Analyze user behavior patterns

## Support

For issues or questions about the Plan Functional Limits System:
1. Check the admin interface for configuration errors
2. Verify database migrations are applied
3. Test API endpoints directly
4. Review server logs for errors 