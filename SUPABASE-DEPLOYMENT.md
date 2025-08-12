# 🚀 AiCourse - Supabase Deployment Guide

Your AiCourse project is now connected to **Supabase PostgreSQL** and ready for cloud deployment!

## ✅ **Current Status**

- **Database**: ✅ Connected to Supabase PostgreSQL
- **Schema**: ✅ All tables created and synced
- **API**: ✅ Working with cloud database
- **Frontend**: ✅ Ready for deployment

## 🌐 **Your Supabase Database**

- **Project URL**: `https://hpedivtpmdjnwetftiqr.supabase.co`
- **Database**: PostgreSQL with all tables created
- **Connection**: Direct connection working
- **Pooler**: Available for better performance

## 🛠️ **Available Connection Strings**

### Direct Connection (Current)
```
postgresql://postgres:Fs09rn2q1I1xcvUM@db.hpedivtpmdjnwetftiqr.supabase.co:5432/postgres
```

### Connection Pooler (For Production)
```
postgresql://postgres.hpedivtpmdjnwetftiqr:Fs09rn2q1I1xcvUM@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

## 🚀 **Deployment Options**

### **Option 1: Vercel (Recommended)**

#### Frontend Deployment:
1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set Environment Variables**:
   ```bash
   DATABASE_URL="postgresql://postgres:Fs09rn2q1I1xcvUM@db.hpedivtpmdjnwetftiqr.supabase.co:5432/postgres"
   API_KEY="your_google_generative_ai_key"
   EMAIL="your_email@gmail.com"
   PASSWORD="your_email_password"
   STRIPE_SECRET_KEY="your_stripe_key"
   FLUTTERWAVE_PUBLIC_KEY="your_flutterwave_key"
   FLUTTERWAVE_SECRET_KEY="your_flutterwave_secret"
   UNSPLASH_ACCESS_KEY="your_unsplash_key"
   ```

#### Backend as API Routes:
- Create `api/` folder in your project
- Move server logic to Vercel serverless functions
- Use connection pooler for better performance

### **Option 2: Railway**

1. **Connect GitHub repo to Railway**
2. **Set Environment Variables** (same as above)
3. **Deploy automatically**

### **Option 3: Render**

1. **Connect GitHub repo to Render**
2. **Set Environment Variables**
3. **Deploy as Web Service**

## 🔧 **Environment Variables for Production**

```bash
# Database
DATABASE_URL="postgresql://postgres:Fs09rn2q1I1xcvUM@db.hpedivtpmdjnwetftiqr.supabase.co:5432/postgres"

# AI Services
API_KEY="your_google_generative_ai_key"

# Email
EMAIL="your_email@gmail.com"
PASSWORD="your_email_password"

# Payment Services
STRIPE_SECRET_KEY="your_stripe_secret_key"
FLUTTERWAVE_PUBLIC_KEY="your_flutterwave_public_key"
FLUTTERWAVE_SECRET_KEY="your_flutterwave_secret_key"

# External APIs
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"

# Server
PORT=3001
```

## 📊 **Database Tables Created**

Your Supabase database now contains:

- **users** - User accounts and profiles
- **admins** - Admin user management
- **courses** - Course content and metadata
- **subscriptions** - Payment subscriptions
- **contacts** - Contact form submissions
- **notes** - Course notes
- **exams** - Course exams
- **languages** - Course languages
- **blogs** - Blog posts with images

## 🔍 **Database Management**

### **Supabase Dashboard**
- Visit: `https://supabase.com/dashboard/project/hpedivtpmdjnwetftiqr`
- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **API**: Auto-generated REST API

### **Prisma Studio** (Local Development)
```bash
npm run db:studio
```

### **Switch Database Connections**
```bash
# Switch to direct connection (development)
npm run db:switch-direct

# Switch to connection pooler (production)
npm run db:switch-pooler
```

## 🚀 **Quick Deployment Steps**

### **For Vercel:**
1. ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```
2. Connect repo to Vercel
3. Add environment variables
4. Deploy!

### **For Railway:**
1. Push to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy automatically

## 🔒 **Security Notes**

- ✅ **SSL**: Supabase uses SSL by default
- ✅ **Connection Pooling**: Available for production
- ✅ **Row Level Security**: Can be enabled in Supabase
- ✅ **Backup**: Automatic daily backups

## 📈 **Performance Optimization**

### **Use Connection Pooler for Production:**
```bash
DATABASE_URL="postgresql://postgres.hpedivtpmdjnwetftiqr:Fs09rn2q1I1xcvUM@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
```

### **Benefits:**
- Better connection management
- Reduced connection overhead
- Improved performance under load

## 🎯 **Next Steps**

1. **Deploy to your chosen platform**
2. **Set up custom domain**
3. **Configure SSL certificates**
4. **Set up monitoring**
5. **Enable Supabase real-time features**

## 📞 **Support**

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs

---

**🎉 Your AiCourse project is now cloud-ready with Supabase!** 