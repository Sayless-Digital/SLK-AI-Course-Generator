# 🎓 SLK AI Course Generator

A modern, full-stack AI-powered course generation platform built with React, TypeScript, Prisma, and PostgreSQL.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Sayless-Digital/SLK-AI-Course-Generator.git
cd SLK-AI-Course-Generator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Set up database
npm run db:push

# Start development servers
npm run server:prisma  # Backend
npm run dev            # Frontend
```

## 📚 Documentation

All documentation is organized in the [`README/`](./README/) folder and uses `.mdc` format for optimal Cursor AI integration:

### **📖 [Main Documentation](./README/MAIN.mdc)**
Complete project overview, setup instructions, and API documentation.

### **🔄 [Prisma Migration Guide](./README/PRISMA-MIGRATION.mdc)**
Detailed guide for the MongoDB to Prisma + PostgreSQL migration.

### **🚀 [Vercel Deployment Guide](./README/VERCEL-DEPLOYMENT.mdc)**
Step-by-step instructions for deploying to Vercel.

### **🗄️ [Supabase Deployment Guide](./README/SUPABASE-DEPLOYMENT.mdc)**
Complete guide for Supabase database setup and configuration.

### **✅ [Deployment Checklist](./README/DEPLOYMENT-CHECKLIST.mdc)**
Quick checklist for successful deployment.

### **🔑 [API Keys Setup](./README/API-KEYS-SETUP.mdc)**
Configuration status and API keys management.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini AI
- **Deployment**: Vercel
- **Payments**: Stripe, Flutterwave

## 🌟 Features

- **AI-Powered Course Generation** - Generate courses using Google's Generative AI
- **Modern Tech Stack** - React 18, TypeScript, Vite, Tailwind CSS
- **Type-Safe Database** - Prisma ORM with PostgreSQL
- **Cloud-Ready** - Supabase integration for production deployment
- **Payment Integration** - Stripe and Flutterwave support
- **Rich Text Editor** - TipTap editor for course content
- **PWA Support** - Progressive Web App capabilities
- **Responsive Design** - Mobile-first approach with modern UI

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start frontend development server
npm run server:prisma    # Start backend with Prisma
npm run server           # Start backend with MongoDB (legacy)

# Database Management
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma client
npm run db:switch-direct # Use direct connection
npm run db:switch-pooler # Use connection pooler

# Build & Deploy
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🌐 Live Demo

Once deployed, your application will be available at:
```
https://slk-ai-course-generator.vercel.app
```

## 📊 Project Status

- ✅ **Core Functionality**: Complete
- ✅ **Database**: Prisma + PostgreSQL (Supabase)
- ✅ **AI Integration**: Google Gemini AI
- ✅ **Deployment**: Vercel ready
- ✅ **Documentation**: Comprehensive guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [README/](./README/) folder
- **Issues**: [GitHub Issues](https://github.com/Sayless-Digital/SLK-AI-Course-Generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sayless-Digital/SLK-AI-Course-Generator/discussions)

## 🙏 Acknowledgments

- [Prisma](https://www.prisma.io/) - Type-safe database ORM
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Headless UI components

---

**Built with ❤️ by Sayless Digital**

---

## 📁 Documentation Structure

```
README/
├── MAIN.mdc                    # Complete project documentation
├── PRISMA-MIGRATION.mdc        # Database migration guide
├── VERCEL-DEPLOYMENT.mdc       # Vercel deployment instructions
├── SUPABASE-DEPLOYMENT.mdc     # Supabase setup guide
├── DEPLOYMENT-CHECKLIST.mdc    # Deployment checklist
├── API-KEYS-SETUP.mdc         # API keys configuration
└── Documentation/             # Additional documentation files
    └── documentation.html     # HTML documentation
``` 