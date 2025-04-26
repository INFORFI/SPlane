'use server';

import { TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

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
        priority: input.priority,
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

    return newTask;
  } catch (error) {
    console.error(error);
    return null;
  }
};
