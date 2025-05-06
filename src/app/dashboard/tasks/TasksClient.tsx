'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  Plus,
  User,
  CalendarClock,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { TaskWithDetails } from '@/action/tasks/getAssignedTasks';
import { TaskStatus } from '@prisma/client';
import { itemVariants, containerVariants } from '@/utils/ItemVariants';

type TaskFilter = 'all' | 'todo' | 'in-progress' | 'completed' | 'upcoming';

interface TasksClientProps {
  tasks: TaskWithDetails[];
}

export default function TasksClient({ tasks }: TasksClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithDetails[]>(tasks);

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
          task.description?.toLowerCase().includes(query) ||
          false ||
          task.project.name.toLowerCase().includes(query)
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
      case 'upcoming':
        // Tasks with deadlines within the next 7 days that aren't completed
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        filtered = filtered.filter(task => {
          if (!task.deadline || task.status === TaskStatus.COMPLETED) return false;
          const deadline = new Date(task.deadline);
          return deadline >= today && deadline <= nextWeek;
        });
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

    // Count upcoming tasks (deadline within 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const upcomingCount = tasks.filter(task => {
      if (!task.deadline || task.status === TaskStatus.COMPLETED) return false;
      const deadline = new Date(task.deadline);
      return deadline >= today && deadline <= nextWeek;
    }).length;

    return {
      todo: todoCount,
      inProgress: inProgressCount,
      completed: completedCount,
      upcoming: upcomingCount,
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
        return 'High';
      case 2:
        return 'Medium';
      case 1:
        return 'Low';
      default:
        return 'Normal';
    }
  };

  // Get status information (color, label)
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return { color: 'text-[var(--success)]', bg: 'bg-[var(--success-muted)]', label: 'Completed' };
      case TaskStatus.IN_PROGRESS:
        return { color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-muted)]', label: 'In Progress' };
      case TaskStatus.CANCELED:
        return { color: 'text-[var(--foreground-tertiary)]', bg: 'bg-[var(--foreground-muted)]/10', label: 'Canceled' };
      default:
        return { color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-muted)]', label: 'To Do' };
    }
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
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Tasks</h1>
          <p className="text-[var(--foreground-tertiary)]">Manage and track your assigned tasks</p>
        </motion.div>

        <Link href="/dashboard/tasks/create">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Task
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
            placeholder="Search tasks..."
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
            All Tasks
          </button>
          <button
            onClick={() => handleFilterChange('todo')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'todo'
                ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]/50'
            }`}
          >
            To Do
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
            In Progress
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
            Completed
            {taskCounts.completed > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--success-muted)] text-[var(--success)] rounded-full">
                {taskCounts.completed}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterChange('upcoming')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'upcoming'
                ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]/50'
            }`}
          >
            Upcoming
            {taskCounts.upcoming > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--error-muted)] text-[var(--error)] rounded-full">
                {taskCounts.upcoming}
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
                className="bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--border-secondary)] rounded-lg p-4 transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-5 w-5 mt-0.5 rounded-md flex-shrink-0 ${
                        task.status === TaskStatus.COMPLETED ? 'bg-[var(--success-muted)]' : 'bg-[var(--background-tertiary)]'
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
                          <span className="text-[var(--foreground-tertiary)]">{getPriorityLabel(task.priority)}</span>
                        </div>
                      </div>

                      {/* Project name */}
                      <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] mt-1">
                        <Layers className="h-3 w-3" />
                        <span>{task.project.name}</span>
                      </div>

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
                <h3 className="text-xl font-medium text-[var(--foreground-tertiary)] mb-2">No matching tasks found</h3>
                <p className="text-[var(--foreground-muted)] max-w-md mb-4">
                  Nous n&apos;avons pas trouvé de tâches correspondant à votre recherche &quot;
                  {searchQuery}&quot;.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-secondary)] rounded-lg text-sm transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : activeFilter !== 'all' ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-[var(--border-secondary)] mb-4" />
                <h3 className="text-xl font-medium text-[var(--foreground-tertiary)] mb-2">
                  No {activeFilter.replace('-', ' ')} tasks
                </h3>
                <p className="text-[var(--foreground-muted)] max-w-md mb-4">
                  {activeFilter === 'todo' &&
                    "You don't have any tasks to do yet. Create a new task to get started."}
                  {activeFilter === 'in-progress' &&
                    "You don't have any tasks in progress. Start working on a task to see it here."}
                  {activeFilter === 'completed' &&
                    "You haven't completed any tasks yet. Keep up the good work!"}
                  {activeFilter === 'upcoming' &&
                    "You don't have any upcoming tasks due in the next 7 days."}
                </p>
                <button
                  onClick={() => handleFilterChange('all')}
                  className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-secondary)] rounded-lg text-sm transition-colors"
                >
                  View all tasks
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-[var(--border-secondary)] mb-4" />
                <h3 className="text-xl font-medium text-[var(--foreground-tertiary)] mb-2">No tasks assigned to you</h3>
                <p className="text-[var(--foreground-muted)] max-w-md mb-4">
                  Vous n&apos;avez pas de tâches assignées à vous. Créez une nouvelle tâche ou
                  demandez à votre équipe de vous assigner des tâches.
                </p>
                <Link
                  href="/dashboard/tasks/create"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create new task
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task detail modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${getPriorityColor(selectedTask.priority)}`}
                  ></div>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">{selectedTask.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded-full text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  <AlertCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Task description */}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground-tertiary)] mb-2">Description</h3>
                    <p className="text-[var(--foreground)]">
                      {selectedTask.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Project info */}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground-tertiary)] mb-2">Project</h3>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[var(--background-tertiary)] rounded-md">
                        <Layers className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="text-[var(--foreground)] font-medium">{selectedTask.project.name}</p>
                        {selectedTask.project.description && (
                          <p className="text-sm text-[var(--foreground-tertiary)]">
                            {selectedTask.project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task assignees */}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground-tertiary)] mb-2">Assigned to</h3>
                    <div className="space-y-2">
                      {selectedTask.userTasks.map(userTask => (
                        <div
                          key={userTask.id}
                          className="flex items-center gap-3 p-2 bg-[var(--background-tertiary)] rounded-lg"
                        >
                          <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-medium">
                            {userTask.user.fullName
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--foreground)]">
                              {userTask.user.fullName}
                            </p>
                            <p className="text-xs text-[var(--foreground-tertiary)]">{userTask.user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Task details sidebar */}
                <div className="space-y-4">
                  {/* Status */}
                  <div className="p-4 bg-[var(--background-tertiary)] rounded-lg">
                    <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase mb-3">Status</h4>
                    <div
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedTask.status).bg} ${getStatusInfo(selectedTask.status).color}`}
                    >
                      {getStatusInfo(selectedTask.status).label}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="p-4 bg-[var(--background-tertiary)] rounded-lg">
                    <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase mb-3">Priority</h4>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getPriorityColor(selectedTask.priority)}`}
                      ></div>
                      <span className="text-sm text-[var(--foreground)]">
                        {getPriorityLabel(selectedTask.priority)}
                      </span>
                    </div>
                  </div>

                  {/* Deadline */}
                  {selectedTask.deadline && (
                    <div className="p-4 bg-[var(--background-tertiary)] rounded-lg">
                      <h4 className="text-xs font-medium text-[var(--foreground-muted)] uppercase mb-3">Deadline</h4>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-[var(--foreground-tertiary)]" />
                        <span
                          className={`text-sm ${
                            isOverdue(selectedTask.deadline) &&
                            selectedTask.status !== TaskStatus.COMPLETED
                              ? 'text-[var(--error)]'
                              : 'text-[var(--foreground)]'
                          }`}
                        >
                          {new Date(selectedTask.deadline).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-2">
                    {selectedTask.status !== TaskStatus.COMPLETED ? (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--success-muted)] hover:bg-[var(--success-muted)]/80 text-[var(--success)] rounded-lg text-sm font-medium transition-colors">
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as Completed
                      </button>
                    ) : (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary-muted)] hover:bg-[var(--primary-muted)]/80 text-[var(--primary)] rounded-lg text-sm font-medium transition-colors">
                        <AlertCircle className="h-4 w-4" />
                        Mark as Todo
                      </button>
                    )}

                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--border-secondary)] hover:bg-[var(--background-tertiary)] text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors">
                      <User className="h-4 w-4" />
                      Reassign Task
                    </button>

                    {selectedTask.status !== TaskStatus.CANCELED && (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--error-muted)] hover:bg-[var(--error-muted)]/80 text-[var(--error)] rounded-lg text-sm font-medium transition-colors">
                        <AlertCircle className="h-4 w-4" />
                        Cancel Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
