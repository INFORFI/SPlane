'use server';

import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

export default async function changeTaskStatus(taskId: string | number, status: string) {
  try {
    // Convert taskId from string to number
    const taskIdNumber = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;

    // Convert status string to TaskStatus enum
    const taskStatus = status as TaskStatus;

    // Update task status in database
    const updatedTask = await prisma.task.update({
      where: {
        id: taskIdNumber,
      },
      data: {
        status: taskStatus,
      },
    });

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { success: false, error: 'Failed to update task status' };
  }
}
