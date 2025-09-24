'use server';

import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

interface NotifyTaskOwnerOptions {
  taskId: number;
  newStatus: TaskStatus;
  changedBy: number; // ID de l'utilisateur qui a fait le changement
}

interface TaskOwnerNotificationData {
  taskTitle: string;
  newStatus: TaskStatus;
  projectName: string;
  ownerSettings: {
    notifications_task_status: boolean;
  } | null;
  isOwner: boolean; // true si le propriétaire est celui qui a fait le changement
}

/**
 * Récupère les informations nécessaires pour notifier le propriétaire d'une tâche
 */
export async function getTaskOwnerNotificationData(
  options: NotifyTaskOwnerOptions
): Promise<TaskOwnerNotificationData | null> {
  try {
    const { taskId, newStatus, changedBy } = options;

    // Récupérer la tâche avec le projet et les informations du créateur
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            owner: {
              include: {
                settings: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      console.error(`Tâche avec l'ID ${taskId} introuvable`);
      return null;
    }

    const taskOwner = task.project.owner;
    const isOwner = taskOwner.id === changedBy;

    // Si le propriétaire est celui qui a fait le changement, pas besoin de notifier
    if (isOwner) {
      return {
        taskTitle: task.title,
        newStatus,
        projectName: task.project.name,
        ownerSettings: taskOwner.settings,
        isOwner: true,
      };
    }

    // Vérifier si le propriétaire a activé les notifications de tâches
    if (!taskOwner.settings?.notifications_task_status) {
      console.info(
        `Propriétaire de la tâche ${taskId} n'a pas activé les notifications de statut`
      );
      return {
        taskTitle: task.title,
        newStatus,
        projectName: task.project.name,
        ownerSettings: taskOwner.settings,
        isOwner: false,
      };
    }

    return {
      taskTitle: task.title,
      newStatus,
      projectName: task.project.name,
      ownerSettings: taskOwner.settings,
      isOwner: false,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données de notification:', error);
    return null;
  }
}

/**
 * Vérifie si une notification doit être envoyée pour ce changement de statut
 */
export function shouldNotifyTaskOwner(data: TaskOwnerNotificationData): boolean {
  // Ne pas notifier si c'est le propriétaire qui a fait le changement
  if (data.isOwner) {
    return false;
  }

  // Ne pas notifier si les notifications sont désactivées
  if (!data.ownerSettings?.notifications_task_status) {
    return false;
  }

  // Notifier pour tous les changements de statut significatifs
  return true;
}