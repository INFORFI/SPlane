import { getUserLoggedIn } from '@/action/users/getUserLoggedIn';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Mocks
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  
  return {
    prisma: {
      user: {
        findUnique: mockFindUnique
      }
    }
  };
});

describe('getUserLoggedIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if user is not authenticated', async () => {
    // Mock authentication to return null (not authenticated)
    (requireAuth as jest.Mock).mockResolvedValue(null);

    const result = await getUserLoggedIn();

    expect(result).toBeNull();
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return null if user is not found in database', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock user not found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getUserLoggedIn();

    expect(result).toBeNull();
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
        projects: true,
        userTasks: true,
        passwordHash: false,
        settings: true,
      }
    });
  });

  it('should return user data if user is authenticated and found', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock user data
    const mockDate = new Date();
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'USER' as Role,
      fullName: 'Test User',
      createdAt: mockDate,
      updatedAt: mockDate,
      projects: [
        { id: 1, name: 'Project 1', ownerId: 1 },
        { id: 2, name: 'Project 2', ownerId: 1 }
      ],
      userTasks: [
        { id: 1, userId: 1, taskId: 1 },
        { id: 2, userId: 1, taskId: 2 }
      ],
      settings: {
        id: 1,
        userId: 1,
        notifications_patch_notes: true
      }
    };
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await getUserLoggedIn();

    expect(result).toEqual(mockUser);
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
        projects: true,
        userTasks: true,
        passwordHash: false,
        settings: true,
      }
    });
  });

  it('should handle database errors gracefully', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock database error
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await getUserLoggedIn();
      fail('Expected function to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Database error');
    }

    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });

  it('should include user settings in the returned data', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock user data with settings
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'USER' as Role,
      fullName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: [],
      userTasks: [],
      settings: {
        id: 1,
        userId: 1,
        notifications_patch_notes: true
      }
    };
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await getUserLoggedIn();

    expect(result).toEqual(mockUser);
    expect(result?.settings).toEqual({
      id: 1,
      userId: 1,
      notifications_patch_notes: true
    });
  });

  it('should not expose password hash in the returned data', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock user data with passwordHash (which should be filtered out)
    const mockUserWithPassword = {
      id: 1,
      email: 'test@example.com',
      role: 'USER' as Role,
      fullName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: [],
      userTasks: [],
      settings: null,
      passwordHash: 'hashed_password_value'
    };
    
    // The findUnique mock would return data without passwordHash due to select clause
    const mockUserWithoutPassword = { ...mockUserWithPassword };
    delete (mockUserWithoutPassword as any).passwordHash;
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithoutPassword);

    const result = await getUserLoggedIn();

    expect(result).toEqual(mockUserWithoutPassword);
    expect(result).not.toHaveProperty('passwordHash');
  });
}); 