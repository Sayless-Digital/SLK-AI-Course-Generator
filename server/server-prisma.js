// IMPORT
import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import gis from 'g-i-s';
import youtubesearchapi from 'youtube-search-api';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { createApi } from 'unsplash-js';
import showdown from 'showdown';
import axios from 'axios';
import Stripe from 'stripe';
import Flutterwave from 'flutterwave-node-v3';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize services that need config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
let flw;
try {
  flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
} catch (error) {
  console.log('Flutterwave not configured, payment features will be disabled');
  flw = null;
}

//INITIALIZE
const app = express();
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const PORT = process.env.PORT || 3001;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const unsplash = createApi({ accessKey: process.env.UNSPLASH_ACCESS_KEY });

//REQUEST

//SIGNUP
app.post('/api/signup', async (req, res) => {
    const { email, mName, password, type } = req.body;

    try {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.json({ success: false, message: 'User with this email already exists' });
            }
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                mName,
                password,
                type
            }
        });

        res.json({ success: true, message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//LOGIN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password !== password) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        res.json({ success: true, message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SOCIAL LOGIN/SIGNUP
app.post('/api/social', async (req, res) => {
    const { email, name } = req.body;
    let mName = name;
    let password = '';
    let type = 'free';

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            const userCount = await prisma.user.count();
            if (userCount > 0) {
                const newUser = await prisma.user.create({
                    data: { email, mName, password, type }
                });
                res.json({ success: true, message: 'Account created successfully', user: newUser });
            } else {
                const newUser = await prisma.user.create({
                    data: { email, mName, password, type: 'forever' }
                });
                const newAdmin = await prisma.admin.create({
                    data: { email, mName, type: 'main' }
                });
                res.json({ success: true, message: 'Account created successfully', user: newUser });
            }
        } else {
            return res.json({ success: true, message: 'Login successful', user });
        }
    } catch (error) {
        console.error('Social login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET USERS
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                courses: true,
                subscriptions: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//DASHBOARD
app.post('/api/dashboard', async (req, res) => {
    try {
        const users = await prisma.user.count();
        const courses = await prisma.course.count();
        const admin = await prisma.admin.findFirst({
            where: { type: 'main' }
        });
        const total = admin?.total || 0;
        
        // Count paid users (non-free types)
        const paidUsers = await prisma.user.count({
            where: {
                type: {
                    not: 'free'
                }
            }
        });
        
        const freeUsers = users - paidUsers;
        
        // Count video courses
        const videoType = await prisma.course.count({
            where: {
                type: 'video & text course'
            }
        });
        
        // Calculate revenue (simplified - you may need to adjust based on your pricing)
        const monthlyUsers = await prisma.user.count({
            where: { type: 'monthly' }
        });
        const yearlyUsers = await prisma.user.count({
            where: { type: 'yearly' }
        });
        
        const monthCost = monthlyUsers * 9; // Assuming $9/month
        const yearCost = yearlyUsers * 99; // Assuming $99/year
        const sum = monthCost + yearCost;
        
        res.json({ 
            users, 
            courses, 
            total, 
            sum, 
            paid: paidUsers, 
            videoType, 
            textType: courses - videoType, 
            free: freeUsers, 
            admin 
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET USERS (for admin panel)
app.get('/api/getusers', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET COURSES (for admin panel)
app.get('/api/getcourses', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                user: true
            }
        });
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET PAID USERS
app.get('/api/getpaid', async (req, res) => {
    try {
        const paidUsers = await prisma.user.findMany({
            where: {
                type: {
                    not: 'free'
                }
            }
        });
        res.json(paidUsers);
    } catch (error) {
        console.error('Get paid users error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET ADMINS
app.get('/api/getadmins', async (req, res) => {
    try {
        const admins = await prisma.admin.findMany();
        const adminEmails = admins.map(admin => admin.email);
        
        const users = await prisma.user.findMany({
            where: {
                email: {
                    notIn: adminEmails
                }
            }
        });
        
        res.json({ users, admins });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//ADD ADMIN
app.post('/api/addadmin', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Check if user has subscription
        const subscription = await prisma.subscription.findFirst({
            where: { userId: user.id }
        });
        
        if (!subscription) {
            // Update user type to forever if no subscription
            await prisma.user.update({
                where: { email },
                data: { type: 'forever' }
            });
        }
        
        // Create admin
        await prisma.admin.create({
            data: {
                email: user.email,
                mName: user.mName,
                type: 'no'
            }
        });
        
        res.json({ success: true, message: 'Admin added successfully' });
    } catch (error) {
        console.error('Add admin error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//REMOVE ADMIN
app.post('/api/removeadmin', async (req, res) => {
    const { email } = req.body;
    try {
        await prisma.admin.deleteMany({
            where: { email }
        });
        
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (user && user.type === 'forever') {
            await prisma.user.update({
                where: { email },
                data: { type: 'free' }
            });
        }
        
        res.json({ success: true, message: 'Admin removed successfully' });
    } catch (error) {
        console.error('Remove admin error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE COURSE
app.post('/api/courses', async (req, res) => {
    const { userId, content, type, mainTopic, photo } = req.body;

    try {
        const course = await prisma.course.create({
            data: {
                userId,
                content,
                type,
                mainTopic,
                photo
            },
            include: {
                user: true
            }
        });

        res.json({ success: true, course });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET COURSES
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                user: true,
                notes: true,
                exams: true,
                languages: true
            }
        });
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET COURSES BY USER
app.get('/api/courses/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const courses = await prisma.course.findMany({
            where: { userId },
            include: {
                notes: true,
                exams: true,
                languages: true
            }
        });
        res.json(courses);
    } catch (error) {
        console.error('Get user courses error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//UPDATE COURSE
app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const course = await prisma.course.update({
            where: { id },
            data: updateData,
            include: {
                user: true
            }
        });

        res.json({ success: true, course });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//DELETE COURSE
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.course.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE SUBSCRIPTION
app.post('/api/subscriptions', async (req, res) => {
    const { userId, subscription, subscriberId, plan, method } = req.body;

    try {
        const subscriptionRecord = await prisma.subscription.create({
            data: {
                userId,
                subscription,
                subscriberId,
                plan,
                method
            },
            include: {
                user: true
            }
        });

        res.json({ success: true, subscription: subscriptionRecord });
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET SUBSCRIPTIONS
app.get('/api/subscriptions', async (req, res) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            include: {
                user: true
            }
        });
        res.json(subscriptions);
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE CONTACT
app.post('/api/contacts', async (req, res) => {
    const { fname, lname, email, phone, msg, userId } = req.body;

    try {
        const contact = await prisma.contact.create({
            data: {
                fname,
                lname,
                email,
                phone: phone ? parseInt(phone) : null,
                msg,
                userId
            }
        });

        res.json({ success: true, contact });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET CONTACTS
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany({
            include: {
                user: true
            }
        });
        res.json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET CONTACTS (for admin panel)
app.get('/api/getcontact', async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany();
        res.json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SAVE ADMIN
app.post('/api/saveadmin', async (req, res) => {
    const { data, type } = req.body;
    try {
        const updateData = {};
        if (type === 'terms') {
            updateData.terms = data;
        } else if (type === 'privacy') {
            updateData.privacy = data;
        } else if (type === 'cancel') {
            updateData.cancel = data;
        } else if (type === 'refund') {
            updateData.refund = data;
        } else if (type === 'billing') {
            updateData.billing = data;
        }

        await prisma.admin.updateMany({
            where: { type: 'main' },
            data: updateData
        });

        res.json({ success: true, message: 'Saved successfully' });
    } catch (error) {
        console.error('Save admin error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET POLICIES
app.get('/api/policies', async (req, res) => {
    try {
        const admins = await prisma.admin.findMany();
        res.json(admins);
    } catch (error) {
        console.error('Get policies error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE NOTES
app.post('/api/notes', async (req, res) => {
    const { courseId, notes, userId } = req.body;

    try {
        const note = await prisma.notes.create({
            data: {
                courseId,
                notes,
                userId
            },
            include: {
                course: true,
                user: true
            }
        });

        res.json({ success: true, note });
    } catch (error) {
        console.error('Create notes error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET NOTES
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await prisma.notes.findMany({
            include: {
                course: true,
                user: true
            }
        });
        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE EXAM
app.post('/api/exams', async (req, res) => {
    const { courseId, exam, marks, passed, userId } = req.body;

    try {
        const examRecord = await prisma.exam.create({
            data: {
                courseId,
                exam,
                marks,
                passed,
                userId
            },
            include: {
                course: true,
                user: true
            }
        });

        res.json({ success: true, exam: examRecord });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET EXAMS
app.get('/api/exams', async (req, res) => {
    try {
        const exams = await prisma.exam.findMany({
            include: {
                course: true,
                user: true
            }
        });
        res.json(exams);
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE LANGUAGE
app.post('/api/languages', async (req, res) => {
    const { courseId, lang } = req.body;

    try {
        const language = await prisma.language.create({
            data: {
                courseId,
                lang
            },
            include: {
                course: true
            }
        });

        res.json({ success: true, language });
    } catch (error) {
        console.error('Create language error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET LANGUAGES
app.get('/api/languages', async (req, res) => {
    try {
        const languages = await prisma.language.findMany({
            include: {
                course: true
            }
        });
        res.json(languages);
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE BLOG
app.post('/api/blogs', async (req, res) => {
    const { title, excerpt, category, tags, content, image, popular, featured } = req.body;

    try {
        const blog = await prisma.blog.create({
            data: {
                title,
                excerpt,
                category,
                tags,
                content,
                image: Buffer.from(image, 'base64'),
                popular: popular || false,
                featured: featured || false
            }
        });

        res.json({ success: true, blog });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET BLOGS
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await prisma.blog.findMany();
        res.json(blogs);
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE Blog
app.post('/api/createblog', async (req, res) => {
    try {
        const { title, excerpt, content, image, category, tags } = req.body;
        const buffer = Buffer.from(image.split(',')[1], 'base64');
        
        const blog = await prisma.blog.create({
            data: {
                title,
                excerpt,
                content,
                image: buffer,
                category,
                tags
            }
        });
        
        res.json({ success: true, message: 'Blog created successfully' });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//DELETE Blog
app.post('/api/deleteblogs', async (req, res) => {
    try {
        const { id } = req.body;
        await prisma.blog.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//UPDATE Blog
app.post('/api/updateblogs', async (req, res) => {
    try {
        const { id, type, value } = req.body;
        const booleanValue = value === 'true';
        
        const updateData = {};
        if (type === 'popular') {
            updateData.popular = booleanValue;
        } else if (type === 'featured') {
            updateData.featured = booleanValue;
        }
        
        await prisma.blog.update({
            where: { id },
            data: updateData
        });
        
        res.json({ success: true, message: 'Blog updated successfully' });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET Blog (for admin panel)
app.get('/api/getblogs', async (req, res) => {
    try {
        const blogs = await prisma.blog.findMany();
        res.json(blogs);
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CREATE ADMIN
app.post('/api/create-admin', async (req, res) => {
    const { email, mName, password } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email }
        });
        
        if (existingAdmin) {
            return res.json({ success: false, message: 'Admin with this email already exists' });
        }

        // Create admin account
        const newAdmin = await prisma.admin.create({
            data: {
                email,
                mName: mName || 'Admin',
                type: 'admin'
            }
        });

        // Also create a user account for login purposes
        const newUser = await prisma.user.create({
            data: {
                email,
                mName: mName || 'Admin',
                password,
                type: 'admin'
            }
        });

        res.json({ 
            success: true, 
            message: 'Admin account created successfully', 
            admin: newAdmin,
            user: newUser 
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running with Prisma' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} with Prisma`);
    console.log(`Server accessible at: http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
}); 