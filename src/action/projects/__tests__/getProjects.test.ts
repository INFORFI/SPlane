import { getProjects } from '@/action/projects/getProjects';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();

  return {
    prisma: {
      project: {
        findMany: mockFindMany,
      },
    },
  };
});

describe('getProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return empty array if no projects are found', async () => {
    // Mock empty projects array
    (prisma.project.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getProjects();

    expect(result).toEqual([]);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      include: {
        owner: true,
        tasks: {
          include: {
            userTasks: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  });

  it('should calculate progress correctly for projects with tasks', async () => {
    // Mock projects with tasks
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
    const mockUser2 = { id: 2, name: 'User 2', email: 'user2@example.com' };

    const mockProjects = [
      {
        id: 1,
        name: 'Project with 50% completion',
        description: 'Test Description',
        ownerId: 1,
        owner: mockUser1,
        tasks: [
          {
            id: 1,
            title: 'Task 1',
            projectId: 1,
            status: 'COMPLETED',
            userTasks: [{ id: 1, taskId: 1, userId: 1, user: mockUser1 }],
          },
          {
            id: 2,
            title: 'Task 2',
            projectId: 1,
            status: 'IN_PROGRESS',
            userTasks: [{ id: 2, taskId: 2, userId: 2, user: mockUser2 }],
          },
        ],
      },
      {
        id: 2,
        name: 'Project with 100% completion',
        description: 'All tasks completed',
        ownerId: 2,
        owner: mockUser2,
        tasks: [
          {
            id: 3,
            title: 'Task 3',
            projectId: 2,
            status: 'COMPLETED',
            userTasks: [{ id: 3, taskId: 3, userId: 1, user: mockUser1 }],
          },
          {
            id: 4,
            title: 'Task 4',
            projectId: 2,
            status: 'COMPLETED',
            userTasks: [{ id: 4, taskId: 4, userId: 2, user: mockUser2 }],
          },
        ],
      },
    ];

    (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

    const result = await getProjects();

    expect(result).toHaveLength(2);
    expect(result[0].progress).toBe(50); // First project has 1/2 tasks completed
    expect(result[1].progress).toBe(100); // Second project has 2/2 tasks completed
  });

  it('should handle projects with no tasks', async () => {
    // Mock project with no tasks
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };

    const mockProjects = [
      {
        id: 1,
        name: 'Project with no tasks',
        description: 'Test Description',
        ownerId: 1,
        owner: mockUser1,
        tasks: [],
      },
    ];

    (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].progress).toBe(0); // Project with no tasks should have 0 progress
    expect(result[0].teamMembers).toEqual([]);
  });

  it('should extract team members correctly from tasks', async () => {
    // Mock project with multiple team members
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
    const mockUser2 = { id: 2, name: 'User 2', email: 'user2@example.com' };
    const mockUser3 = { id: 3, name: 'User 3', email: 'user3@example.com' };

    const mockProjects = [
      {
        id: 1,
        name: 'Project with team members',
        description: 'Test Description',
        ownerId: 1,
        owner: mockUser1,
        tasks: [
          {
            id: 1,
            title: 'Task 1',
            projectId: 1,
            status: 'IN_PROGRESS',
            userTasks: [
              { id: 1, taskId: 1, userId: 1, user: mockUser1 },
              { id: 2, taskId: 1, userId: 2, user: mockUser2 },
            ],
          },
          {
            id: 2,
            title: 'Task 2',
            projectId: 1,
            status: 'IN_PROGRESS',
            userTasks: [
              { id: 3, taskId: 2, userId: 2, user: mockUser2 },
              { id: 4, taskId: 2, userId: 3, user: mockUser3 },
            ],
          },
        ],
      },
    ];

    (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].teamMembers).toHaveLength(3);
    expect(result[0].teamMembers).toEqual(
      expect.arrayContaining([mockUser1, mockUser2, mockUser3])
    );
  });

  it('should handle duplicate team members correctly', async () => {
    // Mock project with duplicate team members
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
    const mockUser2 = { id: 2, name: 'User 2', email: 'user2@example.com' };

    const mockProjects = [
      {
        id: 1,
        name: 'Project with duplicate members',
        description: 'Test Description',
        ownerId: 1,
        owner: mockUser1,
        tasks: [
          {
            id: 1,
            title: 'Task 1',
            projectId: 1,
            status: 'IN_PROGRESS',
            userTasks: [
              { id: 1, taskId: 1, userId: 1, user: mockUser1 },
              { id: 2, taskId: 1, userId: 2, user: mockUser2 },
            ],
          },
          {
            id: 2,
            title: 'Task 2',
            projectId: 1,
            status: 'IN_PROGRESS',
            userTasks: [
              { id: 3, taskId: 2, userId: 1, user: mockUser1 }, // Duplicate user
              { id: 4, taskId: 2, userId: 2, user: mockUser2 }, // Duplicate user
            ],
          },
        ],
      },
    ];

    (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].teamMembers).toHaveLength(2); // Should deduplicate users
    expect(result[0].teamMembers).toEqual([mockUser1, mockUser2]);
  });

  it('should handle database errors', async () => {
    // Mock database error
    (prisma.project.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await getProjects();

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Error fetching projects:', expect.any(Error));
  });
});
