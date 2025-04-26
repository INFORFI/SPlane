'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CalendarDays,
  Trash2,
  Edit,
  MoreHorizontal,
  Users,
  XCircle,
  CalendarClock,
  Layers,
} from 'lucide-react';
import { ProjectWithTasks } from '@/action/projects/getProjects';
import { Task } from '@prisma/client';
import { itemVariants, containerVariants } from '@/utils/ItemVariants';

export default function ProjectsPage({ projects }: { projects: ProjectWithTasks[] }) {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
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

  const handleCreateProject = () => {
    setIsCreatingProject(true);
  };

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
          <h1 className="text-2xl font-bold text-white">Projets</h1>
          <p className="text-zinc-400">Gérez vos projets et suivez leur progression</p>
        </div>

        <motion.button
          onClick={handleCreateProject}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </motion.button>
      </div>

      {/* Search and filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus || ''}
            onChange={e => setFilterStatus(e.target.value || null)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="not-started">Non commencé</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Plus de filtres
          </motion.button>
        </div>
      </motion.div>

      {/* Create project form */}
      {isCreatingProject && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Créer un nouveau projet</h2>
            <button
              onClick={() => setIsCreatingProject(false)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-zinc-300 mb-1">
                Nom du projet
              </label>
              <input
                id="projectName"
                type="text"
                placeholder="Saisissez le nom du projet"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="projectDescription"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="projectDescription"
                rows={3}
                placeholder="Décrivez votre projet"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-zinc-300 mb-1">
                  Date de début
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="startDate"
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-zinc-300 mb-1">
                  Date de fin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    id="endDate"
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <motion.button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Annuler
              </motion.button>

              <motion.button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Créer le projet
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

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
          className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl"
        >
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">Aucun projet trouvé</h3>
          <p className="text-zinc-500 text-center mb-6 max-w-md">
            {searchQuery || filterStatus
              ? "Aucun projet ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres."
              : "Vous n'avez pas encore de projets. Commencez par en créer un nouveau."}
          </p>
          {!searchQuery && !filterStatus && (
            <motion.button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4" />
              Nouveau projet
            </motion.button>
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
  return (
    <motion.div
      variants={itemVariants}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-white line-clamp-1">
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="hover:text-indigo-400 transition-colors"
            >
              {project.name}
            </Link>
          </h3>

          <div className="dropdown-wrapper relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{project.description}</p>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">Progression</span>
              <span
                className={`font-medium ${
                  project.progress >= 75
                    ? 'text-emerald-400'
                    : project.progress >= 25
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                }`}
              >
                {project.progress}%
              </span>
            </div>

            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  project.progress >= 75
                    ? 'bg-emerald-500'
                    : project.progress >= 25
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                }`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <CalendarClock className="h-4 w-4 text-zinc-500" />
              <span className="line-clamp-1">
                {project.startDate ? formatDate(project.startDate) : 'Non définie'} -
                {project.endDate ? formatDate(project.endDate) : 'Non définie'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span
                className={`${
                  project.endDate
                    ? getDaysLeft(project.endDate) < 7
                      ? 'text-rose-400'
                      : 'text-zinc-400'
                    : 'text-zinc-400'
                }`}
              >
                {project.endDate ? getDaysLeft(project.endDate) : 'Non définie'} jours restants
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-zinc-500" />
          <div className="flex -space-x-2">
            {project.teamMembers.slice(0, 3).map(member => (
              <div
                key={member.id}
                className="h-6 w-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs text-white"
                title={member.fullName}
              >
                {member.fullName
                  .split(' ')
                  .map(name => name[0])
                  .join('')}
              </div>
            ))}
            {project.teamMembers.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-white">
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
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
