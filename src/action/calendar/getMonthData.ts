'use server';

import { prisma } from '@/lib/prisma';
import { formatDate } from '@/utils/dateFormatter';
import { CalendarData, CalendarEvent } from '@/app/dashboard/CalendarEvents';
import { requireAuth } from '@/lib/auth';
import { Prisma, Task, UserTask, User, Project } from '@prisma/client';

// Define type for tasks with relations
type TaskWithRelations = Task & {
  project: Project;
  userTasks: (UserTask & {
    user: User;
  })[];
};

export async function getMonthData(
  month: number,
  year: number,
  filterByUser: boolean = false
): Promise<CalendarData> {
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get start day of month (0 = Sunday, 1 = Monday, etc.)
  const startDay = new Date(year, month, 1).getDay();

  // Récupérer les tâches avec deadline dans ce mois
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  // Récupérer l'ID de l'utilisateur authentifié si nécessaire
  const userId = filterByUser ? await requireAuth() : null;

  // Construire la requête de base
  const tasksQuery: Prisma.TaskFindManyArgs = {
    where: {
      deadline: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      project: true,
      userTasks: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      deadline: 'asc',
    },
  };

  // Si on filtre par utilisateur, ajouter une condition pour récupérer uniquement ses tâches
  if (filterByUser && userId && tasksQuery.where) {
    tasksQuery.where.userTasks = {
      some: {
        userId: userId,
      },
    };
  }

  const tasks = (await prisma.task.findMany(tasksQuery)) as TaskWithRelations[];

  // Transformer les tâches en événements
  const events: CalendarEvent[] = tasks.map(task => {
    const deadline = new Date(task.deadline!);

    // Format time as 14:00 - 15:30 (random ending time for demo purposes)
    const hours = deadline.getHours();
    const minutes = deadline.getMinutes();
    const endHour = (hours + 1) % 24;

    const formattedStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const formattedEndTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Récupérer les utilisateurs assignés à cette tâche
    const assignedUsers =
      task.userTasks?.map(ut => ({
        id: ut.user.id,
        name: ut.user.fullName,
        initials: getInitials(ut.user.fullName),
      })) || [];

    return {
      id: task.id,
      title: task.title,
      date: deadline,
      formattedDate: formatDate(deadline),
      timeRange: `${formattedStartTime} - ${formattedEndTime}`,
      type: 'task',
      colorClass: getTaskColorClass(task.priority),
      project: task.project.name,
      assignedUsers,
    };
  });

  // Obtenir les jours du mois qui ont des événements
  const daysWithEvents = [...new Set(events.map(event => new Date(event.date).getDate()))];

  // Formatter le nom du mois
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const today = new Date();

  return {
    currentMonth: monthNames[month],
    currentYear: year,
    daysInMonth,
    startDay,
    today: today.getMonth() === month && today.getFullYear() === year ? today.getDate() : -1,
    currentMonthIndex: month,
    daysWithEvents,
    events: events,
    isFilteredByUser: filterByUser,
  };
}

// Fonction pour déterminer la couleur en fonction de la priorité
function getTaskColorClass(priority: number): string {
  switch (priority) {
    case 3:
      return 'bg-amber-500'; // High priority
    case 2:
      return 'bg-indigo-500'; // Medium priority
    default:
      return 'bg-emerald-500'; // Low priority
  }
}

// Fonction pour obtenir les initiales d'un nom
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}
