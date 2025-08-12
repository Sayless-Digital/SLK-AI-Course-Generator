# 🎓 SLK AI Course Generator

A modern, full-stack AI-powered course generation platform built with React, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

- **AI-Powered Course Generation** - Generate courses using Google's Generative AI
- **Modern Tech Stack** - React 18, TypeScript, Vite, Tailwind CSS
- **Type-Safe Database** - Prisma ORM with PostgreSQL
- **Cloud-Ready** - Supabase integration for production deployment
- **Payment Integration** - Stripe and Flutterwave support
- **Rich Text Editor** - TipTap editor for course content
- **PWA Support** - Progressive Web App capabilities
- **Responsive Design** - Mobile-first approach with modern UI

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **TipTap** - Rich text editor
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Supabase** - Cloud database platform

### AI & Services
- **Google Generative AI** - Course content generation
- **Stripe** - Payment processing
- **Flutterwave** - African payment gateway
- **Nodemailer** - Email functionality

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sayless-Digital/SLK-AI-Course-Generator.git
   cd SLK-AI-Course-Generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```bash
   # Database
   DATABASE_URL="your_supabase_connection_string"
   
   # AI Services
   API_KEY="your_google_generative_ai_key"
   
   # Email
   EMAIL="your_email@gmail.com"
   PASSWORD="your_email_password"
   
   # Payment Services
   STRIPE_SECRET_KEY="your_stripe_key"
   FLUTTERWAVE_PUBLIC_KEY="your_flutterwave_key"
   FLUTTERWAVE_SECRET_KEY="your_flutterwave_secret"
   
   # External APIs
   UNSPLASH_ACCESS_KEY="your_unsplash_key"
   
   # Server
   PORT=3001
   ```

4. **Set up database**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Generate Prisma client
   npm run db:generate
   ```

5. **Start development servers**
   ```bash
   # Start backend server
   npm run server:prisma
   
   # In another terminal, start frontend
   npm run dev
   ```

## 🚀 Available Scripts

### Development
```bash
npm run dev              # Start frontend development server
npm run server:prisma    # Start backend with Prisma
npm run server           # Start backend with MongoDB (legacy)
```

### Database Management
```bash
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma client
npm run db:switch-direct # Use direct connection
npm run db:switch-pooler # Use connection pooler
```

### Build & Deploy
```bash
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login

### Courses
- `POST /api/courses` - Create course
- `GET /api/courses` - Get all courses
- `GET /api/courses/user/:userId` - Get user's courses
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get all subscriptions

### Content Management
- `POST /api/notes` - Create note
- `GET /api/notes` - Get all notes
- `POST /api/exams` - Create exam
- `GET /api/exams` - Get all exams
- `POST /api/blogs` - Create blog
- `GET /api/blogs` - Get all blogs

## 🗄️ Database Schema

The application uses a relational database with the following main entities:

- **Users** - User accounts and profiles
- **Courses** - Course content and metadata
- **Subscriptions** - Payment subscriptions
- **Notes** - Course notes
- **Exams** - Course exams
- **Blogs** - Blog posts
- **Contacts** - Contact form submissions

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy as web service

See [SUPABASE-DEPLOYMENT.md](./SUPABASE-DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |
| `API_KEY` | Google Generative AI API key | Yes |
| `EMAIL` | Gmail address for notifications | Yes |
| `PASSWORD` | Gmail app password | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key | No |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave secret key | No |
| `UNSPLASH_ACCESS_KEY` | Unsplash API key | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](./docs) folder
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