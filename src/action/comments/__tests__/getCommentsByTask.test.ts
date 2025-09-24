import { getCommentsByTask } from '../getCommentsByTask';
import { prisma } from '@/lib/prisma';

// Mock de Prisma
jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();

  return {
    prisma: {
      comment: {
        findMany: mockFindMany,
      },
    },
  };
});

describe('getCommentsByTask', () => {
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

  const mockComments = [
    {
      id: 1,
      content: 'Premier commentaire',
      taskId: 1,
      authorId: 1,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      author: mockUser,
    },
    {
      id: 2,
      content: 'Deuxième commentaire',
      taskId: 1,
      authorId: 1,
      createdAt: new Date('2024-01-01T11:00:00Z'),
      updatedAt: new Date('2024-01-01T11:00:00Z'),
      author: mockUser,
    },
  ];

  it("devrait récupérer les commentaires d'une tâche avec les informations de l'auteur", async () => {
    (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);

    const result = await getCommentsByTask(1);

    expect(result).toEqual(mockComments);
    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        taskId: 1,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  });

  it('devrait retourner une liste vide pour une tâche sans commentaires', async () => {
    (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getCommentsByTask(2);

    expect(result).toEqual([]);
    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        taskId: 2,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  });

  it("devrait retourner les commentaires dans l'ordre chronologique", async () => {
    const orderedComments = [...mockComments].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    (prisma.comment.findMany as jest.Mock).mockResolvedValue(orderedComments);

    const result = await getCommentsByTask(1);

    expect(result).toEqual(orderedComments);
    expect(new Date(result[0].createdAt).getTime()).toBeLessThanOrEqual(
      new Date(result[1].createdAt).getTime()
    );
  });

  it("devrait retourner une liste vide en cas d'erreur", async () => {
    (prisma.comment.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await getCommentsByTask(1);

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la récupération des commentaires pour la tâche 1:',
      expect.any(Error)
    );
  });
});
