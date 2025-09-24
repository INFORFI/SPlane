import { deleteComment } from '../deleteComment';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Mock de Prisma
jest.mock('@/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  const mockDelete = jest.fn();

  return {
    prisma: {
      comment: {
        findUnique: mockFindUnique,
        delete: mockDelete,
      },
      user: {
        findUnique: mockFindUnique,
      },
    },
  };
});

// Mock requireAuth
jest.mock('@/lib/auth');
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('deleteComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock data
  const mockAuthor = {
    id: 1,
    email: 'author@example.com',
    fullName: 'Comment Author',
    passwordHash: 'hash',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOtherUser = {
    id: 2,
    email: 'other@example.com',
    fullName: 'Other User',
    passwordHash: 'hash',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser = {
    id: 3,
    email: 'admin@example.com',
    fullName: 'Admin User',
    passwordHash: 'hash',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComment = {
    id: 1,
    content: 'Commentaire à supprimer',
    taskId: 1,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockAuthor,
  };

  it('devrait permettre à l\'auteur de supprimer son commentaire', async () => {
    mockRequireAuth.mockResolvedValue(1);

    // Mock pour trouver le commentaire
    (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

    // Mock pour trouver l'utilisateur actuel
    const userFindUnique = jest.fn();
    userFindUnique.mockResolvedValue(mockAuthor);
    (prisma.user.findUnique as jest.Mock) = userFindUnique;

    // Mock pour supprimer le commentaire
    (prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment);

    const result = await deleteComment(1);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    expect(prisma.comment.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { author: true },
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { role: true },
    });

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('devrait permettre à un administrateur de supprimer n\'importe quel commentaire', async () => {
    mockRequireAuth.mockResolvedValue(3);

    (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

    const userFindUnique = jest.fn();
    userFindUnique.mockResolvedValue(mockAdminUser);
    (prisma.user.findUnique as jest.Mock) = userFindUnique;

    (prisma.comment.delete as jest.Mock).mockResolvedValue(mockComment);

    const result = await deleteComment(1);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('devrait empêcher un autre utilisateur de supprimer un commentaire', async () => {
    mockRequireAuth.mockResolvedValue(2);

    (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

    const userFindUnique = jest.fn();
    userFindUnique.mockResolvedValue(mockOtherUser);
    (prisma.user.findUnique as jest.Mock) = userFindUnique;

    const result = await deleteComment(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Vous n\'avez pas le droit de supprimer ce commentaire');

    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });

  it('devrait échouer si l\'utilisateur n\'est pas authentifié', async () => {
    mockRequireAuth.mockResolvedValue(null);

    const result = await deleteComment(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentification requise');

    expect(prisma.comment.findUnique).not.toHaveBeenCalled();
    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });

  it('devrait échouer si le commentaire n\'existe pas', async () => {
    mockRequireAuth.mockResolvedValue(1);
    (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await deleteComment(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Commentaire introuvable');

    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });

  it('devrait échouer si l\'utilisateur actuel n\'existe pas', async () => {
    mockRequireAuth.mockResolvedValue(1);

    (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

    const userFindUnique = jest.fn();
    userFindUnique.mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock) = userFindUnique;

    const result = await deleteComment(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Utilisateur introuvable');

    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });

  it('devrait retourner une erreur en cas d\'échec de suppression', async () => {
    mockRequireAuth.mockResolvedValue(1);

    (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);

    const userFindUnique = jest.fn();
    userFindUnique.mockResolvedValue(mockAuthor);
    (prisma.user.findUnique as jest.Mock) = userFindUnique;

    (prisma.comment.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await deleteComment(1);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Une erreur est survenue lors de la suppression du commentaire');

    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la suppression du commentaire:',
      expect.any(Error)
    );
  });
});