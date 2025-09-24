'use server';

import { prisma } from '@/lib/prisma';
import { Comment, User } from '@prisma/client';

// Type pour les commentaires avec informations de l'auteur
export type CommentWithAuthor = Comment & {
  author: User;
};

/**
 * Récupère tous les commentaires d'une tâche avec les informations de l'auteur
 */
export async function getCommentsByTask(taskId: number): Promise<CommentWithAuthor[]> {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc', // Ordre chronologique (plus anciens en premier)
      },
    });

    return comments;
  } catch (error) {
    console.error(`Erreur lors de la récupération des commentaires pour la tâche ${taskId}:`, error);
    return [];
  }
}