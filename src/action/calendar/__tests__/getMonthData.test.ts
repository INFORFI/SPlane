import { getMonthData } from '@/action/calendar/getMonthData';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { formatDate } from '@/utils/dateFormatter';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindMany = jest.fn();
  
  return {
    prisma: {
      task: {
        findMany: mockFindMany
      }
    }
  };
});

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/utils/dateFormatter', () => ({
  formatDate: jest.fn().mockImplementation(date => {
    return `${date.getDate()} ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][date.getMonth()]} ${date.getFullYear()}`;
  }),
}));

describe('getMonthData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to be 2023-07-15
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 6, 15));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return correct calendar data structure for a month', async () => {
    // Mock no tasks for simplicity
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getMonthData(6, 2023, false); // July 2023

    expect(result).toEqual({
      currentMonth: 'Juillet',
      currentYear: 2023,
      daysInMonth: 31, // July has 31 days
      startDay: 6, // July 1, 2023 is a Saturday (6)
      today: 15, // Today is July 15
      currentMonthIndex: 6,
      daysWithEvents: [],
      events: [],
      isFilteredByUser: false,
    });
  });

  it('should return -1 for today if current date is not in the requested month', async () => {
    // Mock no tasks
    (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getMonthData(0, 2023, false); // January 2023

    expect(result.today).toBe(-1); // Not the current month
  });

  it('should transform tasks into calendar events correctly', async () => {
    // Mock tasks with deadlines in July 2023
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        deadline: new Date(2023, 6, 10, 14, 30), // July 10, 2023, 14:30
        priority: 3, // High priority
        project: {
          id: 1,
          name: 'Project 1',
        },
        userTasks: [
          {
            id: 1,
            taskId: 1,
            userId: 1,
            user: {
              id: 1,
              fullName: 'John Doe',
            },
          },
        ],
      },
      {
        id: 2,
        title: 'Task 2',
        deadline: new Date(2023, 6, 15, 9, 0), // July 15, 2023, 09:00
        priority: 2, // Medium priority
        project: {
          id: 2,
          name: 'Project 2',
        },
        userTasks: [
          {
            id: 2,
            taskId: 2,
            userId: 1,
            user: {
              id: 1,
              fullName: 'John Doe',
            },
          },
          {
            id: 3,
            taskId: 2,
            userId: 2,
            user: {
              id: 2,
              fullName: 'Jane Smith',
            },
          },
        ],
      },
    ];
    
    (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

    const result = await getMonthData(6, 2023, false); // July 2023

    expect(result.events).toHaveLength(2);
    expect(result.daysWithEvents).toEqual([10, 15]); // Events on July 10 and 15
    
    // Check first event
    expect(result.events[0]).toEqual({
      id: 1,
      title: 'Task 1',
      date: expect.any(Date),
      formattedDate: expect.any(String),
      timeRange: '14:30 - 15:30',
      type: 'task',
      colorClass: 'bg-amber-500', // High priority
      project: 'Project 1',
      assignedUsers: [
        {
          id: 1,
          name: 'John Doe',
          initials: 'JD',
        },
      ],
    });
    
    // Check second event
    expect(result.events[1]).toEqual({
      id: 2,
      title: 'Task 2',
      date: expect.any(Date),
      formattedDate: expect.any(String),
      timeRange: '09:00 - 10:00',
      type: 'task',
      colorClass: 'bg-indigo-500', // Medium priority
      project: 'Project 2',
      assignedUsers: expect.arrayContaining([
        {
          id: 1,
          name: 'John Doe',
          initials: 'JD',
        },
        {
          id: 2,
          name: 'Jane Smith',
          initials: 'JS',
        },
      ]),
    });
  });

  it('should filter tasks by user when filterByUser is true', async () => {
    // Mock authenticated user
    (requireAuth as jest.Mock).mockResolvedValue(1);
    
    // Mock tasks
    (prisma.task.findMany as jest.Mock).mockImplementation(() => Promise.resolve([]));

    await getMonthData(6, 2023, true);

    // Check that the query includes the user filter
    expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        userTasks: {
          some: {
            userId: 1,
          },
        },
      }),
    }));
  });

  it('should not filter by user when filterByUser is false', async () => {
    // Mock tasks
    (prisma.task.findMany as jest.Mock).mockImplementation(() => Promise.resolve([]));

    await getMonthData(6, 2023, false);

    // Check that requireAuth was not called
    expect(requireAuth).not.toHaveBeenCalled();
    
    // Check that the query does not include the user filter
    expect(prisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.not.objectContaining({
        userTasks: expect.anything(),
      }),
    }));
  });

  it('should assign correct color classes based on task priority', async () => {
    // Mock tasks with different priorities
    const mockTasks = [
      {
        id: 1,
        title: 'High Priority Task',
        deadline: new Date(2023, 6, 10),
        priority: 3,
        project: { id: 1, name: 'Project 1' },
        userTasks: [],
      },
      {
        id: 2,
        title: 'Medium Priority Task',
        deadline: new Date(2023, 6, 11),
        priority: 2,
        project: { id: 1, name: 'Project 1' },
        userTasks: [],
      },
      {
        id: 3,
        title: 'Low Priority Task',
        deadline: new Date(2023, 6, 12),
        priority: 1,
        project: { id: 1, name: 'Project 1' },
        userTasks: [],
      },
    ];
    
    (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

    const result = await getMonthData(6, 2023, false);

    expect(result.events[0].colorClass).toBe('bg-amber-500'); // High priority
    expect(result.events[1].colorClass).toBe('bg-indigo-500'); // Medium priority
    expect(result.events[2].colorClass).toBe('bg-emerald-500'); // Low priority
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await getMonthData(6, 2023, false);
      fail('Expected function to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
}); 