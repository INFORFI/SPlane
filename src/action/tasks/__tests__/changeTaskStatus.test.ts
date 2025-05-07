import changeTaskStatus from '@/action/tasks/changeTaskStatus';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockUpdate = jest.fn();
  
  return {
    prisma: {
      task: {
        update: mockUpdate
      }
    }
  };
});

describe('changeTaskStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update task status successfully', async () => {
    // Mock task update
    const mockTask = {
      id: 123,
      title: 'Test Task',
      description: 'Test Description',
      status: 'COMPLETED',
      projectId: 1,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const result = await changeTaskStatus('123', 'COMPLETED');

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: { status: 'COMPLETED' },
    });
  });

  it('should handle string taskId conversion correctly', async () => {
    // Mock task update
    const mockTask = {
      id: 456,
      title: 'Another Task',
      status: 'IN_PROGRESS',
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const result = await changeTaskStatus('456', 'IN_PROGRESS');

    expect(result.success).toBe(true);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 456 },
      data: { status: 'IN_PROGRESS' },
    });
  });

  it('should handle invalid taskId gracefully', async () => {
    // Mock database error for invalid ID
    (prisma.task.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

    const result = await changeTaskStatus('999', 'COMPLETED');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalledWith(
      'Failed to update task status:',
      expect.any(Error)
    );
  });

  it('should handle non-numeric taskId', async () => {
    // When taskId is not a valid number
    const result = await changeTaskStatus('invalid-id', 'COMPLETED');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle invalid status value', async () => {
    // Mock database error for invalid status
    (prisma.task.update as jest.Mock).mockRejectedValue(
      new Error('Invalid status value')
    );

    const result = await changeTaskStatus('123', 'INVALID_STATUS');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    // Mock general database error
    (prisma.task.update as jest.Mock).mockRejectedValue(
      new Error('Database connection error')
    );

    const result = await changeTaskStatus('123', 'COMPLETED');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalledWith(
      'Failed to update task status:',
      expect.any(Error)
    );
  });
}); 