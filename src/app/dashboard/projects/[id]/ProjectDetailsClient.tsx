'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  MessageSquare,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import { ProjectWithDetails } from '@/action/projects/getProjectById';
import { TaskStatus } from '@prisma/client';
import { containerVariants, itemVariants } from '@/utils/ItemVariants';
import TaskDetailsModal from '@/components/projects/TaskDetailsModal';
import { TaskWithProject } from '@/action/tasks/getTasks';
import DeleteProjectModal from '@/components/projects/DeleteProjectModal';
import TeamMemberSection from '@/components/projects/TeamMemberSection';

interface ProjectDetailsClientProps {
  project: ProjectWithDetails;
}

export default function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [tasks, setTasks] = useState<TaskWithProject[]>(project.tasks as TaskWithProject[]);

  // Format dates for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate days remaining until deadline
  const getDaysLeft = (endDate: Date | null) => {
    if (!endDate) return null;

    const today = new Date();
    const diffTime = new Date(endDate).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Calculate project progress
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const progress = calculateProgress();

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'todo') return task.status === TaskStatus.TODO;
    if (activeTab === 'in-progress') return task.status === TaskStatus.IN_PROGRESS;
    if (activeTab === 'completed') return task.status === TaskStatus.COMPLETED;
    return true;
  });

  const handleDeleteProject = () => {
    setOpenDeleteModal(true);
  };

  // Handle task update from TaskDetailsModal
  const handleTaskUpdate = (updatedTask: TaskWithProject) => {
    setTasks(currentTasks =>
      currentTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <DeleteProjectModal
        projectId={project.id}
        projectName={project.name}
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      />
      {/* Project header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/projects"
              className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold text-[var(--foreground)]"
            >
              {project.name}
            </motion.h1>
          </div>
          <motion.p variants={itemVariants} className="text-[var(--foreground-tertiary)]">
            {project.description || 'Pas de description pour ce projet'}
          </motion.p>
        </div>

        <div className="flex gap-2">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteProject}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--error-muted)] hover:bg-[var(--error-muted)]/70 text-[var(--error)] rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Supprimer</span>
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project info panel */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          {/* Project details card */}
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Détails du projet
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[var(--primary-muted)] p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-tertiary)]">Période</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[var(--warning-muted)] p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-tertiary)]">Temps restant</p>
                    <p
                      className={`text-sm font-medium ${
                        project.endDate &&
                        getDaysLeft(project.endDate) &&
                        getDaysLeft(project.endDate)! < 7
                          ? 'text-[var(--error)]'
                          : 'text-[var(--foreground)]'
                      }`}
                    >
                      {project.endDate
                        ? `${getDaysLeft(project.endDate)} jours restants`
                        : 'Pas de date limite'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[var(--success-muted)] p-2 rounded-lg">
                    <User className="h-5 w-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--foreground-tertiary)]">Propriétaire</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {project.owner.fullName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-[var(--foreground)]">Progression</p>
                <p
                  className={`text-sm font-medium ${
                    progress >= 75
                      ? 'text-[var(--success)]'
                      : progress >= 40
                        ? 'text-[var(--warning)]'
                        : 'text-[var(--primary)]'
                  }`}
                >
                  {progress}%
                </p>
              </div>

              <div className="w-full h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    progress >= 75
                      ? 'bg-[var(--success)]'
                      : progress >= 40
                        ? 'bg-[var(--warning)]'
                        : 'bg-[var(--primary)]'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                <p>0%</p>
                <p>100%</p>
              </div>
            </div>
          </div>

          {/* Team members */}
          <TeamMemberSection project={project} />
        </motion.div>

        {/* Tasks panel */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
          {/* Tasks header with actions */}
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Tâches</h2>

              <div className="flex gap-2">
                <Link href={`/dashboard/tasks/create?projectId=${project.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nouvelle tâche</span>
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Task tabs */}
            <div className="flex border-b border-[var(--border)] mb-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setActiveTab('todo')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'todo'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]'
                }`}
              >
                À faire
              </button>
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'in-progress'
                    ? 'border-[var(--warning)] text-[var(--warning)]'
                    : 'border-transparent text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]'
                }`}
              >
                En cours
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'completed'
                    ? 'border-[var(--success)] text-[var(--success)]'
                    : 'border-transparent text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)]'
                }`}
              >
                Terminées
              </button>
            </div>

            {/* Tasks list */}
            <AnimatePresence mode="wait">
              {filteredTasks.length > 0 ? (
                <motion.div
                  key="tasks-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task as TaskWithProject}
                      formatDate={formatDate}
                      onClick={() => setSelectedTask(task as TaskWithProject)}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-tasks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10"
                >
                  <CheckCircle2 className="h-12 w-12 text-[var(--foreground-muted)] mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-[var(--foreground-tertiary)] mb-1">
                    Aucune tâche trouvée
                  </h3>
                  <p className="text-sm text-[var(--foreground-tertiary)] mb-4 max-w-md mx-auto">
                    {activeTab !== 'all'
                      ? `Il n'y a pas de tâches dans la catégorie "${
                          activeTab === 'todo'
                            ? 'À faire'
                            : activeTab === 'in-progress'
                              ? 'En cours'
                              : 'Terminées'
                        }".`
                      : "Aucune tâche n'a été créée pour ce projet."}
                  </p>
                  <Link
                    href={`/dashboard/tasks/create?projectId=${project.id}`}
                    className="cursor-default"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors mx-auto cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Créer une tâche</span>
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Activity feed */}
          <motion.div
            variants={itemVariants}
            className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Activité récente
            </h2>

            <div className="space-y-4">
              {tasks.length > 0 ? (
                <>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--success)] flex items-center justify-center text-[var(--success-foreground)] text-sm font-medium">
                      {project.teamMembers[0]?.fullName
                        .split(' ')
                        .map(name => name[0])
                        .join('') || 'U'}
                    </div>
                    <div>
                      <p className="text-sm text-[var(--foreground)]">
                        <span className="font-medium">
                          {project.teamMembers[0]?.fullName || 'Un utilisateur'}
                        </span>{' '}
                        a été assigné à la tâche{' '}
                        <span className="font-medium">{tasks[0]?.title || 'sans titre'}</span>
                      </p>
                      <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                        Il y a 2 jours
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-medium">
                      {project.owner.fullName
                        .split(' ')
                        .map(name => name[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm text-[var(--foreground)]">
                        <span className="font-medium">{project.owner.fullName}</span> a créé le
                        projet <span className="font-medium">{project.name}</span>
                      </p>
                      <p className="text-xs text-[var(--foreground-tertiary)] mt-1">
                        Il y a 5 jours
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-8 w-8 text-[var(--foreground-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--foreground-muted)]">Aucune activité récente</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Add task modal */}
      {showAddTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-[var(--background-tertiary)] bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-[var(--background-secondary)] p-8 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Créer une tâche</h2>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                >
                  Titre
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full px-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                >
                  Date limite
                </label>
                <input
                  id="deadline"
                  type="date"
                  className="w-full px-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                >
                  Priorité
                </label>
                <select
                  id="priority"
                  className="w-full px-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                >
                  <option value="1">Basse</option>
                  <option value="2">Moyenne</option>
                  <option value="3">Haute</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignee"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                >
                  Assigné à
                </label>
                <select
                  id="assignee"
                  className="w-full px-4 py-2 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                >
                  <option value="">Sélectionner un membre</option>
                  {project.teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] rounded-lg text-sm font-medium text-[var(--foreground-secondary)] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Annuler
                </motion.button>

                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Créer la tâche
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Task details modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            projectTeam={project.teamMembers}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type TaskItemProps = {
  task: TaskWithProject;
  formatDate: (date: Date | null) => string;
  onClick: () => void;
};

function TaskItem({ task, formatDate, onClick }: TaskItemProps) {
  const assignedUser = task.userTasks[0]?.user;

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return {
          bg: 'bg-[var(--success-muted)]',
          text: 'text-[var(--success)]',
          label: 'Terminée',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          bg: 'bg-[var(--warning-muted)]',
          text: 'text-[var(--warning)]',
          label: 'En cours',
        };
      case TaskStatus.CANCELED:
        return {
          bg: 'bg-[var(--foreground-muted)]/10',
          text: 'text-[var(--foreground-tertiary)]',
          label: 'Annulée',
        };
      default:
        return { bg: 'bg-[var(--primary-muted)]', text: 'text-[var(--primary)]', label: 'À faire' };
    }
  };

  // Get priority indicator with CSS variables
  const getPriority = (priority: number) => {
    switch (priority) {
      case 3:
        return { color: 'bg-[var(--error)]', label: 'Haute' };
      case 2:
        return { color: 'bg-[var(--warning)]', label: 'Moyenne' };
      default:
        return { color: 'bg-[var(--success)]', label: 'Basse' };
    }
  };

  const status = getStatusColor(task.status);
  const priority = getPriority(task.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 border border-[var(--border)] hover:border-[var(--border-secondary)] rounded-lg transition-colors group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3 items-start">
          <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${priority.color}`}></div>
          <div>
            <h3 className="text-[var(--foreground)] font-medium">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-[var(--foreground-tertiary)] line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center sm:justify-end">
          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-1 text-xs text-[var(--foreground-tertiary)]">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(task.deadline)}</span>
            </div>
          )}

          {/* Status badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
          >
            {status.label}
          </div>

          {/* Assigned user */}
          {assignedUser ? (
            <div
              title={assignedUser.fullName}
              className="h-6 w-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-xs"
            >
              {assignedUser.fullName
                .split(' ')
                .map((name: string) => name[0])
                .join('')}
            </div>
          ) : (
            <div
              title="Non assignée"
              className="h-6 w-6 rounded-full bg-[var(--border-secondary)] flex items-center justify-center text-[var(--foreground-muted)] text-xs border border-[var(--border)]"
            >
              ?
            </div>
          )}

          {/* Action button */}
          <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
