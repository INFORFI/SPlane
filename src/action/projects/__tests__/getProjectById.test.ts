import { getProjectById } from '@/action/projects/getProjectById';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  
  return {
    prisma: {
      project: {
        findUnique: mockFindUnique
      }
    }
  };
});

describe('getProjectById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return null if project is not found', async () => {
    // Mock project not found
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getProjectById(1);

    expect(result).toBeNull();
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
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

  it('should return project with team members extracted from tasks', async () => {
    // Mock project with tasks and users
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
    const mockUser2 = { id: 2, name: 'User 2', email: 'user2@example.com' };
    const mockUser3 = { id: 3, name: 'User 3', email: 'user3@example.com' };
    
    const mockProject = {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      ownerId: 1,
      owner: mockUser1,
      tasks: [
        {
          id: 1,
          title: 'Task 1',
          projectId: 1,
          userTasks: [
            { id: 1, taskId: 1, userId: 1, user: mockUser1 },
            { id: 2, taskId: 1, userId: 2, user: mockUser2 }
          ]
        },
        {
          id: 2,
          title: 'Task 2',
          projectId: 1,
          userTasks: [
            { id: 3, taskId: 2, userId: 2, user: mockUser2 },
            { id: 4, taskId: 2, userId: 3, user: mockUser3 }
          ]
        }
      ]
    };
    
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

    const result = await getProjectById(1);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
    expect(result?.name).toBe('Test Project');
    expect(result?.owner).toEqual(mockUser1);
    expect(result?.teamMembers).toHaveLength(3);
    expect(result?.teamMembers).toEqual(expect.arrayContaining([mockUser1, mockUser2, mockUser3]));
  });

  it('should handle duplicate team members correctly', async () => {
    // Mock project with tasks and duplicate users
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
    const mockUser2 = { id: 2, name: 'User 2', email: 'user2@example.com' };
    
    const mockProject = {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      ownerId: 1,
      owner: mockUser1,
      tasks: [
        {
          id: 1,
          title: 'Task 1',
          projectId: 1,
          userTasks: [
            { id: 1, taskId: 1, userId: 1, user: mockUser1 },
            { id: 2, taskId: 1, userId: 2, user: mockUser2 }
          ]
        },
        {
          id: 2,
          title: 'Task 2',
          projectId: 1,
          userTasks: [
            { id: 3, taskId: 2, userId: 1, user: mockUser1 }, // Duplicate user
            { id: 4, taskId: 2, userId: 2, user: mockUser2 }  // Duplicate user
          ]
        }
      ]
    };
    
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

    const result = await getProjectById(1);

    expect(result).not.toBeNull();
    expect(result?.teamMembers).toHaveLength(2); // Should deduplicate users
    expect(result?.teamMembers).toEqual([mockUser1, mockUser2]);
  });

  it('should handle empty tasks array', async () => {
    // Mock project with no tasks
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
    
    const mockProject = {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      ownerId: 1,
      owner: mockUser1,
      tasks: []
    };
    
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

    const result = await getProjectById(1);

    expect(result).not.toBeNull();
    expect(result?.teamMembers).toHaveLength(0);
  });

  it('should handle database errors', async () => {
    // Mock database error
    (prisma.project.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await getProjectById(1);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error fetching project:', expect.any(Error));
  });
}); 