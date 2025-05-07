import { countUserTasks } from '@/action/tasks/countUserTask';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Mocks
jest.mock('@/lib/prisma', () => ({
  prisma: {
    userTask: {
      count: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

describe('countUserTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 0 if user is not authenticated', async () => {
    // Mock authentication to return null (not authenticated)
    (requireAuth as jest.Mock).mockResolvedValue(null);

    const result = await countUserTasks();

    expect(result).toBe(0);
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.userTask.count).not.toHaveBeenCalled();
  });

  it('should return the count of tasks for authenticated user', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    // Mock task count to return 5
    (prisma.userTask.count as jest.Mock).mockResolvedValue(5);

    const result = await countUserTasks();

    expect(result).toBe(5);
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.userTask.count).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
    });
  });

  it('should return 0 if no tasks are found', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    // Mock task count to return 0
    (prisma.userTask.count as jest.Mock).mockResolvedValue(0);

    const result = await countUserTasks();

    expect(result).toBe(0);
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.userTask.count).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
    });
  });

  it('should handle database errors and return 0', async () => {
    (requireAuth as jest.Mock).mockResolvedValue(1);

    const result = await countUserTasks();

    expect(result).toBe(0);
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.userTask.count).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
    });
  });
});
