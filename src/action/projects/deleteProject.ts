'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

type DeleteProjectResult = {
  success: boolean;
  message: string;
  error?: string;
};

export async function deleteProject(projectId: string | number): Promise<DeleteProjectResult> {
  try {
    // Convertir projectId en nombre si c'est une chaîne
    const projectIdNumber = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;

    if (isNaN(projectIdNumber)) {
      return {
        success: false,
        message: 'ID de projet invalide',
        error: 'INVALID_ID',
      };
    }

    // Vérifier que l'utilisateur est authentifié
    const userId = await requireAuth();
    if (!userId) {
      return {
        success: false,
        message: 'Vous devez être connecté pour supprimer un projet',
        error: 'UNAUTHORIZED',
      };
    }

    // Récupérer le projet pour vérifier le propriétaire
    const project = await prisma.project.findUnique({
      where: { id: projectIdNumber },
    });

    if (!project) {
      return {
        success: false,
        message: 'Projet non trouvé',
        error: 'NOT_FOUND',
      };
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    if (project.ownerId !== userId) {
      return {
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce projet',
        error: 'FORBIDDEN',
      };
    }

    // Utiliser une transaction pour garantir l'intégrité des données
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer d'abord les associations userTask pour toutes les tâches du projet
      await tx.userTask.deleteMany({
        where: {
          task: {
            projectId: projectIdNumber,
          },
        },
      });

      // 2. Supprimer toutes les tâches associées au projet
      await tx.task.deleteMany({
        where: {
          projectId: projectIdNumber,
        },
      });

      // 3. Supprimer le projet lui-même
      await tx.project.delete({
        where: {
          id: projectIdNumber,
        },
      });
    });

    // Invalider le cache pour forcer un rechargement des données
    revalidatePath('/dashboard/projects');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Projet supprimé avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    
    return {
      success: false,
      message: 'Une erreur est survenue lors de la suppression du projet',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    };
  }
}