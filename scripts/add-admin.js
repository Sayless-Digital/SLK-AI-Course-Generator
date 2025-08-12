import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function addAdmin() {
  try {
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@myslk.online',
        mName: 'Admin User',
        password: 'admin123',
        type: 'forever'
      }
    });

    // Create admin record
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@myslk.online',
        mName: 'Admin User',
        type: 'main'
      }
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@myslk.online');
    console.log('Password: admin123');
    console.log('User ID:', adminUser.id);
    console.log('Admin ID:', admin.id);

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin(); 