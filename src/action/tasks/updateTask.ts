'use server';

import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

type UpdateTaskData = {
  title?: string;
  description?: string | null;
  deadline?: Date | null;
  status?: TaskStatus;
  priority?: number;
  assigneeId?: string;
};

export default async function updateTask(taskId: string | number, data: UpdateTaskData) {
  try {
    // Convert taskId from string to number if needed
    const taskIdNumber = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;

    // Prepare data for task update (excluding assigneeId which is handled separately)
    const { assigneeId, ...taskData } = data;

    // Update task in database
    const updatedTask = await prisma.task.update({
      where: {
        id: taskIdNumber,
      },
      data: taskData,
    });

    // Update user assignment if needed
    if (assigneeId !== undefined) {
      // Delete existing assignments
      await prisma.userTask.deleteMany({
        where: {
          taskId: taskIdNumber,
        },
      });

      // Create new assignment if assigneeId is provided
      if (assigneeId) {
        await prisma.userTask.create({
          data: {
            userId: parseInt(assigneeId, 10),
            taskId: taskIdNumber,
          },
        });
      }
    }

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error('Failed to update task:', error);
    return { success: false, error: 'Failed to update task' };
  }
} 