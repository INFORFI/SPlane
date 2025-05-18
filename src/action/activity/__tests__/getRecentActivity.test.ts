import { getRecentActivity } from '@/action/activity/getRecentActivity';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Mock des dépendances
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(),
}));

jest.mock('date-fns/locale', () => ({
  fr: {},
}));

jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();

  return {
    prisma: {
      activity: {
        findMany: mockFindMany,
      },
    },
  };
});

describe('getRecentActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return activities with correct format', async () => {
    // Mock de la date formatée
    (formatDistanceToNow as jest.Mock).mockReturnValue('il y a 2 heures');

    // Mock des données d'activité
    const mockActivities = [
      {
        id: 1,
        userId: 1,
        type: 'TASK_COMPLETED',
        content: 'a terminé la tâche Create API endpoints',
        entityId: 123,
        entityType: 'task',
        createdAt: new Date('2023-01-01T10:00:00Z'),
        user: {
          id: 1,
          fullName: 'John Doe',
        },
      },
      {
        id: 2,
        userId: 2,
        type: 'TASK_STARTED',
        content: 'a commencé la tâche Implement responsive layout',
        entityId: 456,
        entityType: 'task',
        createdAt: new Date('2023-01-01T08:00:00Z'),
        user: {
          id: 2,
          fullName: 'Jane Smith',
        },
      },
    ];

    (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);

    const result = await getRecentActivity(2);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      userInitials: 'JD',
      userName: 'John Doe',
      content: 'a terminé la tâche Create API endpoints',
      timeAgo: 'il y a 2 heures',
      userColor: 'primary',
    });

    expect(result[1]).toEqual({
      id: 2,
      userInitials: 'JS',
      userName: 'Jane Smith',
      content: 'a commencé la tâche Implement responsive layout',
      timeAgo: 'il y a 2 heures',
      userColor: 'accent',
    });

    // Vérifier que prisma.activity.findMany a été appelé avec les bons paramètres
    expect(prisma.activity.findMany).toHaveBeenCalledWith({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 2,
    });

    // Vérifier que formatDistanceToNow a été appelé pour chaque activité
    expect(formatDistanceToNow).toHaveBeenCalledTimes(2);
    expect(formatDistanceToNow).toHaveBeenCalledWith(mockActivities[0].createdAt, {
      addSuffix: true,
      locale: fr,
    });
    expect(formatDistanceToNow).toHaveBeenCalledWith(mockActivities[1].createdAt, {
      addSuffix: true,
      locale: fr,
    });
  });

  it('should use default limit of 3 when no limit is provided', async () => {
    // Mock des données d'activité
    (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);
    (formatDistanceToNow as jest.Mock).mockReturnValue('il y a 1 jour');

    await getRecentActivity();

    // Vérifier que prisma.activity.findMany a été appelé avec la limite par défaut
    expect(prisma.activity.findMany).toHaveBeenCalledWith({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });
  });

  it('should handle unknown activity types correctly', async () => {
    // Mock de la date formatée
    (formatDistanceToNow as jest.Mock).mockReturnValue('il y a 3 heures');

    // Mock d'une activité avec un type inconnu
    const mockActivities = [
      {
        id: 3,
        userId: 3,
        type: 'UNKNOWN_TYPE',
        content: 'a fait quelque chose',
        entityId: 789,
        entityType: 'unknown',
        createdAt: new Date('2023-01-01T07:00:00Z'),
        user: {
          id: 3,
          fullName: 'Admin User',
        },
      },
    ];

    (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);

    const result = await getRecentActivity();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 3,
      userInitials: 'AU',
      userName: 'Admin User',
      content: 'a fait quelque chose',
      timeAgo: 'il y a 3 heures',
      userColor: 'primary', // Devrait utiliser la couleur par défaut
    });
  });

  it('should handle database errors gracefully', async () => {
    // Mock d'une erreur de base de données
    (prisma.activity.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Capture la console.error
    const consoleErrorSpy = jest.spyOn(console, 'error');

    // La fonction devrait retourner un tableau vide en cas d'erreur
    const result = await getRecentActivity();

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur lors de la récupération des activités:',
      expect.any(Error)
    );
  });

  it('should correctly generate initials from user names', async () => {
    // Mock de la date formatée
    (formatDistanceToNow as jest.Mock).mockReturnValue('il y a 1 jour');

    // Mock des données d'activité avec différents formats de noms
    const mockActivities = [
      {
        id: 1,
        userId: 1,
        type: 'PROJECT_CREATED',
        content: 'a créé un nouveau projet',
        entityId: 123,
        entityType: 'project',
        createdAt: new Date('2023-01-01T10:00:00Z'),
        user: {
          id: 1,
          fullName: 'John',
        },
      },
      {
        id: 2,
        userId: 2,
        type: 'PROJECT_UPDATED',
        content: 'a mis à jour le projet',
        entityId: 456,
        entityType: 'project',
        createdAt: new Date('2023-01-01T08:00:00Z'),
        user: {
          id: 2,
          fullName: 'Jane Middle Smith',
        },
      },
    ];

    (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);

    const result = await getRecentActivity();

    expect(result[0].userInitials).toBe('J');
    expect(result[1].userInitials).toBe('JMS');
  });
});
