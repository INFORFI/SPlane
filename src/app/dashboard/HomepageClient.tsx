'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Layers, CheckCircle, AlertCircle, Plus, ArrowRight } from 'lucide-react';

import StatCard from '@/components/dashboard/StatCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import TaskItem from '@/components/dashboard/TaskItem';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import Link from 'next/link';

import { itemVariants } from '@/utils/ItemVariants';
import type { CalendarData } from '@/app/dashboard/CalendarEvents';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tableau de bord</h1>
          <p className="text-[var(--foreground-tertiary)]">Bienvenue, Admin User</p>
        </div>

        <Link
          href="/dashboard/projects/create"
          className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <MiniCalendar calendarData={calendarData} />

          {/* Activity Feed */}
          <motion.div
            variants={itemVariants}
            className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Activité récente</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-medium">
                  JD
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    <span className="font-medium">John Doe</span> a terminé la tâche{' '}
                    <span className="font-medium">Create API endpoints</span>
                  </p>
                  <p className="text-xs text-[var(--foreground-tertiary)] mt-1">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)] text-sm font-medium">
                  JS
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    <span className="font-medium">Jane Smith</span> a commencé la tâche{' '}
                    <span className="font-medium">Implement responsive layout</span>
                  </p>
                  <p className="text-xs text-[var(--foreground-tertiary)] mt-1">Il y a 5 heures</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--success)] flex items-center justify-center text-[var(--success-foreground)] text-sm font-medium">
                  AU
                </div>
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    <span className="font-medium">Admin User</span> a créé un nouveau projet{' '}
                    <span className="font-medium">Mobile App Development</span>
                  </p>
                  <p className="text-xs text-[var(--foreground-tertiary)] mt-1">Hier</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
