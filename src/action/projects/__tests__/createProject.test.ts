
import { createProject } from '@/action/projects/createProject';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      create: jest.fn(),
    },
  },
}));


jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('createProject', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return error if user is not authenticated', async () => {
    // Mock authentication to return null (not authenticated)
    (requireAuth as jest.Mock).mockResolvedValue(null);

    const input = {
      name: 'Test Project',
      description: 'Test Description',
      startDate: '2025-01-01',
      ownerId: '1',
    };

    const result = await createProject(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe('You must be logged in to create a project');
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('should validate project name is required', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    const input = {
      name: '',  // Empty name should trigger validation error
      description: 'Test Description',
      startDate: '2025-01-01',
      ownerId: '1',
    };

    const result = await createProject(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Project name is required');
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('should validate start date is required', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    const input = {
      name: 'Test Project',
      description: 'Test Description',
      startDate: '',  // Empty start date should trigger validation error
      ownerId: '1',
    };

    const result = await createProject(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Start date is required');
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('should validate end date is after start date', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    const input = {
      name: 'Test Project',
      description: 'Test Description',
      startDate: '2025-02-01',
      endDate: '2025-01-01',  // End date before start date
      ownerId: '1',
    };

    const result = await createProject(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe('End date must be after start date');
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('should create a project successfully', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);

    // Mock Prisma to return a mock project
    const mockProject = {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-02-01'),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

    const input = {
      name: 'Test Project',
      description: 'Test Description',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      ownerId: '1',
    };

    const result = await createProject(input);

    expect(result.success).toBe(true);
    expect(result.project).toEqual(mockProject);
    expect(result.message).toBe('Project created successfully');
    
    // Check that Prisma was called with the correct arguments
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Project',
        description: 'Test Description',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        ownerId: 1,
      },
    });
    
    // Verify path revalidation was called
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/projects');
  });

  it('should handle Prisma errors', async () => {
    // Mock authentication to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock Prisma to throw an error
    (prisma.project.create as jest.Mock).mockRejectedValue(new Error('Database error'));

    const input = {
      name: 'Test Project',
      description: 'Test Description',
      startDate: '2025-01-01',
      ownerId: '1',
    };

    const result = await createProject(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe('An error occurred while creating the project');
    expect(prisma.project.create).toHaveBeenCalled();
  });
});