import updateTask from '@/action/tasks/updateTask';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockUpdate = jest.fn();
  const mockDeleteMany = jest.fn();
  const mockCreate = jest.fn();

  return {
    prisma: {
      task: {
        update: mockUpdate,
      },
      userTask: {
        deleteMany: mockDeleteMany,
        create: mockCreate,
      },
    },
  };
});

describe('updateTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update task successfully without changing assignee', async () => {
    // Mock task update
    const mockTask = {
      id: 123,
      title: 'Updated Task',
      description: 'Updated Description',
      deadline: new Date('2025-02-01'),
      status: 'IN_PROGRESS' as TaskStatus,
      priority: 2,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const updateData = {
      title: 'Updated Task',
      description: 'Updated Description',
      deadline: new Date('2025-02-01'),
      status: 'IN_PROGRESS' as TaskStatus,
      priority: 2,
    };

    const result = await updateTask(123, updateData);

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: updateData,
    });
    expect(prisma.userTask.deleteMany).not.toHaveBeenCalled();
    expect(prisma.userTask.create).not.toHaveBeenCalled();
  });

  it('should update task with string taskId', async () => {
    // Mock task update
    const mockTask = {
      id: 456,
      title: 'Another Task',
      status: 'COMPLETED' as TaskStatus,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const updateData = {
      title: 'Another Task',
      status: 'COMPLETED' as TaskStatus,
    };

    const result = await updateTask('456', updateData);

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 456 },
      data: updateData,
    });
  });

  it('should update task and remove assignee', async () => {
    // Mock successful operations
    const mockTask = {
      id: 123,
      title: 'Task',
      status: 'TODO' as TaskStatus,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);
    (prisma.userTask.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

    const updateData = {
      title: 'Task',
      assigneeId: '', // Empty string to remove assignee
    };

    const result = await updateTask(123, updateData);

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: { title: 'Task' },
    });
    expect(prisma.userTask.deleteMany).toHaveBeenCalledWith({
      where: { taskId: 123 },
    });
    expect(prisma.userTask.create).not.toHaveBeenCalled();
  });

  it('should update task and change assignee', async () => {
    // Mock successful operations
    const mockTask = {
      id: 123,
      title: 'Task',
      status: 'TODO' as TaskStatus,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);
    (prisma.userTask.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.userTask.create as jest.Mock).mockResolvedValue({ userId: 789, taskId: 123 });

    const updateData = {
      title: 'Task',
      assigneeId: '789', // New assignee
    };

    const result = await updateTask(123, updateData);

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: { title: 'Task' },
    });
    expect(prisma.userTask.deleteMany).toHaveBeenCalledWith({
      where: { taskId: 123 },
    });
    expect(prisma.userTask.create).toHaveBeenCalledWith({
      data: {
        userId: 789,
        taskId: 123,
      },
    });
  });

  it('should handle partial updates correctly', async () => {
    // Mock task update
    const mockTask = {
      id: 123,
      title: 'Original Title',
      description: 'Updated Description',
      status: 'TODO' as TaskStatus,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const updateData = {
      description: 'Updated Description',
    };

    const result = await updateTask(123, updateData);

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: updateData,
    });
  });

  it('should handle null values for optional fields', async () => {
    // Mock task update
    const mockTask = {
      id: 123,
      title: 'Task',
      description: null,
      deadline: null,
      status: 'TODO' as TaskStatus,
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);

    const updateData = {
      description: null,
      deadline: null,
    };

    const result = await updateTask(123, updateData);

    expect(result.success).toBe(true);
    expect(result.task).toEqual(mockTask);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 123 },
      data: updateData,
    });
  });

  it('should handle task update failure', async () => {
    // Mock database error
    (prisma.task.update as jest.Mock).mockRejectedValue(new Error('Database error'));

    const updateData = {
      title: 'Updated Task',
    };

    const result = await updateTask(123, updateData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task');
    expect(console.error).toHaveBeenCalledWith('Failed to update task:', expect.any(Error));
  });

  it('should handle assignee update failure', async () => {
    // Mock task update success but assignee update failure
    const mockTask = {
      id: 123,
      title: 'Task',
    };
    (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);
    (prisma.userTask.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.userTask.create as jest.Mock).mockRejectedValue(new Error('User not found'));

    const updateData = {
      title: 'Task',
      assigneeId: '999', // Invalid user ID
    };

    const result = await updateTask(123, updateData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update task');
    expect(console.error).toHaveBeenCalled();
  });
});
