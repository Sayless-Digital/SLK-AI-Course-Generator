import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedPlanSettings() {
  try {
    console.log('Seeding plan settings...');

    // Default plan settings with functional limits
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

    // Clear existing plan settings
    await prisma.planSettings.deleteMany();

    // Create new plan settings
    for (const plan of defaultPlans) {
      await prisma.planSettings.create({
        data: plan
      });
      console.log(`Created plan: ${plan.name}`);
    }

    console.log('Plan settings seeded successfully!');
  } catch (error) {
    console.error('Error seeding plan settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPlanSettings(); 