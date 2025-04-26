'use server';

import { prisma } from '@/lib/prisma';
import { Task, Project, User, UserTask } from '@prisma/client';

// Define type for tasks with their related entities
export type TaskWithDetails = Task & {
  project: Project;
  userTasks: (UserTask & {
    user: User;
  })[];
};

/**
 * Get tasks assigned to a specific user
 */
export async function getAssignedTasks(userId: number): Promise<TaskWithDetails[]> {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userTasks: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        project: true,
        userTasks: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' }, // Highest priority first
        { deadline: 'asc' }, // Then earliest deadline
      ],
    });

    return tasks;
  } catch (error) {
    console.error(`Error fetching assigned tasks for user ${userId}:`, error);
    return [];
  }
}
