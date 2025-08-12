# AiCourse - Prisma + PostgreSQL Migration

This project has been successfully migrated from MongoDB/Mongoose to PostgreSQL/Prisma for better type safety, relationships, and performance.

## 🚀 What's New

### ✅ Benefits of Prisma + PostgreSQL:
- **Type Safety**: Full TypeScript support with auto-generated types
- **Relationships**: Proper foreign keys and joins between tables
- **Schema Management**: Version-controlled database migrations
- **Better Performance**: ACID compliance and optimized queries
- **Modern ORM**: Intuitive query syntax and relationship handling

## 📊 Database Schema

### Models:
- **User**: Core user management with relationships to courses, subscriptions, etc.
- **Course**: Course content with relationships to users, notes, exams, languages
- **Subscription**: Payment subscriptions linked to users
- **Contact**: Contact form submissions
- **Notes**: Course notes with user and course relationships
- **Exam**: Course exams with user and course relationships
- **Language**: Course languages
- **Blog**: Blog posts with image storage
- **Admin**: Admin user management

### Key Relationships:
- Users can have multiple courses, subscriptions, notes, exams
- Courses belong to users and can have multiple notes, exams, languages
- All relationships use proper foreign keys with cascade deletes

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local PostgreSQL Database
```bash
npx prisma dev
```

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Generate Prisma Client
```bash
npm run db:generate
```

### 5. Start the Prisma Server
```bash
npm run server:prisma
```

### 6. Start the Frontend
```bash
npm run dev
```

## 🔧 Available Scripts

- `npm run server:prisma` - Start backend with Prisma
- `npm run server` - Start backend with MongoDB (legacy)
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:generate` - Generate Prisma client

## 🌐 API Endpoints

All endpoints now use Prisma queries:

### Users
- `POST /api/signup` - Create new user
- `POST /api/login` - User login
- `GET /api/users` - Get all users with relationships

### Courses
- `POST /api/courses` - Create course
- `GET /api/courses` - Get all courses with relationships
- `GET /api/courses/user/:userId` - Get user's courses
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get all subscriptions

### Notes & Exams
- `POST /api/notes` - Create note
- `GET /api/notes` - Get all notes
- `POST /api/exams` - Create exam
- `GET /api/exams` - Get all exams

### Contacts & Blogs
- `POST /api/contacts` - Create contact
- `GET /api/contacts` - Get all contacts
- `POST /api/blogs` - Create blog
- `GET /api/blogs` - Get all blogs

## 🔍 Database Management

### View Data with Prisma Studio
```bash
npm run db:studio
```
This opens a web interface at `http://localhost:5555` to browse and edit your data.

### Database Migrations
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

## 🚀 Deployment

### For Vercel/Railway/Render:
1. Set `DATABASE_URL` environment variable to your PostgreSQL connection string
2. Run `npm run db:push` to sync schema
3. Deploy with `npm run server:prisma`

### Environment Variables Required:
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
API_KEY="your_google_generative_ai_key"
EMAIL="your_email@gmail.com"
PASSWORD="your_email_password"
STRIPE_SECRET_KEY="your_stripe_key"
FLUTTERWAVE_PUBLIC_KEY="your_flutterwave_key"
FLUTTERWAVE_SECRET_KEY="your_flutterwave_secret"
UNSPLASH_ACCESS_KEY="your_unsplash_key"
PORT=3001
```

## 🔄 Migration from MongoDB

The original MongoDB server is still available at `server/server.js` for reference. The new Prisma server is at `server/server-prisma.js`.

### Key Changes:
- Replaced Mongoose schemas with Prisma models
- Added proper relationships between tables
- Improved type safety with TypeScript
- Better error handling and validation
- More efficient queries with joins

## 📈 Performance Improvements

- **Faster Queries**: PostgreSQL with proper indexing
- **Type Safety**: Compile-time error checking
- **Relationships**: Efficient joins instead of manual lookups
- **Migrations**: Version-controlled database changes
- **Connection Pooling**: Better resource management

## 🎯 Next Steps

1. **Add Authentication**: Implement JWT tokens
2. **Password Hashing**: Use bcrypt for secure passwords
3. **Validation**: Add Zod schemas for request validation
4. **Caching**: Implement Redis for better performance
5. **Testing**: Add unit and integration tests

---

**Status**: ✅ Successfully migrated to Prisma + PostgreSQL
**Database**: PostgreSQL with Prisma ORM
**Type Safety**: Full TypeScript support
**Relationships**: Proper foreign keys and joins 