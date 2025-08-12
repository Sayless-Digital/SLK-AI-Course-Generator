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
import fileUpload from 'express-fileupload';

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
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  createParentPath: true
}));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

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
        
        // Calculate revenue using actual plan prices from database
        const planSettings = await prisma.planSettings.findMany();
        const monthlyPlan = planSettings.find(p => p.planType === 'monthly');
        const yearlyPlan = planSettings.find(p => p.planType === 'yearly');
        
        const monthlyUsers = await prisma.user.count({
            where: { type: 'monthly' }
        });
        const yearlyUsers = await prisma.user.count({
            where: { type: 'yearly' }
        });
        
        const monthCost = monthlyUsers * (monthlyPlan?.price || 9);
        const yearCost = yearlyUsers * (yearlyPlan?.price || 99);
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
        const users = await prisma.user.findMany({
            include: {
                subscriptions: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        
        // Get plan settings for reference
        const planSettings = await prisma.planSettings.findMany();
        const planMap = {};
        planSettings.forEach(plan => {
            planMap[plan.planType] = plan;
        });
        
        // Enhance user data with subscription details
        const enhancedUsers = users.map(user => {
            const currentSubscription = user.subscriptions.find(sub => sub.active);
            const planInfo = planMap[user.type] || planMap['free'];
            
            return {
                ...user,
                currentSubscription,
                planInfo: {
                    name: planInfo?.name || 'Unknown Plan',
                    price: planInfo?.price || 0,
                    period: planInfo?.period || 'forever',
                    features: planInfo?.features || []
                }
            };
        });
        
        res.json(enhancedUsers);
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

//UPDATE USER PLAN
app.post('/api/update-user-plan', async (req, res) => {
    try {
        const { userId, newPlanType, reason, adminNotes } = req.body;
        
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    where: { active: true }
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get plan settings
        const planSettings = await prisma.planSettings.findUnique({
            where: { planType: newPlanType }
        });
        
        if (!planSettings) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        
        // Deactivate current subscription if exists
        if (user.subscriptions.length > 0) {
            await prisma.subscription.updateMany({
                where: { userId, active: true },
                data: { active: false }
            });
        }
        
        // Create new subscription record for tracking
        await prisma.subscription.create({
            data: {
                userId: userId,
                subscription: `admin-change-${Date.now()}`,
                subscriberId: `admin-${Date.now()}`,
                plan: newPlanType,
                method: 'admin-change',
                active: true
            }
        });
        
        // Update user plan
        await prisma.user.update({
            where: { id: userId },
            data: { type: newPlanType }
        });
        
        res.json({ 
            success: true, 
            message: `User plan updated to ${planSettings.name}`,
            newPlan: planSettings
        });
    } catch (error) {
        console.error('Update user plan error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//CANCEL USER SUBSCRIPTION
app.post('/api/cancel-user-subscription', async (req, res) => {
    try {
        const { userId, reason, adminNotes } = req.body;
        
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    where: { active: true }
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Deactivate all active subscriptions
        if (user.subscriptions.length > 0) {
            await prisma.subscription.updateMany({
                where: { userId, active: true },
                data: { active: false }
            });
        }
        
        // Set user to free plan
        await prisma.user.update({
            where: { id: userId },
            data: { type: 'free' }
        });
        
        res.json({ 
            success: true, 
            message: 'User subscription cancelled and set to free plan'
        });
    } catch (error) {
        console.error('Cancel user subscription error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//EXTEND USER SUBSCRIPTION
app.post('/api/extend-user-subscription', async (req, res) => {
    try {
        const { userId, extensionDays, reason, adminNotes } = req.body;
        
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    where: { active: true }
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Update subscription end date if it exists
        if (user.subscriptions.length > 0) {
            const subscription = user.subscriptions[0];
            const currentEndDate = new Date(subscription.createdAt);
            const newEndDate = new Date(currentEndDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
            
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: { 
                    createdAt: newEndDate,
                    updatedAt: new Date()
                }
            });
        }
        
        res.json({ 
            success: true, 
            message: `User subscription extended by ${extensionDays} days`
        });
    } catch (error) {
        console.error('Extend user subscription error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET USER DETAILS
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                courses: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get plan settings
        const planSettings = await prisma.planSettings.findUnique({
            where: { planType: user.type }
        });
        
        const userDetails = {
            ...user,
            planInfo: planSettings || {
                name: 'Unknown Plan',
                price: 0,
                period: 'forever',
                features: []
            }
        };
        
        res.json({ success: true, user: userDetails });
    } catch (error) {
        console.error('Get user details error:', error);
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
        const { userId, page = 1, limit = 9 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let whereClause = {};
        if (userId) {
            whereClause = { userId };
        }

        const courses = await prisma.course.findMany({
            where: whereClause,
            include: {
                user: true,
                notes: true,
                exams: true,
                languages: true
            },
            skip: skip,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
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

//PROFILE UPDATE
app.post('/api/profile', async (req, res) => {
    const { email, mName, password, uid } = req.body;
    try {
        const updateData = {
            email: email,
            mName: mName
        };

        if (password && password !== '') {
            updateData.password = password;
        }

        await prisma.user.update({
            where: { id: uid },
            data: updateData
        });

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//DELETE USER
app.post('/api/deleteuser', async (req, res) => {
    const { userId } = req.body;
    try {
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET SUBSCRIPTION DETAILS
app.post('/api/subscriptiondetail', async (req, res) => {
    try {
        const { uid, email } = req.body;

        const userDetails = await prisma.subscription.findFirst({
            where: { userId: uid }
        });

        if (!userDetails) {
            return res.status(404).json({ success: false, message: 'No subscription found' });
        }

        if (userDetails.method === 'stripe') {
            const subscription = await stripe.subscriptions.retrieve(
                userDetails.subscriberId
            );
            res.json({ session: subscription, method: userDetails.method });
        } else if (userDetails.method === 'paypal') {
            const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
            const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
            const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
            const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${userDetails.subscription}`, {
                headers: {
                    'Authorization': 'Basic ' + auth,
                    'Content-Type': 'application/json'
                }
            });
            const session = await response.json();
            res.json({ session: session, method: userDetails.method });
        } else {
            // For other payment methods, return the subscription details as is
            res.json({ session: userDetails, method: userDetails.method });
        }
    } catch (error) {
        console.error('Subscription detail error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//STRIPE CANCEL SUBSCRIPTION
app.post('/api/stripecancel', async (req, res) => {
    try {
        const { id, email } = req.body;
        
        await stripe.subscriptions.cancel(id);
        
        // Update subscription status in database
        await prisma.subscription.updateMany({
            where: { subscriberId: id },
            data: { active: false }
        });
        
        // Update user type to free
        await prisma.user.updateMany({
            where: { email },
            data: { type: 'free' }
        });
        
        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Stripe cancel error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//PAYPAL CANCEL SUBSCRIPTION
app.post('/api/paypalcancel', async (req, res) => {
    try {
        const { id, email } = req.body;
        
        const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
        const PAYPAL_APP_SECRET_KEY = process.env.PAYPAL_APP_SECRET_KEY;
        const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_APP_SECRET_KEY).toString("base64");
        
        await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${id}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            }
        });
        
        // Update subscription status in database
        await prisma.subscription.updateMany({
            where: { subscription: id },
            data: { active: false }
        });
        
        // Update user type to free
        await prisma.user.updateMany({
            where: { email },
            data: { type: 'free' }
        });
        
        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('PayPal cancel error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//PAYSTACK CANCEL SUBSCRIPTION
app.post('/api/paystackcancel', async (req, res) => {
    try {
        const { code, token, email } = req.body;
        
        // Paystack cancellation logic would go here
        // This is a placeholder as Paystack API integration would need specific implementation
        
        // Update subscription status in database
        await prisma.subscription.updateMany({
            where: { subscription: code },
            data: { active: false }
        });
        
        // Update user type to free
        await prisma.user.updateMany({
            where: { email },
            data: { type: 'free' }
        });
        
        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Paystack cancel error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//FLUTTERWAVE CANCEL SUBSCRIPTION
app.post('/api/flutterwavecancel', async (req, res) => {
    try {
        const { code, token, email } = req.body;
        
        // Flutterwave cancellation logic would go here
        // This is a placeholder as Flutterwave API integration would need specific implementation
        
        // Update subscription status in database
        await prisma.subscription.updateMany({
            where: { subscription: code },
            data: { active: false }
        });
        
        // Update user type to free
        await prisma.user.updateMany({
            where: { email },
            data: { type: 'free' }
        });
        
        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Flutterwave cancel error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//RAZORPAY CANCEL SUBSCRIPTION
app.post('/api/razorpaycancel', async (req, res) => {
    try {
        const { id, email } = req.body;
        
        // Razorpay cancellation logic would go here
        // This is a placeholder as Razorpay API integration would need specific implementation
        
        // Update subscription status in database
        await prisma.subscription.updateMany({
            where: { subscription: id },
            data: { active: false }
        });
        
        // Update user type to free
        await prisma.user.updateMany({
            where: { email },
            data: { type: 'free' }
        });
        
        res.json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Razorpay cancel error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//BANK TRANSFER PAYMENT
app.post('/api/banktransfer', async (req, res) => {
    try {
        const { planId, planName, planPrice, userId, userEmail, userName, address, city, state, zipCode, country } = req.body;
        
        // Handle file upload
        if (!req.files || !req.files.receipt) {
            return res.status(400).json({ success: false, message: 'Payment receipt is required' });
        }

        const receiptFile = req.files.receipt;
        const fileName = `receipt_${userId}_${Date.now()}_${receiptFile.name}`;
        
        // Save file to uploads directory
        const uploadPath = `./uploads/receipts/${fileName}`;
        receiptFile.mv(uploadPath, async (err) => {
            if (err) {
                console.error('File upload error:', err);
                return res.status(500).json({ success: false, message: 'Failed to upload receipt' });
            }

            try {
                // Create bank transfer record
                const bankTransfer = await prisma.bankTransfer.create({
                    data: {
                        userId,
                        userEmail,
                        userName,
                        planId,
                        planName,
                        planPrice: parseFloat(planPrice),
                        receiptPath: fileName,
                        address,
                        city,
                        state,
                        zipCode,
                        country,
                        status: 'pending'
                    }
                });

                res.json({ 
                    success: true, 
                    message: 'Payment receipt submitted successfully',
                    paymentId: bankTransfer.id
                });
            } catch (dbError) {
                console.error('Database error:', dbError);
                res.status(500).json({ success: false, message: 'Failed to save payment record' });
            }
        });
    } catch (error) {
        console.error('Bank transfer error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//APPROVE BANK TRANSFER (Admin only)
app.post('/api/approve-banktransfer', async (req, res) => {
    try {
        const { paymentId, action } = req.body; // action: 'approve' or 'reject'
        
        const bankTransfer = await prisma.bankTransfer.findUnique({
            where: { id: paymentId }
        });

        if (!bankTransfer) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        if (action === 'approve') {
            // Update bank transfer status
            await prisma.bankTransfer.update({
                where: { id: paymentId },
                data: { status: 'approved' }
            });

            // Create subscription
            await prisma.subscription.create({
                data: {
                    userId: bankTransfer.userId,
                    subscription: `bank_${paymentId}`,
                    subscriberId: paymentId,
                    plan: bankTransfer.planName,
                    method: 'banktransfer',
                    active: true
                }
            });

            // Update user type
            await prisma.user.update({
                where: { id: bankTransfer.userId },
                data: { type: bankTransfer.planId }
            });

            // Send approval email (you can implement this)
            // await sendApprovalEmail(bankTransfer.userEmail, bankTransfer.planName);

            res.json({ success: true, message: 'Payment approved successfully' });
        } else if (action === 'reject') {
            // Update bank transfer status
            await prisma.bankTransfer.update({
                where: { id: paymentId },
                data: { status: 'rejected' }
            });

            // Send rejection email (you can implement this)
            // await sendRejectionEmail(bankTransfer.userEmail);

            res.json({ success: true, message: 'Payment rejected successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid action' });
        }
    } catch (error) {
        console.error('Approve bank transfer error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET PENDING BANK TRANSFERS (Admin only)
app.get('/api/pending-banktransfers', async (req, res) => {
    try {
        const pendingTransfers = await prisma.bankTransfer.findMany({
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, transfers: pendingTransfers });
    } catch (error) {
        console.error('Get pending transfers error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET ALL BANK TRANSFERS (Admin only)
app.get('/api/all-banktransfers', async (req, res) => {
    try {
        const allTransfers = await prisma.bankTransfer.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, transfers: allTransfers });
    } catch (error) {
        console.error('Get all transfers error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//UPDATE BANK TRANSFER STATUS (Admin only)
app.post('/api/update-banktransfer-status', async (req, res) => {
    try {
        const { paymentId, status } = req.body;
        
        const bankTransfer = await prisma.bankTransfer.findUnique({
            where: { id: paymentId }
        });

        if (!bankTransfer) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Update bank transfer status
        await prisma.bankTransfer.update({
            where: { id: paymentId },
            data: { status: status }
        });

        // If status is being changed to approved, create subscription
        if (status === 'approved' && bankTransfer.status !== 'approved') {
            await prisma.subscription.create({
                data: {
                    userId: bankTransfer.userId,
                    subscription: `bank_${paymentId}`,
                    subscriberId: paymentId,
                    plan: bankTransfer.planName,
                    method: 'banktransfer',
                    active: true
                }
            });

            // Update user type
            await prisma.user.update({
                where: { id: bankTransfer.userId },
                data: { type: bankTransfer.planId }
            });
        }

        // If status is being changed from approved to something else, remove subscription
        if (bankTransfer.status === 'approved' && status !== 'approved') {
            await prisma.subscription.deleteMany({
                where: { 
                    userId: bankTransfer.userId,
                    subscriberId: paymentId
                }
            });

            // Reset user type to free
            await prisma.user.update({
                where: { id: bankTransfer.userId },
                data: { type: 'free' }
            });
        }

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Update bank transfer status error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET PLAN SETTINGS
app.get('/api/plan-settings', async (req, res) => {
    try {
        // Get plans from database
        const planSettings = await prisma.planSettings.findMany();
        
        // If no plans exist in database, create default plans
        if (planSettings.length === 0) {
            const defaultPlans = [
                {
                    planType: 'free',
                    name: 'Free Plan',
                    price: 0,
                    period: 'forever',
                    features: [
                        "Generate 5 Sub-Topics",
                        "Lifetime access",
                        "Theory & Image Course",
                        "Ai Teacher Chat",
                    ],
                    // Functional limits
                    maxSubtopics: 5,
                    maxTopics: 4,
                    courseTypes: ["Text & Image Course"],
                    languages: ["English"],
                    unlimitedCourses: false,
                    aiTeacherChat: true,
                    videoCourses: false,
                    theoryCourses: true,
                    imageCourses: true
                },
                {
                    planType: 'monthly',
                    name: 'Monthly Plan',
                    price: 9,
                    period: 'monthly',
                    features: [
                        "Generate 10 Sub-Topics",
                        "1 Month Access",
                        "Theory & Image Course",
                        "Ai Teacher Chat",
                        "Course In 23+ Languages",
                        "Create Unlimited Course",
                        "Video & Theory Course",
                    ],
                    // Functional limits
                    maxSubtopics: 10,
                    maxTopics: 8,
                    courseTypes: ["Text & Image Course", "Video & Text Course"],
                    languages: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Bulgarian"],
                    unlimitedCourses: true,
                    aiTeacherChat: true,
                    videoCourses: true,
                    theoryCourses: true,
                    imageCourses: true
                },
                {
                    planType: 'yearly',
                    name: 'Yearly Plan',
                    price: 99,
                    period: 'yearly',
                    features: [
                        "Generate 10 Sub-Topics",
                        "1 Year Access",
                        "Theory & Image Course",
                        "Ai Teacher Chat",
                        "Course In 23+ Languages",
                        "Create Unlimited Course",
                        "Video & Theory Course",
                    ],
                    // Functional limits
                    maxSubtopics: 10,
                    maxTopics: 8,
                    courseTypes: ["Text & Image Course", "Video & Text Course"],
                    languages: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Bulgarian"],
                    unlimitedCourses: true,
                    aiTeacherChat: true,
                    videoCourses: true,
                    theoryCourses: true,
                    imageCourses: true
                }
            ];

            // Create default plans in database
            for (const plan of defaultPlans) {
                await prisma.planSettings.create({
                    data: plan
                });
            }

            // Return the default plans
            const plans = {
                free: defaultPlans[0],
                monthly: defaultPlans[1],
                yearly: defaultPlans[2]
            };

            res.json({ success: true, plans });
        } else {
            // Convert database plans to expected format
            const plans = {};
            planSettings.forEach(plan => {
                plans[plan.planType] = {
                    name: plan.name,
                    price: plan.price,
                    period: plan.period,
                    features: plan.features,
                    // Include functional limits
                    maxSubtopics: plan.maxSubtopics || 5,
                    maxTopics: plan.maxTopics || 4,
                    courseTypes: plan.courseTypes || ["Text & Image Course"],
                    languages: plan.languages || ["English"],
                    unlimitedCourses: plan.unlimitedCourses || false,
                    aiTeacherChat: plan.aiTeacherChat !== false, // Default to true
                    videoCourses: plan.videoCourses || false,
                    theoryCourses: plan.theoryCourses !== false, // Default to true
                    imageCourses: plan.imageCourses !== false // Default to true
                };
            });

            res.json({ success: true, plans });
        }
    } catch (error) {
        console.error('Get plan settings error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//UPDATE PLAN SETTINGS
app.post('/api/plan-settings', async (req, res) => {
    try {
        const { plans } = req.body;
        
        // Update each plan in the database
        for (const [planType, planData] of Object.entries(plans)) {
            await prisma.planSettings.upsert({
                where: { planType },
                update: {
                    name: planData.name,
                    price: planData.price,
                    period: planData.period || 'forever',
                    features: planData.features,
                    // Update functional limits
                    maxSubtopics: planData.maxSubtopics || 5,
                    maxTopics: planData.maxTopics || 4,
                    courseTypes: planData.courseTypes || ["Text & Image Course"],
                    languages: planData.languages || ["English"],
                    unlimitedCourses: planData.unlimitedCourses || false,
                    aiTeacherChat: planData.aiTeacherChat !== false,
                    videoCourses: planData.videoCourses || false,
                    theoryCourses: planData.theoryCourses !== false,
                    imageCourses: planData.imageCourses !== false
                },
                create: {
                    planType,
                    name: planData.name,
                    price: planData.price,
                    period: planData.period || 'forever',
                    features: planData.features,
                    // Create with functional limits
                    maxSubtopics: planData.maxSubtopics || 5,
                    maxTopics: planData.maxTopics || 4,
                    courseTypes: planData.courseTypes || ["Text & Image Course"],
                    languages: planData.languages || ["English"],
                    unlimitedCourses: planData.unlimitedCourses || false,
                    aiTeacherChat: planData.aiTeacherChat !== false,
                    videoCourses: planData.videoCourses || false,
                    theoryCourses: planData.theoryCourses !== false,
                    imageCourses: planData.imageCourses !== false
                }
            });
        }
        
        console.log('Updated plan settings:', plans);
        
        res.json({ success: true, message: 'Plan settings updated successfully' });
    } catch (error) {
        console.error('Update plan settings error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET USER PLAN LIMITS
app.post('/api/user-plan-limits', async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Get user's current plan
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get plan settings for user's plan type
        const planSettings = await prisma.planSettings.findUnique({
            where: { planType: user.type || 'free' }
        });
        
        if (!planSettings) {
            // Return default free plan limits
            return res.json({
                success: true,
                limits: {
                    maxSubtopics: 5,
                    maxTopics: 4,
                    courseTypes: ["Text & Image Course"],
                    languages: ["English"],
                    unlimitedCourses: false,
                    aiTeacherChat: true,
                    videoCourses: false,
                    theoryCourses: true,
                    imageCourses: true
                }
            });
        }
        
        // Return user's plan limits
        res.json({
            success: true,
            limits: {
                maxSubtopics: planSettings.maxSubtopics || 5,
                maxTopics: planSettings.maxTopics || 4,
                courseTypes: planSettings.courseTypes || ["Text & Image Course"],
                languages: planSettings.languages || ["English"],
                unlimitedCourses: planSettings.unlimitedCourses || false,
                aiTeacherChat: planSettings.aiTeacherChat !== false,
                videoCourses: planSettings.videoCourses || false,
                theoryCourses: planSettings.theoryCourses !== false,
                imageCourses: planSettings.imageCourses !== false
            }
        });
    } catch (error) {
        console.error('Get user plan limits error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET GENERAL SETTINGS
app.get('/api/general-settings', async (req, res) => {
    try {
        // For now, return default settings
        // In the future, this could be stored in a database table
        const defaultSettings = {
            siteName: 'AI Course Generator',
            siteDescription: 'Create comprehensive courses with AI assistance',
            contactEmail: 'support@aicoursegenerator.com',
            contactPhone: '+1 (555) 123-4567',
            address: '123 Main Street, Port of Spain, Trinidad and Tobago',
            bankDetails: {
                bank: 'First Citizens',
                accountNumber: '2614969',
                branch: 'Independence Square',
                accountName: 'Dallas Alejandro Ferdinand'
            }
        };

        res.json({ success: true, settings: defaultSettings });
    } catch (error) {
        console.error('Get general settings error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//UPDATE GENERAL SETTINGS
app.post('/api/general-settings', async (req, res) => {
    try {
        const { settings } = req.body;
        
        // For now, just log the updated settings
        // In the future, this could be stored in a database table
        console.log('Updated general settings:', settings);
        
        // You could add a GeneralSettings table to the database and store/update here
        // For now, we'll just return success
        
        res.json({ success: true, message: 'General settings updated successfully' });
    } catch (error) {
        console.error('Update general settings error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET DATA FROM MODEL
app.post('/api/prompt', async (req, res) => {
    try {
        const receivedData = req.body;
        const promptString = receivedData.prompt;

        // Check if API key is valid
        if (!process.env.API_KEY || process.env.API_KEY === 'your_google_generative_ai_key_here') {
            // Return mock data for testing
            const mockResponse = {
                "javascript programming": [
                    {
                        "title": "Introduction to JavaScript",
                        "subtopics": [
                            {
                                "title": "What is JavaScript",
                                "theory": "",
                                "youtube": "",
                                "image": "",
                                "done": false
                            },
                            {
                                "title": "JavaScript History",
                                "theory": "",
                                "youtube": "",
                                "image": "",
                                "done": false
                            }
                        ]
                    },
                    {
                        "title": "JavaScript Basics",
                        "subtopics": [
                            {
                                "title": "Variables and Data Types",
                                "theory": "",
                                "youtube": "",
                                "image": "",
                                "done": false
                            },
                            {
                                "title": "Functions and Scope",
                                "theory": "",
                                "youtube": "",
                                "image": "",
                                "done": false
                            }
                        ]
                    }
                ]
            };
            
            res.status(200).json({ generatedText: JSON.stringify(mockResponse) });
            return;
        }

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
        const prompt = promptString;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const generatedText = response.text();
        res.status(200).json({ generatedText });
    } catch (error) {
        console.error('Prompt generation error:', error);
        
        // Return mock data on error for testing
        const mockResponse = {
            "javascript programming": [
                {
                    "title": "Introduction to JavaScript",
                    "subtopics": [
                        {
                            "title": "What is JavaScript",
                            "theory": "",
                            "youtube": "",
                            "image": "",
                            "done": false
                        },
                        {
                            "title": "JavaScript History",
                            "theory": "",
                            "youtube": "",
                            "image": "",
                            "done": false
                        }
                    ]
                }
            ]
        };
        
        res.status(200).json({ generatedText: JSON.stringify(mockResponse) });
    }
});

//GET GENERATE THEORY
app.post('/api/generate', async (req, res) => {
    const receivedData = req.body;
    const promptString = receivedData.prompt;

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
    const prompt = promptString;

    await model.generateContent(prompt).then(result => {
        const response = result.response;
        const txt = response.text();
        const converter = new showdown.Converter();
        const markdownText = txt;
        const text = converter.makeHtml(markdownText);
        res.status(200).json({ text });
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    });
});

//CHAT
app.post('/api/chat', async (req, res) => {
    const receivedData = req.body;
    const promptString = receivedData.prompt;

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
    const prompt = promptString;

    await model.generateContent(prompt).then(result => {
        const response = result.response;
        const txt = response.text();
        const converter = new showdown.Converter();
        const markdownText = txt;
        const text = converter.makeHtml(markdownText);
        res.status(200).json({ success: true, text });
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    });
});

//GET IMAGE
app.post('/api/image', async (req, res) => {
    const receivedData = req.body;
    const promptString = receivedData.prompt;
    
    try {
        // Try to get image from Unsplash if configured
        if (process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key_here') {
            try {
                const result = await unsplash.search.getPhotos({
                    query: promptString,
                    page: 1,
                    perPage: 1,
                    orientation: 'landscape',
                });
                
                if (result.response && result.response.results && result.response.results.length > 0) {
                    const photo = result.response.results[0]?.urls?.regular || '';
                    res.status(200).json({ url: photo });
                    return;
                }
            } catch (unsplashError) {
                console.log('Unsplash error:', unsplashError);
                // Fall back to Google Image Search
            }
        }
        
        // Fallback to Google Image Search
        gis(promptString, logResults);
        function logResults(error, results) {
            if (error) {
                console.log('Error', error);
                res.status(500).json({ success: false, message: 'Image search error' });
            } else {
                res.status(200).json({ url: results[0].url });
            }
        }
    } catch (error) {
        console.log('Error in image search:', error);
        res.status(500).json({ success: false, message: 'Image search error' });
    }
});

//GET VIDEO 
app.post('/api/yt', async (req, res) => {
    try {
        const receivedData = req.body;
        const promptString = receivedData.prompt;
        const video = await youtubesearchapi.GetListByKeyword(promptString, [false], [1], [{ type: 'video' }]);
        const videoId = await video.items[0].id;
        res.status(200).json({ url: videoId });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET TRANSCRIPT 
app.post('/api/transcript', async (req, res) => {
    const receivedData = req.body;
    const promptString = receivedData.prompt;
    YoutubeTranscript.fetchTranscript(promptString).then(video => {
        res.status(200).json({ url: video });
    }).catch(error => {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    });
});

//STORE COURSE
app.post('/api/course', async (req, res) => {
    const { user, content, type, mainTopic, lang } = req.body;

    try {
        let photo = '';
        
        // Try to get image from Unsplash if configured
        if (process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key_here') {
            try {
                const result = await unsplash.search.getPhotos({
                    query: mainTopic,
                    page: 1,
                    perPage: 1,
                    orientation: 'landscape',
                });
                
                if (result.response && result.response.results && result.response.results.length > 0) {
                    photo = result.response.results[0]?.urls?.regular || '';
                }
            } catch (unsplashError) {
                console.log('Unsplash error:', unsplashError);
                // Continue without photo if Unsplash fails
            }
        }

        // Create course with Prisma
        const newCourse = await prisma.course.create({
            data: {
                userId: user,
                content,
                type,
                mainTopic,
                photo
            }
        });

        // Create language record
        await prisma.language.create({
            data: {
                courseId: newCourse.id,
                lang: lang
            }
        });

        res.json({ 
            success: true, 
            message: 'Course created successfully', 
            courseId: newCourse.id,
            completed: false
        });
    } catch (error) {
        console.log('Error creating course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//STORE COURSE SHARED
app.post('/api/courseshared', async (req, res) => {
    const { user, content, type, mainTopic } = req.body;

    try {
        let photo = '';
        
        // Try to get image from Unsplash if configured
        if (process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key_here') {
            try {
                const result = await unsplash.search.getPhotos({
                    query: mainTopic,
                    page: 1,
                    perPage: 1,
                    orientation: 'landscape',
                });
                
                if (result.response && result.response.results && result.response.results.length > 0) {
                    photo = result.response.results[0]?.urls?.regular || '';
                }
            } catch (unsplashError) {
                console.log('Unsplash error:', unsplashError);
                // Continue without photo if Unsplash fails
            }
        }

        // Create course with Prisma
        const newCourse = await prisma.course.create({
            data: {
                userId: user,
                content,
                type,
                mainTopic,
                photo
            }
        });

        res.json({ 
            success: true, 
            message: 'Course created successfully', 
            courseId: newCourse.id 
        });
    } catch (error) {
        console.log('Error creating shared course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//UPDATE COURSE
app.post('/api/update', async (req, res) => {
    const { content, courseId } = req.body;
    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { content: content }
        });
        res.json({ success: true, message: 'Course updated successfully' });
    } catch (error) {
        console.log('Error updating course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//DELETE COURSE
app.post('/api/deletecourse', async (req, res) => {
    const { courseId } = req.body;
    try {
        await prisma.course.delete({
            where: { id: courseId }
        });
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.log('Error deleting course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//FINISH COURSE
app.post('/api/finish', async (req, res) => {
    const { courseId } = req.body;
    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { 
                completed: true,
                updatedAt: new Date()
            }
        });
        res.json({ success: true, message: 'Course completed successfully' });
    } catch (error) {
        console.log('Error finishing course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//GET NOTES
app.post('/api/getnotes', async (req, res) => {
    const { course } = req.body;
    try {
        const existingNotes = await prisma.notes.findFirst({
            where: { courseId: course }
        });
        
        if (existingNotes) {
            res.json({ success: true, message: existingNotes.notes });
        } else {
            res.json({ success: false, message: '' });
        }
    } catch (error) {
        console.log('Error getting notes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SAVE NOTES
app.post('/api/savenotes', async (req, res) => {
    const { course, notes } = req.body;
    try {
        const existingNotes = await prisma.notes.findFirst({
            where: { courseId: course }
        });

        if (existingNotes) {
            await prisma.notes.update({
                where: { id: existingNotes.id },
                data: { notes: notes }
            });
            res.json({ success: true, message: 'Notes updated successfully' });
        } else {
            await prisma.notes.create({
                data: { 
                    courseId: course, 
                    notes: notes,
                    userId: 'cme91g7990000mqyg4eto97lk' // Use admin user as fallback
                }
            });
            res.json({ success: true, message: 'Notes created successfully' });
        }
    } catch (error) {
        console.log('Error saving notes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//SEND CERTIFICATE
app.post('/api/sendcertificate', async (req, res) => {
    const { html, email } = req.body;

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

    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Certification of completion',
        html: html
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            res.status(500).json({ success: false, message: 'Failed to send email' });
        } else {
            res.json({ success: true, message: 'Email sent successfully' });
        }
    });
});

//GET PROMPT SETTINGS
app.get('/api/prompt-settings', async (req, res) => {
    try {
        console.log('GET /api/prompt-settings called');
        
        // For now, return default settings
        // In a real implementation, you'd store these in a database
        const defaultPrompts = {
            courseStructure: {
                name: 'Course Structure Generation',
                description: 'Generates the initial course structure with topics and subtopics',
                template: 'Strictly in {language}, Generate a list of Strict {topicCount} topics and any number sub topic for each topic for main title {mainTopic}, everything in single line. Those {topicCount} topics should Strictly include these topics :- {subtopics}. Strictly Keep theory, youtube, image field empty. Generate in the form of JSON in this format.',
                variables: ['{language}', '{topicCount}', '{mainTopic}', '{subtopics}'],
                enabled: true
            },
            theoryContent: {
                name: 'Theory Content Generation',
                description: 'Generates detailed explanations for subtopics with examples',
                template: 'Strictly in {language}, Explain me about this subtopic of {mainTopic} with examples :- {subtopic}. Please Strictly Don\'t Give Additional Resources And Images.',
                variables: ['{language}', '{mainTopic}', '{subtopic}'],
                enabled: true
            },
            imageGeneration: {
                name: 'Image Generation',
                description: 'Generates relevant images for subtopics',
                template: 'Example of {subtopic} in {mainTopic}',
                variables: ['{subtopic}', '{mainTopic}'],
                enabled: true
            },
            quizGeneration: {
                name: 'Quiz/Exam Generation',
                description: 'Generates MCQ quizzes based on course content',
                template: 'Strictly in {language}, generate a strictly 10 question MCQ quiz on title {mainTopic} based on each topics :- {subtopicsString}, Atleast One question per topic. Add options A, B, C, D and only one correct answer.',
                variables: ['{language}', '{mainTopic}', '{subtopicsString}'],
                enabled: true
            },
            videoSearch: {
                name: 'Video Search Query',
                description: 'Generates search queries for finding relevant videos',
                template: '{subtopic} {mainTopic} in {language}',
                variables: ['{subtopic}', '{mainTopic}', '{language}'],
                enabled: true
            }
        };

        const defaultAiModel = {
            model: 'gemini-2.0-flash',
            temperature: 0.7,
            maxTokens: 4000,
            safetySettings: {
                harassment: 'BLOCK_MEDIUM_AND_ABOVE',
                hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
                sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
                dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        };

        console.log('Sending response');
        res.json({ 
            success: true, 
            prompts: defaultPrompts,
            aiModel: defaultAiModel
        });
    } catch (error) {
        console.log('Error in prompt-settings:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//SAVE PROMPT SETTINGS
app.post('/api/prompt-settings', async (req, res) => {
    try {
        const { prompts, aiModel } = req.body;
        
        // In a real implementation, you'd save these to a database
        // For now, we'll just log them and return success
        console.log('Saving prompt settings:', { prompts, aiModel });
        
        // You could save to a file or database here
        // For example, using fs.writeFileSync for file storage:
        // const fs = require('fs');
        // fs.writeFileSync('./prompt-settings.json', JSON.stringify({ prompts, aiModel }));
        
        res.json({ success: true, message: 'Prompt settings saved successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

//GET RESULT
app.post('/api/getmyresult', async (req, res) => {
    const { courseId } = req.body;
    try {
        console.log('Getting result for course:', courseId);
        
        const existingNotes = await prisma.exam.findFirst({ 
            where: { courseId: courseId } 
        });
        const lang = await prisma.language.findFirst({ 
            where: { courseId: courseId } 
        });
        
        if (existingNotes) {
            if (lang) {
                res.json({ success: true, message: existingNotes.passed, lang: lang.lang });
            } else {
                res.json({ success: true, message: existingNotes.passed, lang: 'English' });
            }
        } else {
            if (lang) {
                res.json({ success: false, message: false, lang: lang.lang });
            } else {
                res.json({ success: false, message: false, lang: 'English' });
            }
        }

    } catch (error) {
        console.log('Error in getmyresult:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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