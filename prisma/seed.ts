import { PrismaClient, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.userTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding the database...');

  // Create users
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD as string, 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL as string,
      passwordHash: adminPassword,
      fullName: process.env.ADMIN_FULL_NAME as string,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john@splane.com',
      passwordHash: userPassword,
      fullName: 'John Doe',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@splane.com',
      passwordHash: userPassword,
      fullName: 'Jane Smith',
    },
  });

  console.log('Created users');

  // Create a project
  const projectOne = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesign the company website with new branding',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ownerId: admin.id,
    },
  });

  const projectTwo = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Develop a mobile app for iOS and Android',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      ownerId: admin.id,
    },
  });

  console.log('Created projects');

  // Create tasks for project one
  const taskOne = await prisma.task.create({
    data: {
      title: 'Design homepage mockup',
      description: 'Create a mockup for the new homepage design',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: TaskStatus.TODO,
      priority: 2,
      projectId: projectOne.id,
    },
  });

  const taskTwo = await prisma.task.create({
    data: {
      title: 'Implement responsive layout',
      description: 'Make the website responsive for all devices',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: TaskStatus.TODO,
      priority: 1,
      projectId: projectOne.id,
    },
  });

  // Create tasks for project two
  const taskThree = await prisma.task.create({
    data: {
      title: 'Design UI/UX for mobile app',
      description: 'Create a modern UI/UX design for the mobile app',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: TaskStatus.TODO,
      priority: 3,
      projectId: projectTwo.id,
    },
  });

  console.log('Created tasks');

  // Assign tasks to users
  await prisma.userTask.create({
    data: {
      userId: user1.id,
      taskId: taskOne.id,
    },
  });

  await prisma.userTask.create({
    data: {
      userId: user2.id,
      taskId: taskTwo.id,
    },
  });

  await prisma.userTask.create({
    data: {
      userId: user1.id,
      taskId: taskThree.id,
    },
  });

  console.log('Assigned tasks to users');

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });