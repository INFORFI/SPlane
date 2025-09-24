'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Search,
  Layers,
  Plus,
  User,
  CalendarClock,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { TaskWithProject } from '@/action/tasks/getTasks';
import { ProjectWithDetails } from '@/action/projects/getProjectById';
import { TaskStatus } from '@prisma/client';
import { itemVariants, containerVariants } from '@/utils/ItemVariants';
import TaskDetailsModal from '@/components/projects/TaskDetailsModal';

type TaskFilter = 'all' | 'todo' | 'in-progress' | 'completed';

interface ProjectTasksClientProps {
  project: ProjectWithDetails;
  tasks: TaskWithProject[];
  initialFilter?: string;
}

export default function ProjectTasksClient({
  project,
  tasks,
  initialFilter,
}: ProjectTasksClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>(() => {
    // Valider et utiliser le filtre initial
    if (initialFilter && ['all', 'todo', 'in-progress', 'completed'].includes(initialFilter)) {
      return initialFilter as TaskFilter;
    }
    return 'all';
  });
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithProject[]>(tasks);

  // Force re-render for animation key
  const [filterKey, setFilterKey] = useState(0);

  // Update filtered tasks when search or filter changes
  useEffect(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'todo':
        filtered = filtered.filter(task => task.status === TaskStatus.TODO);
        break;
      case 'in-progress':
        filtered = filtered.filter(task => task.status === TaskStatus.IN_PROGRESS);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === TaskStatus.COMPLETED);
        break;
      // 'all' case - no additional filtering needed
    }

    setFilteredTasks(filtered);
    setFilterKey(prev => prev + 1); // Force re-render animation
  }, [tasks, searchQuery, activeFilter]);

  // Helper function for filter changes
  const handleFilterChange = (filter: TaskFilter) => {
    if (activeFilter !== filter) {
      setActiveFilter(filter);
    }
  };

  // Get stats for the filter tabs
  const getTaskCounts = () => {
    const todoCount = tasks.filter(task => task.status === TaskStatus.TODO).length;
    const inProgressCount = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const completedCount = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;

    return {
      todo: todoCount,
      inProgress: inProgressCount,
      completed: completedCount,
    };
  };

  const taskCounts = getTaskCounts();

  // Format deadline for display
  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return 'No deadline';

    const date = new Date(deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if deadline is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if deadline is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Otherwise format as day and month
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  // Calculate if a task is overdue
  const isOverdue = (deadline: Date | null) => {
    if (!deadline) return false;

    const today = new Date();
    return new Date(deadline) < today;
  };

  // Get color for task priority
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return 'bg-[var(--error)]';
      case 2:
        return 'bg-[var(--warning)]';
      case 1:
        return 'bg-[var(--success)]';
      default:
        return 'bg-[var(--primary)]';
    }
  };

  // Get label for task priority
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3:
        return 'Haute';
      case 2:
        return 'Moyenne';
      case 1:
        return 'Basse';
      default:
        return 'Normale';
    }
  };

  // Get status information (color, label)
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return {
          color: 'text-[var(--success)]',
          bg: 'bg-[var(--success-muted)]',
          label: 'Terminée',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          color: 'text-[var(--warning)]',
          bg: 'bg-[var(--warning-muted)]',
          label: 'En cours',
        };
      case TaskStatus.CANCELED:
        return {
          color: 'text-[var(--foreground-tertiary)]',
          bg: 'bg-[var(--foreground-muted)]/10',
          label: 'Annulée',
        };
      default:
        return {
          color: 'text-[var(--primary)]',
          bg: 'bg-[var(--primary-muted)]',
          label: 'À faire',
        };
    }
  };

  // Handle task update from TaskDetailsModal
  const handleTaskUpdate = (updatedTask: TaskWithProject) => {
    // This would require a state update mechanism or a refresh
    // For now, we'll keep it as a placeholder
    console.log('Task updated:', updatedTask);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Tâches - {project.name}</h1>
            <p className="text-[var(--foreground-tertiary)]">
              Toutes les tâches du projet {project.name}
            </p>
          </div>
        </motion.div>

        <Link href={`/dashboard/tasks/create?projectId=${project.id}`}>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle tâche
          </motion.button>
        </Link>
      </div>

      {/* Search and filters */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--foreground-muted)]" />
          </div>
          <input
            type="text"
            placeholder="Rechercher des tâches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
          />
        </div>

        <div className="flex overflow-x-auto pb-2 gap-1 border-b border-[var(--border)]">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]/50'
            }`}
          >
            Toutes ({tasks.length})
          </button>
          <button
            onClick={() => handleFilterChange('todo')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'todo'
                ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]/50'
            }`}
          >
            À faire
            {taskCounts.todo > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--primary-muted)] text-[var(--primary)] rounded-full">
                {taskCounts.todo}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterChange('in-progress')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'in-progress'
                ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]/50'
            }`}
          >
            En cours
            {taskCounts.inProgress > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--warning-muted)] text-[var(--warning)] rounded-full">
                {taskCounts.inProgress}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterChange('completed')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'completed'
                ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]/50'
            }`}
          >
            Terminées
            {taskCounts.completed > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--success-muted)] text-[var(--success)] rounded-full">
                {taskCounts.completed}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Tasks list */}
      <AnimatePresence mode="wait">
        {filteredTasks.length > 0 ? (
          <motion.div
            key={`task-list-${filterKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {filteredTasks.map(task => (
              <motion.div
                key={`task-${task.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--border-secondary)] rounded-lg p-4 transition-colors cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-5 w-5 mt-0.5 rounded-md flex-shrink-0 ${
                        task.status === TaskStatus.COMPLETED
                          ? 'bg-[var(--success-muted)]'
                          : 'bg-[var(--background-tertiary)]'
                      } border ${
                        task.status === TaskStatus.COMPLETED
                          ? 'border-[var(--success)]'
                          : 'border-[var(--border-secondary)]'
                      } flex items-center justify-center`}
                    >
                      {task.status === TaskStatus.COMPLETED && (
                        <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-medium ${
                            task.status === TaskStatus.COMPLETED
                              ? 'text-[var(--foreground-tertiary)] line-through'
                              : 'text-[var(--foreground)]'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {/* Priority indicator */}
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-[var(--background-tertiary)]">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${getPriorityColor(task.priority)}`}
                          ></div>
                          <span className="text-[var(--foreground-tertiary)]">
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>

                      {/* Assigned user */}
                      {task.userTasks.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] mt-1">
                          <User className="h-3 w-3" />
                          <span>{task.userTasks.map(ut => ut.user.fullName).join(', ')}</span>
                        </div>
                      )}

                      {task.description && (
                        <p className="text-sm text-[var(--foreground-tertiary)] mt-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Deadline */}
                    {task.deadline && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isOverdue(task.deadline) && task.status !== TaskStatus.COMPLETED
                            ? 'text-[var(--error)]'
                            : 'text-[var(--foreground-tertiary)]'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDeadline(task.deadline)}</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(task.status).bg} ${getStatusInfo(task.status).color}`}
                    >
                      {getStatusInfo(task.status).label}
                    </div>

                    {/* Task actions */}
                    <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={`empty-state-${filterKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-[var(--border-secondary)] mb-4" />
                <h3 className="text-xl font-medium text-[var(--foreground-tertiary)] mb-2">
                  Aucune tâche trouvée
                </h3>
                <p className="text-[var(--foreground-muted)] max-w-md mb-4">
                  Nous n'avons pas trouvé de tâches correspondant à votre recherche "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-secondary)] rounded-lg text-sm transition-colors"
                >
                  Effacer la recherche
                </button>
              </>
            ) : activeFilter !== 'all' ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-[var(--border-secondary)] mb-4" />
                <h3 className="text-xl font-medium text-[var(--foreground-tertiary)] mb-2">
                  Aucune tâche{' '}
                  {activeFilter === 'todo'
                    ? 'à faire'
                    : activeFilter === 'in-progress'
                      ? 'en cours'
                      : 'terminée'}
                </h3>
                <p className="text-[var(--foreground-muted)] max-w-md mb-4">
                  {activeFilter === 'todo' && "Il n'y a pas de tâches à faire dans ce projet."}
                  {activeFilter === 'in-progress' &&
                    "Il n'y a pas de tâches en cours dans ce projet."}
                  {activeFilter === 'completed' && "Aucune tâche n'a été terminée dans ce projet."}
                </p>
                <button
                  onClick={() => handleFilterChange('all')}
                  className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-secondary)] rounded-lg text-sm transition-colors"
                >
                  Voir toutes les tâches
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-[var(--border-secondary)] mb-4" />
                <h3 className="text-xl font-medium text-[var(--foreground-tertiary)] mb-2">
                  Aucune tâche dans ce projet
                </h3>
                <p className="text-[var(--foreground-muted)] max-w-md mb-4">
                  Ce projet n'a pas encore de tâches. Créez une nouvelle tâche pour commencer.
                </p>
                <Link
                  href={`/dashboard/tasks/create?projectId=${project.id}`}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Créer une tâche
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task detail modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            projectTeam={project.teamMembers}
            formatDate={date =>
              date
                ? new Date(date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Non définie'
            }
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
