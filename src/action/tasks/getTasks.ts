'use server';

import { prisma } from '@/lib/prisma';
import { Task, Project, User, UserTask } from '@prisma/client';

// Type pour les tâches avec projets et utilisateurs associés
export type TaskWithProject = Task & {
  project: Project;
  userTasks: (UserTask & {
    user: User;
  })[];
};

/**
 * Récupère toutes les tâches avec leurs projets associés et utilisateurs assignés
 */
export async function getTasks(): Promise<TaskWithProject[]> {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: true,
        userTasks: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc', // Trier par date limite croissante
      },
    });

    return tasks;
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    return [];
  }
}

/**
 * Récupère les tâches pour un projet spécifique
 */
export async function getTasksByProject(projectId: number): Promise<TaskWithProject[]> {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        project: true,
        userTasks: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    return tasks;
  } catch (error) {
    console.error(`Erreur lors de la récupération des tâches du projet ${projectId}:`, error);
    return [];
  }
}

/**
 * Récupère les tâches assignées à un utilisateur spécifique
 */
export async function getTasksByUser(userId: number): Promise<TaskWithProject[]> {
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
      orderBy: {
        deadline: 'asc',
      },
    });

    return tasks;
  } catch (error) {
    console.error(`Erreur lors de la récupération des tâches de l'utilisateur ${userId}:`, error);
    return [];
  }
}

/**
 * Récupère les tâches dont la date limite est comprise dans un intervalle
 */
export async function getTasksByDateRange(
  startDate: Date,
  endDate: Date
): Promise<TaskWithProject[]> {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        deadline: {
          gte: startDate,
          lte: endDate,
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
      orderBy: {
        deadline: 'asc',
      },
    });

    return tasks;
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches par plage de dates:', error);
    return [];
  }
}
