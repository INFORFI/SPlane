import changeTaskStatus from '@/action/tasks/changeTaskStatus';
import { prisma } from '@/lib/prisma';
import { ActivityType, TaskStatus } from '@prisma/client';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockUpdate = jest.fn();
  const mockCreate = jest.fn();

  return {
    prisma: {
      task: {
        update: mockUpdate,
      },
      activity: {
        create: mockCreate,
      },
    },
  };
});

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue('mock-user-id'),
}));

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
      status: TaskStatus.COMPLETED,
      projectId: 1,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const result = await changeTaskStatus('123', TaskStatus.COMPLETED);

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: { status: TaskStatus.COMPLETED },
    });
    expect(prisma.activity.create).toHaveBeenCalledWith({
      data: {
        userId: 'mock-user-id',
        type: ActivityType.TASK_COMPLETED,
        content: `Tâche ${mockTask.title} terminée`,
        entityId: mockTask.id,
        entityType: 'task',
      },
    });
  });

  it('should handle string taskId conversion correctly', async () => {
    // Mock task update
    const mockTask = {
      id: 456,
      title: 'Another Task',
      status: TaskStatus.IN_PROGRESS,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const result = await changeTaskStatus('456', TaskStatus.IN_PROGRESS);

    expect(result.success).toBe(true);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 456 },
      data: { status: TaskStatus.IN_PROGRESS },
    });
    expect(prisma.activity.create).toHaveBeenCalledWith({
      data: {
        userId: 'mock-user-id',
        type: ActivityType.TASK_STARTED,
        content: `Tâche ${mockTask.title} démarrée`,
        entityId: mockTask.id,
        entityType: 'task',
      },
    });
  });

  it('should handle invalid taskId gracefully', async () => {
    // Mock database error for invalid ID
    (prisma.task.update as jest.Mock).mockRejectedValue(new Error('Record not found'));

    const result = await changeTaskStatus('999', TaskStatus.COMPLETED);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalledWith('Failed to update task status:', expect.any(Error));
  });

  it('should handle non-numeric taskId', async () => {
    // When taskId is not a valid number
    const result = await changeTaskStatus('invalid-id', TaskStatus.COMPLETED);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle invalid status value', async () => {
    // Mock database error for invalid status
    (prisma.task.update as jest.Mock).mockRejectedValue(new Error('Invalid status value'));

    const result = await changeTaskStatus('123', 'INVALID_STATUS' as TaskStatus);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    // Mock general database error
    (prisma.task.update as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const result = await changeTaskStatus('123', TaskStatus.COMPLETED);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task status');
    expect(console.error).toHaveBeenCalledWith('Failed to update task status:', expect.any(Error));
  });
});
