'use server';

import { ActivityType, TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

type CreateTaskInput = {
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  priority: number;
  projectId: string | number;
  assignees?: number[];
};

export const createTask = async (input: CreateTaskInput) => {
  try {
    const userId = await requireAuth();

    if (!userId) {
      return null;
    }

    // Convert projectId to number if it's a string
    const projectId =
      typeof input.projectId === 'string' ? parseInt(input.projectId) : input.projectId;

    // Create the task
    const newTask = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description || null,
        deadline: input.deadline ? new Date(input.deadline) : null,
        status: input.status,
        priority: Number(input.priority),
        projectId: projectId,
      },
    });

    // Connect assignees if provided
    if (input.assignees && input.assignees.length > 0) {
      await prisma.userTask.createMany({
        data: input.assignees.map(userId => ({
          taskId: newTask.id,
          userId,
        })),
      });
    }

    // Create activity
    await prisma.activity.create({
      data: {
        userId: userId,
        content: `Création de la tâche ${input.title}`,
        entityId: newTask.id,
        entityType: 'task',
        type: ActivityType.TASK_CREATED,
      },
    });

    return newTask;
  } catch (error) {
    console.error(error);
    return null;
  }
};
