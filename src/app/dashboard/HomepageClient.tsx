"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Filter,
  ArrowRight
} from 'lucide-react';

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
      staggerChildren: 0.1
    }
  }
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
      case 'Layers': return <Layers className="h-5 w-5 text-indigo-500" />;
      case 'CheckCircle': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'AlertCircle': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'Users': return <Users className="h-5 w-5 text-purple-500" />;
      default: return null;
    }
  };

  // Enrichir les stats avec les icônes
  const statsWithIcons = dashboardData.stats.map(stat => ({
    ...stat,
    icon: getIcon(stat.icon)
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
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-zinc-400">Bienvenue, Admin User</p>
        </div>
        
        <Link href="/dashboard/projects/create" className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors">
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
          <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Projets en cours</h2>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                Voir tous
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.projects.map((project, index) => (
                <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>
          </motion.div>
          
          {/* Tasks section */}
          <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Tâches à venir</h2>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                Voir toutes
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              {dashboardData.tasks.map((task, index) => (
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
          <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Activité récente</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  JD
                </div>
                <div>
                  <p className="text-sm text-white">
                    <span className="font-medium">John Doe</span> a terminé la tâche <span className="font-medium">Create API endpoints</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Il y a 2 heures</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  JS
                </div>
                <div>
                  <p className="text-sm text-white">
                    <span className="font-medium">Jane Smith</span> a commencé la tâche <span className="font-medium">Implement responsive layout</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Il y a 5 heures</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                  AU
                </div>
                <div>
                  <p className="text-sm text-white">
                    <span className="font-medium">Admin User</span> a créé un nouveau projet <span className="font-medium">Mobile App Development</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Hier</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}