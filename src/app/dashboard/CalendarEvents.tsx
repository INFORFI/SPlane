import { prisma } from '@/lib/prisma';
import { formatDate } from '@/utils/dateFormatter';

export type AssignedUser = {
  id: number;
  name: string;
  initials: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  date: Date;
  formattedDate: string;
  timeRange: string;
  type: 'task' | 'meeting';
  colorClass: string;
  project: string;
  assignedUsers: AssignedUser[];
};

export type CalendarData = {
  currentMonth: string;
  currentYear: number;
  daysInMonth: number;
  startDay: number;
  today: number;
  currentMonthIndex: number;
  daysWithEvents: number[];
  events: CalendarEvent[];
  isFilteredByUser?: boolean;
};

export async function getCalendarData(): Promise<CalendarData> {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get start day of month (0 = Sunday, 1 = Monday, etc.)
  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  
  // Récupérer les tâches avec deadline dans ce mois
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  
  const tasks = await prisma.task.findMany({
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
  });
  
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
    const assignedUsers = task.userTasks?.map(ut => ({
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
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  return {
    currentMonth: monthNames[currentMonth],
    currentYear,
    daysInMonth,
    startDay,
    today: today.getDate(),
    currentMonthIndex: currentMonth,
    daysWithEvents,
    events: events, // Retourner tous les événements
    isFilteredByUser: false,
  };
}

// Fonction pour déterminer la couleur en fonction de la priorité
function getTaskColorClass(priority: number): string {
  switch (priority) {
    case 3: return 'bg-amber-500'; // High priority
    case 2: return 'bg-indigo-500'; // Medium priority
    default: return 'bg-emerald-500'; // Low priority
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