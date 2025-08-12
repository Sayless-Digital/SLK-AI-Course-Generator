import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkCourses() {
  try {
    // Get all courses
    const courses = await prisma.course.findMany({
      include: {
        user: true
      }
    });

    console.log('All courses in database:');
    console.log(JSON.stringify(courses, null, 2));

    // Get the new admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@myslk.online' }
    });

    if (adminUser) {
      console.log('\nAdmin user found:', adminUser.id);
      
      // Create a sample course for the admin user
      const sampleCourse = await prisma.course.create({
        data: {
          content: JSON.stringify({
            "sample course": [{
              "title": "Introduction",
              "subtopics": [{
                "title": "Getting Started",
                "theory": "<p>Welcome to this sample course!</p>",
                "youtube": "",
                "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
                "done": false
              }]
            }]
          }),
          type: "Text & Image Course",
          mainTopic: "Sample Course",
          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
          completed: false,
          userId: adminUser.id
        }
      });

      console.log('Sample course created:', sampleCourse.id);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses(); 