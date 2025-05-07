import { updateUser } from '@/action/users/updateUser';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const mockUpdate = jest.fn();
  
  return {
    prisma: {
      user: {
        update: mockUpdate
      }
    }
  };
});

describe('updateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error if user is not authenticated', async () => {
    // Mock authentication to return null (not authenticated)
    (requireAuth as jest.Mock).mockResolvedValue(null);

    const result = await updateUser('John Doe', 'john@example.com');

    expect(result).toEqual({
      success: false,
      error: 'User not found'
    });
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should update user successfully', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock user update
    const mockUpdatedUser = {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
    };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const result = await updateUser('John Doe', 'john@example.com');

    expect(result).toEqual({
      success: true,
      user: mockUpdatedUser
    });
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { fullName: 'John Doe', email: 'john@example.com' },
    });
  });

  it('should handle database errors', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock database error
    const testError = new Error('Database error');
    (prisma.user.update as jest.Mock).mockRejectedValue(testError);

    try {
      await updateUser('John Doe', 'john@example.com');
      fail('Expected function to throw an error');
    } catch (error) {
      expect(error).toBe(testError);
    }

    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('should update only provided fields', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock user update
    const mockUpdatedUser = {
      id: 1,
      fullName: 'Jane Smith',
      email: 'jane@example.com',
    };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const result = await updateUser('Jane Smith', 'jane@example.com');

    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUpdatedUser);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { fullName: 'Jane Smith', email: 'jane@example.com' },
    });
  });

  it('should handle empty values', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock user update with empty values
    const mockUpdatedUser = {
      id: 1,
      fullName: '',
      email: '',
    };
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

    const result = await updateUser('', '');

    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUpdatedUser);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { fullName: '', email: '' },
    });
  });
}); 