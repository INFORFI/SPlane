"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      fullName: true,
      createdAt: true,
      updatedAt: true,
      projects: true,
      userTasks: true,
      passwordHash: false
    }
  });

  return userData;
}