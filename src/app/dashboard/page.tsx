import { Suspense } from 'react';
import HomepageClient from './HomepageClient';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';
import { getCalendarData } from './CalendarEvents';
export const dynamic = 'force-dynamic';

// Définir le type pour les données du tableau de bord
type DashboardData = {
  stats: {
    icon: string;
    label: string;
    value: string;
    trend: string | null;
    color: string;
  }[];
  projects: {
    id: number;
    name: string;
    description: string;
    progress: number;
    deadline: string;
    team: { initials: string }[];
  }[];
  tasks: {
    id: number;
    title: string;
    project: string;
    priority: string;
    deadline: string;
    status: string;
  }[];
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Homepage />
    </Suspense>
  )
}

async function Homepage() {
  // Récupérer les données depuis la base de données
  const activeProjects = await prisma.project.findMany({
    include: {
      tasks: true,
      owner: true,
    },
  });

  const tasks = await prisma.task.findMany({
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

  // Récupérer les données du calendrier
  const calendarData = await getCalendarData();

  // Statistiques pour le tableau de bord
  const projectCount = await prisma.project.count();
  const completedTasksCount = await prisma.task.count({
    where: { status: TaskStatus.COMPLETED },
  });
  const pendingTasksCount = await prisma.task.count({
    where: {
      OR: [
        { status: TaskStatus.TODO },
        { status: TaskStatus.IN_PROGRESS },
      ],
    },
  });
  const userCount = await prisma.user.count();

  // Formater les données pour le client
  const dashboardData: DashboardData = {
    stats: [
      { 
        icon: 'Layers', 
      label: "Projets actifs", 
        value: projectCount.toString(), 
        trend: null, 
      color: "text-indigo-500"
    },
    { 
        icon: 'CheckCircle', 
      label: "Tâches terminées", 
        value: completedTasksCount.toString(), 
        trend: null, 
      color: "text-emerald-500"
    },
    { 
        icon: 'AlertCircle', 
      label: "Tâches en attente", 
        value: pendingTasksCount.toString(), 
      trend: null, 
      color: "text-amber-500" 
    },
    { 
        icon: 'Users', 
      label: "Membres d'équipe", 
        value: userCount.toString(), 
      trend: null, 
      color: "text-purple-500" 
    },
    ],
    projects: activeProjects.map(project => {
      // Get all unique users assigned to tasks in this project
      const teamMembers = new Set();
      const teamInitials: {initials: string}[] = [];
      
      project.tasks.forEach(task => {
        const taskWithUserTasks = tasks.find(t => t.id === task.id);
        if (taskWithUserTasks && taskWithUserTasks.userTasks) {
          taskWithUserTasks.userTasks.forEach(userTask => {
            const userName = userTask.user.fullName;
            const initials = getInitials(userName);
            if (!teamMembers.has(initials)) {
              teamMembers.add(initials);
              teamInitials.push({ initials });
            }
          });
        }
      });
      
      return {
        id: project.id,
        name: project.name,
        description: project.description || "",
        progress: calculateProjectProgress(project.tasks),
        deadline: project.endDate ? formatDeadline(project.endDate) : "Pas de date limite",
        team: teamInitials,
      };
    }),
    tasks: tasks.map(task => ({
      id: task.id,
      title: task.title,
      project: task.project.name,
      priority: getPriorityLabel(task.priority),
      deadline: task.deadline ? formatDate(task.deadline) : "Pas de date limite",
      status: task.status.toLowerCase(),
    })),
  };
  
  return <HomepageClient dashboardData={dashboardData} calendarData={calendarData} />
}

// Fonctions utilitaires
function calculateProjectProgress(tasks: any[]): number {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  return Math.round((completedTasks / tasks.length) * 100);
}

function formatDeadline(date: Date): string {
  const deadline = new Date(date);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Dépassé";
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays < 30) return `${diffDays} jours restants`;
  
  const diffMonths = Math.ceil(diffDays / 30);
  return `${diffMonths} mois restants`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 3: return "high";
    case 2: return "medium";
    default: return "low";
  }
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('fr-FR', options);
}