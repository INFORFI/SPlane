'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Layers,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

import StatCard from '@/components/dashboard/StatCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import TaskItem from '@/components/dashboard/TaskItem';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import Link from 'next/link';

import { itemVariants } from '@/utils/ItemVariants';
import type { CalendarData } from '@/app/dashboard/CalendarEvents';
import { useTour } from '@/hook/useTour';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Types pour les données passées depuis le server component
type StatData = {
  icon: string;
  label: string;
  value: string;
  trend: string | null;
  color: string;
};

type TeamMember = {
  initials: string;
};

type ProjectData = {
  id: number;
  name: string;
  description: string;
  progress: number;
  deadline: string;
  team: TeamMember[];
};

type TaskData = {
  id: number;
  title: string;
  project: string;
  priority: string;
  deadline: string;
  status: string;
};

type DashboardProps = {
  dashboardData: {
    stats: StatData[];
    projects: ProjectData[];
    tasks: TaskData[];
  };
  calendarData: CalendarData;
};

export default function HomepageClient({ dashboardData, calendarData }: DashboardProps) {
  const { startTour } = useTour();

  // Mapper les icônes textuelles à des composants réels
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="h-5 w-5 text-[var(--primary)]" />;
      case 'CheckCircle':
        return <CheckCircle className="h-5 w-5 text-[var(--success)]" />;
      case 'AlertCircle':
        return <AlertCircle className="h-5 w-5 text-[var(--warning)]" />;
      case 'Users':
        return <Users className="h-5 w-5 text-[var(--accent)]" />;
      default:
        return null;
    }
  };

  // Enrichir les stats avec les icônes
  const statsWithIcons = dashboardData.stats.map(stat => ({
    ...stat,
    icon: getIcon(stat.icon),
  }));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex items-center justify-between" id="dashboard-header">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tableau de bord</h1>
          <p className="text-[var(--foreground-tertiary)]">Bienvenue, Admin User</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startTour}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors text-[var(--foreground-tertiary)]"
          >
            <HelpCircle className="h-4 w-4" />
            Guide
          </button>

          <Link
            href="/dashboard/projects/create"
            id="new-project-button"
            className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats">
        {statsWithIcons.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects and Tasks section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects section */}
          <motion.div
            variants={itemVariants}
            className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5"
            id="dashboard-projects"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Projets en cours</h2>
              <button className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm font-medium flex items-center gap-1">
                Voir tous
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.projects.map(project => (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Tasks section */}
          <motion.div
            variants={itemVariants}
            className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5"
            id="dashboard-tasks"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Tâches à venir</h2>
              <button className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm font-medium flex items-center gap-1">
                Voir toutes
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              {dashboardData.tasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Calendar and Activity section */}
        <div className="space-y-6">
          {/* Calendar */}
          <MiniCalendar calendarData={calendarData} id="dashboard-calendar" />

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </motion.div>
  );
}
