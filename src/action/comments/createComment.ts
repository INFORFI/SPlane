'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { CommentWithAuthor } from './getCommentsByTask';

interface CreateCommentData {
  content: string;
  taskId: number;
}

interface CreateCommentResult {
  success: boolean;
  comment?: CommentWithAuthor;
  error?: string;
}

/**
 * Crée un nouveau commentaire pour une tâche
 */
export async function createComment(data: CreateCommentData): Promise<CreateCommentResult> {
  try {
    // Vérifier l'authentification
    const userId = await requireAuth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentification requise',
      };
    }

    // Valider les données
    if (!data.content.trim()) {
      return {
        success: false,
        error: 'Le contenu du commentaire ne peut pas être vide',
      };
    }

    if (data.content.length > 1000) {
      return {
        success: false,
        error: 'Le commentaire ne peut pas dépasser 1000 caractères',
      };
    }

    // Vérifier que la tâche existe
    const taskExists = await prisma.task.findUnique({
      where: { id: data.taskId },
      select: { id: true },
    });

    if (!taskExists) {
      return {
        success: false,
        error: 'Tâche introuvable',
      };
    }

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        content: data.content.trim(),
        taskId: data.taskId,
        authorId: userId,
      },
      include: {
        author: true,
      },
    });

    return {
      success: true,
      comment,
    };
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de la création du commentaire',
    };
  }
}
