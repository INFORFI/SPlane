import { createTask } from '@/action/tasks/createTask';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockCreate = jest.fn();
  const mockCreateMany = jest.fn();

  return {
    prisma: {
      task: {
        create: mockCreate,
      },
      userTask: {
        createMany: mockCreateMany,
      },
    },
  };
});

describe('createTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a task successfully without assignees', async () => {
    // Mock task creation
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date('2025-01-01'),
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };
    (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

    const input = {
      title: 'Test Task',
      description: 'Test Description',
      deadline: '2025-01-01',
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };

    const result = await createTask(input);

    expect(result).toEqual(mockTask);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        deadline: expect.any(Date),
        status: 'TODO',
        priority: 1,
        projectId: 1,
      },
    });
    expect(prisma.userTask.createMany).not.toHaveBeenCalled();
  });

  it('should create a task with assignees', async () => {
    // Mock task creation
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date('2025-01-01'),
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };
    (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);
    (prisma.userTask.createMany as jest.Mock).mockResolvedValue({ count: 2 });

    const input = {
      title: 'Test Task',
      description: 'Test Description',
      deadline: '2025-01-01',
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
      assignees: [1, 2],
    };

    const result = await createTask(input);

    expect(result).toEqual(mockTask);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        deadline: expect.any(Date),
        status: 'TODO',
        priority: 1,
        projectId: 1,
      },
    });
    expect(prisma.userTask.createMany).toHaveBeenCalledWith({
      data: [
        { taskId: 1, userId: 1 },
        { taskId: 1, userId: 2 },
      ],
    });
  });

  it('should handle string projectId conversion', async () => {
    // Mock task creation
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date('2025-01-01'),
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 2,
    };
    (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

    const input = {
      title: 'Test Task',
      description: 'Test Description',
      deadline: '2025-01-01',
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: '2', // String projectId
    };

    const result = await createTask(input);

    expect(result).toEqual(mockTask);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        deadline: expect.any(Date),
        status: 'TODO',
        priority: 1,
        projectId: 2, // Should be converted to number
      },
    });
  });

  it('should handle empty description', async () => {
    // Mock task creation
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: null,
      deadline: new Date('2025-01-01'),
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };
    (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

    const input = {
      title: 'Test Task',
      description: '', // Empty description
      deadline: '2025-01-01',
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };

    const result = await createTask(input);

    expect(result).toEqual(mockTask);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Task',
        description: null,
        deadline: expect.any(Date),
        status: 'TODO',
        priority: 1,
        projectId: 1,
      },
    });
  });

  it('should handle empty deadline', async () => {
    // Mock task creation
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      deadline: null,
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };
    (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

    const input = {
      title: 'Test Task',
      description: 'Test Description',
      deadline: '', // Empty deadline
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };

    const result = await createTask(input);

    expect(result).toEqual(mockTask);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        deadline: null,
        status: 'TODO',
        priority: 1,
        projectId: 1,
      },
    });
  });

  it('should handle database errors during task creation', async () => {
    // Mock database error
    (prisma.task.create as jest.Mock).mockRejectedValue(new Error('Database error'));

    const input = {
      title: 'Test Task',
      description: 'Test Description',
      deadline: '2025-01-01',
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };

    const result = await createTask(input);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle database errors during assignee connection', async () => {
    // Mock task creation success but assignee connection failure
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      deadline: new Date('2025-01-01'),
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
    };
    (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);
    (prisma.userTask.createMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    const input = {
      title: 'Test Task',
      description: 'Test Description',
      deadline: '2025-01-01',
      status: 'TODO' as TaskStatus,
      priority: 1,
      projectId: 1,
      assignees: [1, 2],
    };

    const result = await createTask(input);

    expect(result).toBeNull();
    expect(prisma.task.create).toHaveBeenCalled();
    expect(prisma.userTask.createMany).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
