// Mock @/lib/auth avant les autres imports pour éviter les erreurs avec jose
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

import { createComment } from '../createComment';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Mock de Prisma
jest.mock('@/lib/prisma', () => {
  const mockCreate = jest.fn();
  const mockFindUnique = jest.fn();

  return {
    prisma: {
      comment: {
        create: mockCreate,
      },
      task: {
        findUnique: mockFindUnique,
      },
    },
  };
});

const mockRequireAuth = jest.mocked(requireAuth);

describe('createComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock data
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    passwordHash: 'hash',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask = { id: 1 };

  const mockCreatedComment = {
    id: 1,
    content: 'Nouveau commentaire',
    taskId: 1,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockUser,
  };

  const validCommentData = {
    content: 'Nouveau commentaire',
    taskId: 1,
  };

  it('devrait créer un commentaire avec succès', async () => {
    mockRequireAuth.mockResolvedValue(1);
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
    (prisma.comment.create as jest.Mock).mockResolvedValue(mockCreatedComment);

    const result = await createComment(validCommentData);

    expect(result.success).toBe(true);
    expect(result.comment).toEqual(mockCreatedComment);
    expect(result.error).toBeUndefined();

    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true },
    });

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        content: 'Nouveau commentaire',
        taskId: 1,
        authorId: 1,
      },
      include: {
        author: true,
      },
    });
  });

  it("devrait échouer si l'utilisateur n'est pas authentifié", async () => {
    mockRequireAuth.mockResolvedValue(null);

    const result = await createComment(validCommentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentification requise');
    expect(result.comment).toBeUndefined();

    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it('devrait échouer si le contenu est vide', async () => {
    mockRequireAuth.mockResolvedValue(1);

    const emptyCommentData = {
      content: '   ', // Contenu vide avec espaces
      taskId: 1,
    };

    const result = await createComment(emptyCommentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Le contenu du commentaire ne peut pas être vide');
    expect(result.comment).toBeUndefined();

    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it('devrait échouer si le contenu dépasse 1000 caractères', async () => {
    mockRequireAuth.mockResolvedValue(1);

    const longCommentData = {
      content: 'a'.repeat(1001),
      taskId: 1,
    };

    const result = await createComment(longCommentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Le commentaire ne peut pas dépasser 1000 caractères');
    expect(result.comment).toBeUndefined();

    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it("devrait échouer si la tâche n'existe pas", async () => {
    mockRequireAuth.mockResolvedValue(1);
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await createComment(validCommentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Tâche introuvable');
    expect(result.comment).toBeUndefined();

    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it('devrait nettoyer le contenu en supprimant les espaces en trop', async () => {
    mockRequireAuth.mockResolvedValue(1);
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

    const trimmedComment = {
      ...mockCreatedComment,
      content: 'Commentaire avec espaces',
    };
    (prisma.comment.create as jest.Mock).mockResolvedValue(trimmedComment);

    const commentDataWithSpaces = {
      content: '   Commentaire avec espaces   ',
      taskId: 1,
    };

    const result = await createComment(commentDataWithSpaces);

    expect(result.success).toBe(true);
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        content: 'Commentaire avec espaces', // Contenu nettoyé
        taskId: 1,
        authorId: 1,
      },
      include: {
        author: true,
      },
    });
  });

  it("devrait retourner une erreur en cas d'échec de création", async () => {
    mockRequireAuth.mockResolvedValue(1);
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
    (prisma.comment.create as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await createComment(validCommentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Une erreur est survenue lors de la création du commentaire');
    expect(result.comment).toBeUndefined();

    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la création du commentaire:',
      expect.any(Error)
    );
  });
});
