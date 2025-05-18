import { getAssignedTasks } from '@/action/tasks/getAssignedTasks';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();

  return {
    prisma: {
      task: {
        findMany: mockFindMany,
      },
    },
  };
});

describe('getAssignedTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return tasks assigned to the specified user', async () => {
    // Mock user and project
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockProject = { id: 1, name: 'Test Project', description: 'Test Description' };

    // Mock tasks with their details
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Task 1 Description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        deadline: new Date('2025-01-15'),
        projectId: 1,
        project: mockProject,
        userTasks: [{ id: 1, taskId: 1, userId: 1, user: mockUser }],
      },
      {
        id: 2,
        title: 'Task 2',
        description: 'Task 2 Description',
        status: 'TODO',
        priority: 'MEDIUM',
        deadline: new Date('2025-01-10'),
        projectId: 1,
        project: mockProject,
        userTasks: [{ id: 2, taskId: 2, userId: 1, user: mockUser }],
      },
    ];

    (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

    const result = await getAssignedTasks(1);

    expect(result).toEqual(mockTasks);
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        userTasks: {
          some: {
            userId: 1,
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
      orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
    });
  });

  it('should return empty array if no tasks are assigned to the user', async () => {
    // Mock empty tasks array
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getAssignedTasks(1);

    expect(result).toEqual([]);
    expect(prisma.task.findMany).toHaveBeenCalled();
  });

  it('should order tasks by priority (desc) and deadline (asc)', async () => {
    // Mock user and project
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockProject = { id: 1, name: 'Test Project', description: 'Test Description' };

    // Create tasks with different priorities and deadlines
    const highPriorityLaterDeadline = {
      id: 1,
      title: 'High Priority, Later Deadline',
      status: 'TODO',
      priority: 'HIGH',
      deadline: new Date('2025-02-01'),
      projectId: 1,
      project: mockProject,
      userTasks: [{ id: 1, taskId: 1, userId: 1, user: mockUser }],
    };

    const highPriorityEarlierDeadline = {
      id: 2,
      title: 'High Priority, Earlier Deadline',
      status: 'TODO',
      priority: 'HIGH',
      deadline: new Date('2025-01-15'),
      projectId: 1,
      project: mockProject,
      userTasks: [{ id: 2, taskId: 2, userId: 1, user: mockUser }],
    };

    const mediumPriorityEarliestDeadline = {
      id: 3,
      title: 'Medium Priority, Earliest Deadline',
      status: 'TODO',
      priority: 'MEDIUM',
      deadline: new Date('2025-01-01'),
      projectId: 1,
      project: mockProject,
      userTasks: [{ id: 3, taskId: 3, userId: 1, user: mockUser }],
    };

    const sortedTasks = [
      highPriorityEarlierDeadline, // HIGH priority, earlier deadline
      highPriorityLaterDeadline, // HIGH priority, later deadline
      mediumPriorityEarliestDeadline, // MEDIUM priority, earliest deadline
    ];

    (prisma.task.findMany as jest.Mock).mockResolvedValue(sortedTasks);

    const result = await getAssignedTasks(1);

    // Verify the order matches our expectation
    expect(result).toEqual(sortedTasks);
    expect(result[0].priority).toBe('HIGH');
    expect(result[0].deadline).toEqual(new Date('2025-01-15'));
    expect(result[1].priority).toBe('HIGH');
    expect(result[1].deadline).toEqual(new Date('2025-02-01'));
    expect(result[2].priority).toBe('MEDIUM');
  });

  it('should handle database errors and return empty array', async () => {
    // Mock database error
    (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await getAssignedTasks(1);

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching assigned tasks for user 1:',
      expect.any(Error)
    );
  });
});
