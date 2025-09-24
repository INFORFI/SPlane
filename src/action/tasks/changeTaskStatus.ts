'use server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityType, TaskStatus } from '@prisma/client';
import { getTaskOwnerNotificationData } from '@/action/notifications/notifyTaskOwner';

export default async function changeTaskStatus(taskId: string | number, status: string) {
  try {
    const userId = await requireAuth();

    if (!userId) {
      return null;
    }

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

    // Create activity
    if (taskStatus === TaskStatus.COMPLETED) {
      await prisma.activity.create({
        data: {
          userId: userId,
          type: ActivityType.TASK_COMPLETED,
          content: `Tâche ${updatedTask.title} terminée`,
          entityId: updatedTask.id,
          entityType: 'task',
        },
      });
    } else if (taskStatus === TaskStatus.IN_PROGRESS) {
      await prisma.activity.create({
        data: {
          userId: userId,
          type: ActivityType.TASK_STARTED,
          content: `Tâche ${updatedTask.title} démarrée`,
          entityId: updatedTask.id,
          entityType: 'task',
        },
      });
    }

    // Récupérer les données pour notification du propriétaire
    const notificationData = await getTaskOwnerNotificationData({
      taskId: taskIdNumber,
      newStatus: taskStatus,
      changedBy: userId,
    });

    return {
      success: true,
      task: updatedTask,
      notificationData // Renvoyer les données pour que le client puisse gérer la notification
    };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { success: false, error: 'Failed to update task status' };
  }
}
