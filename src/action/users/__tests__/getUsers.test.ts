import { getUsers } from '@/action/users/getUsers';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();

  return {
    prisma: {
      user: {
        findMany: mockFindMany,
      },
    },
  };
});

describe('getUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return users when the database query is successful', async () => {
    // Mock users data
    const mockUsers = [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
      { id: 3, name: 'User 3', email: 'user3@example.com' },
    ];

    // Set up mock to return users
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    // Call the function
    const result = await getUsers();

    // Check results
    expect(result).toEqual(mockUsers);
    expect(result.length).toBe(3);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.user.findMany).toHaveBeenCalledWith();
  });

  it('should return an empty array when there are no users', async () => {
    // Set up mock to return empty array
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    // Call the function
    const result = await getUsers();

    // Check results
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array when a database error occurs', async () => {
    // Set up mock to throw an error
    const testError = new Error('Database connection error');
    (prisma.user.findMany as jest.Mock).mockRejectedValue(testError);

    // Call the function
    const result = await getUsers();

    // Check results
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(testError);
  });
});
