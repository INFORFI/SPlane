import { getTasks, getTasksByProject, getTasksByUser, getTasksByDateRange } from '@/action/tasks/getTasks';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();
  
  return {
    prisma: {
      task: {
        findMany: mockFindMany
      }
    }
  };
});

describe('Task retrieval functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock data
  const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
  const mockUser2 = { id: 2, name: 'User 2', email: 'user2@example.com' };
  
  const mockProject1 = { id: 1, name: 'Project 1', ownerId: 1 };
  const mockProject2 = { id: 2, name: 'Project 2', ownerId: 2 };
  
  const mockTasks = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'IN_PROGRESS',
      projectId: 1,
      deadline: new Date('2023-12-01'),
      project: mockProject1,
      userTasks: [
        { id: 1, taskId: 1, userId: 1, user: mockUser1 }
      ]
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'COMPLETED',
      projectId: 1,
      deadline: new Date('2023-11-15'),
      project: mockProject1,
      userTasks: [
        { id: 2, taskId: 2, userId: 1, user: mockUser1 },
        { id: 3, taskId: 2, userId: 2, user: mockUser2 }
      ]
    },
    {
      id: 3,
      title: 'Task 3',
      description: 'Description 3',
      status: 'TODO',
      projectId: 2,
      deadline: new Date('2023-12-15'),
      project: mockProject2,
      userTasks: [
        { id: 4, taskId: 3, userId: 2, user: mockUser2 }
      ]
    }
  ];

  describe('getTasks', () => {
    it('should return all tasks with projects and assigned users', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getTasks();

      expect(result).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        include: {
          project: true,
          userTasks: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          deadline: 'asc',
        },
      });
    });

    it('should return empty array on error', async () => {
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getTasks();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la récupération des tâches:',
        expect.any(Error)
      );
    });
  });

  describe('getTasksByProject', () => {
    it('should return tasks for a specific project', async () => {
      const projectId = 1;
      const projectTasks = mockTasks.filter(task => task.projectId === projectId);
      
      (prisma.task.findMany as jest.Mock).mockResolvedValue(projectTasks);

      const result = await getTasksByProject(projectId);

      expect(result).toEqual(projectTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          projectId: projectId,
        },
        include: {
          project: true,
          userTasks: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          deadline: 'asc',
        },
      });
    });

    it('should return empty array when project has no tasks', async () => {
      const projectId = 999; // Non-existent project
      
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTasksByProject(projectId);

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const projectId = 1;
      
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getTasksByProject(projectId);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        `Erreur lors de la récupération des tâches du projet ${projectId}:`,
        expect.any(Error)
      );
    });
  });

  describe('getTasksByUser', () => {
    it('should return tasks assigned to a specific user', async () => {
      const userId = 1;
      const userTasks = mockTasks.filter(task => 
        task.userTasks.some(ut => ut.userId === userId)
      );
      
      (prisma.task.findMany as jest.Mock).mockResolvedValue(userTasks);

      const result = await getTasksByUser(userId);

      expect(result).toEqual(userTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          userTasks: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          project: true,
          userTasks: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          deadline: 'asc',
        },
      });
    });

    it('should return empty array when user has no tasks', async () => {
      const userId = 999; // Non-existent user
      
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTasksByUser(userId);

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const userId = 1;
      
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getTasksByUser(userId);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        `Erreur lors de la récupération des tâches de l'utilisateur ${userId}:`,
        expect.any(Error)
      );
    });
  });

  describe('getTasksByDateRange', () => {
    it('should return tasks within a date range', async () => {
      const startDate = new Date('2023-11-01');
      const endDate = new Date('2023-12-01');
      
      const rangeTasks = mockTasks.filter(task => 
        task.deadline >= startDate && task.deadline <= endDate
      );
      
      (prisma.task.findMany as jest.Mock).mockResolvedValue(rangeTasks);

      const result = await getTasksByDateRange(startDate, endDate);

      expect(result).toEqual(rangeTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          deadline: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          project: true,
          userTasks: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          deadline: 'asc',
        },
      });
    });

    it('should return empty array when no tasks in date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTasksByDateRange(startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const startDate = new Date('2023-11-01');
      const endDate = new Date('2023-12-01');
      
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getTasksByDateRange(startDate, endDate);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la récupération des tâches par plage de dates:',
        expect.any(Error)
      );
    });
  });
}); 