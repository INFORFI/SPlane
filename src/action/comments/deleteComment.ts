'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface DeleteCommentResult {
  success: boolean;
  error?: string;
}

/**
 * Supprime un commentaire (seulement par son auteur ou un administrateur)
 */
export async function deleteComment(commentId: number): Promise<DeleteCommentResult> {
  try {
    // Vérifier l'authentification
    const userId = await requireAuth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentification requise',
      };
    }

    // Récupérer le commentaire avec les informations de l'auteur
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) {
      return {
        success: false,
        error: 'Commentaire introuvable',
      };
    }

    // Récupérer les informations de l'utilisateur actuel
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser) {
      return {
        success: false,
        error: 'Utilisateur introuvable',
      };
    }

    // Vérifier les permissions (auteur du commentaire ou administrateur)
    const canDelete = comment.authorId === userId || currentUser.role === 'ADMIN';

    if (!canDelete) {
      return {
        success: false,
        error: "Vous n'avez pas le droit de supprimer ce commentaire",
      };
    }

    // Supprimer le commentaire
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de la suppression du commentaire',
    };
  }
}
