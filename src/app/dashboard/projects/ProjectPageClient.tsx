'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Clock,
  Trash2,
  Edit,
  Users,
  CalendarClock,
  Layers,
} from 'lucide-react';
import { ProjectWithTasks } from '@/action/projects/getProjects';
import { Task } from '@prisma/client';
import { itemVariants, containerVariants } from '@/utils/ItemVariants';
import DeleteProjectModal from '@/components/projects/DeleteProjectModal';

export default function ProjectsPage({ projects }: { projects: ProjectWithTasks[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Calculate progress for each project
  const projectsWithProgress = projects.map(project => {
    const totalTasks = project.tasks.length;

    if (totalTasks === 0) return { ...project, progress: 0 };

    const completedTasks = project.tasks.filter((task: Task) => task.status === 'COMPLETED').length;
    const progress = Math.round((completedTasks / totalTasks) * 100);

    return { ...project, progress };
  });

  // Filter projects based on search and status
  const filteredProjects = projectsWithProgress.filter(project => {
    let matchesSearch = true;
    let matchesStatus = true;

    if (searchQuery) {
      matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    }

    if (filterStatus) {
      if (filterStatus === 'completed') {
        matchesStatus = project.progress === 100;
      } else if (filterStatus === 'in-progress') {
        matchesStatus = project.progress > 0 && project.progress < 100;
      } else if (filterStatus === 'not-started') {
        matchesStatus = project.progress === 0;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const getDaysLeft = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Projets</h1>
          <p className="text-[var(--foreground-tertiary)]">Gérez vos projets et suivez leur progression</p>
        </div>

        <Link href="/dashboard/projects/create">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            Nouveau projet
          </motion.button>
        </Link>
      </div>

      {/* Search and filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--foreground-muted)]" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus || ''}
            onChange={e => setFilterStatus(e.target.value || null)}
            className="px-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="not-started">Non commencé</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>

        </div>
      </motion.div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            formatDate={formatDate}
            getDaysLeft={getDaysLeft}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center p-8 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl"
        >
          <div className="w-16 h-16 bg-[var(--background-tertiary)] rounded-full flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-[var(--foreground-tertiary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground-secondary)] mb-2">Aucun projet trouvé</h3>
          <p className="text-[var(--foreground-muted)] text-center mb-6 max-w-md">
            {searchQuery || filterStatus
              ? "Aucun projet ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres."
              : "Vous n'avez pas encore de projets. Commencez par en créer un nouveau."}
          </p>
          {!searchQuery && !filterStatus && (
            <Link href="/dashboard/projects/create">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4" />
                Nouveau projet
              </motion.button>
            </Link>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

interface ProjectCardProps {
  project: ProjectWithTasks;
  formatDate: (date: Date) => string;
  getDaysLeft: (endDate: Date) => number;
}

function ProjectCard({ project, formatDate, getDaysLeft }: ProjectCardProps) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const handleDeleteProject = () => {
    setOpenDeleteModal(true);
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden flex flex-col"
    >
      <DeleteProjectModal
        projectId={project.id}
        projectName={project.name}
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      />
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-[var(--foreground)] line-clamp-1">
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="hover:text-[var(--primary)] transition-colors"
            >
              {project.name}
            </Link>
          </h3>

          {/* 
          <div className="dropdown-wrapper relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </motion.button>
          </div>
          */}
        </div>

        <p className="text-[var(--foreground-tertiary)] text-sm line-clamp-2 mb-4">{project.description}</p>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--foreground-tertiary)]">Progression</span>
              <span
                className={`font-medium ${
                  project.progress >= 75
                    ? 'text-[var(--success)]'
                    : project.progress >= 25
                      ? 'text-[var(--warning)]'
                      : 'text-[var(--primary)]'
                }`}
              >
                {project.progress}%
              </span>
            </div>

            <div className="w-full h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  project.progress >= 75
                    ? 'bg-[var(--success)]'
                    : project.progress >= 25
                      ? 'bg-[var(--warning)]'
                      : 'bg-[var(--primary)]'
                }`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-[var(--foreground-tertiary)]">
              <CalendarClock className="h-4 w-4 text-[var(--foreground-muted)]" />
              <span className="line-clamp-1">
                {project.startDate ? formatDate(project.startDate) : 'Non définie'} -
                {project.endDate ? formatDate(project.endDate) : 'Non définie'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-[var(--foreground-muted)]" />
              <span
                className={`${
                  project.endDate
                    ? getDaysLeft(project.endDate) < 7
                      ? 'text-[var(--error)]'
                      : 'text-[var(--foreground-tertiary)]'
                    : 'text-[var(--foreground-tertiary)]'
                }`}
              >
                {project.endDate ? getDaysLeft(project.endDate) : 'Non définie'} jours restants
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--foreground-muted)]" />
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 3).map(member => (
              <div
                key={member.id}
                className="h-6 w-6 rounded-full bg-[var(--border-secondary)] border-2 border-[var(--background-secondary)] flex items-center justify-center text-xs text-[var(--foreground)]"
                title={member.fullName}
              >
                {member.fullName
                  .split(' ')
                  .map(name => name[0])
                  .join('')}
              </div>
            ))}
            {project.teamMembers.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-[var(--background-tertiary)] border-2 border-[var(--background-secondary)] flex items-center justify-center text-xs text-[var(--foreground)]">
                +{project.teamMembers.length - 3}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-md hover:bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)] hover:text-[var(--primary)] transition-colors cursor-not-allowed"
            >
              <Edit className="h-4 w-4" />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDeleteProject}
            className="p-1.5 rounded-md hover:bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)] hover:text-[var(--error)] transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
