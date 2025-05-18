'use server';

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Project, UserTask, Role, UserSettings } from '@prisma/client';

/**
 * Type représentant les données de l'utilisateur connecté
 */
export type UserLoggedIn = {
  id: number;
  email: string;
  role: Role;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  projects: Project[];
  userTasks: UserTask[];
  settings: UserSettings;
};

/**
 * Récupère les données de l'utilisateur connecté
 * @returns Les données de l'utilisateur connecté ou null si l'utilisateur n'est pas connecté
 */
export async function getUserLoggedIn() {
  const userId = await requireAuth();

  if (!userId) {
    return null;
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      createdAt: true,
      updatedAt: true,
      projects: true,
      userTasks: true,
      passwordHash: false,
      settings: true,
    },
  });

  if (!userData) {
    return null;
  }

  return userData as UserLoggedIn;
}
