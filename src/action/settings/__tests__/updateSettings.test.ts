import { updateSettings } from '@/action/settings/updateSettings';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  const mockUpdate = jest.fn();
  const mockCreate = jest.fn();

  return {
    prisma: {
      user: {
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
      userSettings: {
        create: mockCreate,
      },
    },
  };
});

describe('updateSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if user is not authenticated', async () => {
    // Mock authentication to return null (not authenticated)
    (requireAuth as jest.Mock).mockResolvedValue(null);

    const settings = {
      notifications_patch_notes: true,
    };

    const result = await updateSettings(settings);

    expect(result).toBeNull();
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return null if user is not found', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    // Mock user not found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const settings = {
      notifications_patch_notes: true,
    };

    const result = await updateSettings(settings);

    expect(result).toBeNull();
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { settings: true },
    });
    expect(prisma.userSettings.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should create settings if user has no settings', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    // Mock user found but without settings
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      settings: null,
    });

    // Mock create settings
    (prisma.userSettings.create as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 1,
      notifications_patch_notes: true,
    });

    // Mock update user
    const mockUpdatedUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      settings: {
        id: 1,
        userId: 1,
        notifications_patch_notes: true,
      },
    };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const settings = {
      notifications_patch_notes: true,
    };

    const result = await updateSettings(settings);

    expect(result).toEqual(mockUpdatedUser);
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { settings: true },
    });
    expect(prisma.userSettings.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        notifications_patch_notes: true,
      },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        settings: {
          update: {
            notifications_patch_notes: true,
          },
        },
      },
    });
  });

  it('should update existing settings', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    // Mock user found with settings
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      settings: {
        id: 1,
        userId: 1,
        notifications_patch_notes: false,
      },
    });

    // Mock update user
    const mockUpdatedUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      settings: {
        id: 1,
        userId: 1,
        notifications_patch_notes: true,
      },
    };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const settings = {
      notifications_patch_notes: true,
    };

    const result = await updateSettings(settings);

    expect(result).toEqual(mockUpdatedUser);
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { settings: true },
    });
    expect(prisma.userSettings.create).not.toHaveBeenCalled(); // Should not create new settings
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        settings: {
          update: {
            notifications_patch_notes: true,
          },
        },
      },
    });
  });

  it('should handle database errors gracefully', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    // Mock database error
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const settings = {
      notifications_patch_notes: true,
    };

    try {
      await updateSettings(settings);
      fail('Expected function to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Database error');
    }

    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });
});
