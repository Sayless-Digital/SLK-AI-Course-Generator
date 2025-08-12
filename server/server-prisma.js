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
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

//INITIALIZE
const app = express();
app.use(cors());
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running with Prisma' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with Prisma`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
}); 