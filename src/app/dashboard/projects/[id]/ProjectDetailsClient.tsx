'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  User,
  CheckCircle2,
  MessageSquare,
  Plus,
  Filter,
  MoreHorizontal,
} from 'lucide-react';
import { ProjectWithDetails } from '@/action/projects/getProjectById';
import { TaskStatus } from '@prisma/client';
import { containerVariants, itemVariants } from '@/utils/ItemVariants';
import TaskDetailsModal from '@/components/projects/TasskDetailsModal';
import { TaskWithProject } from '@/action/tasks/getTasks';

interface ProjectDetailsClientProps {
  project: ProjectWithDetails;
}

export default function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);

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
    if (project.tasks.length === 0) return 0;

    const completedTasks = project.tasks.filter(
      task => task.status === TaskStatus.COMPLETED
    ).length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const progress = calculateProgress();

  // Filter tasks based on active tab
  const filteredTasks = project.tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'todo') return task.status === TaskStatus.TODO;
    if (activeTab === 'in-progress') return task.status === TaskStatus.IN_PROGRESS;
    if (activeTab === 'completed') return task.status === TaskStatus.COMPLETED;
    return true;
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Project header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/projects"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <motion.h1 variants={itemVariants} className="text-2xl font-bold text-white">
              {project.name}
            </motion.h1>
          </div>
          <motion.p variants={itemVariants} className="text-zinc-400">
            {project.description || 'Pas de description pour ce projet'}
          </motion.p>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Modifier</span>
            </motion.button>
          </Link>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 bg-rose-600/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium transition-colors"
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Détails du projet</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Période</p>
                    <p className="text-sm font-medium text-white">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Temps restant</p>
                    <p
                      className={`text-sm font-medium ${
                        project.endDate &&
                        getDaysLeft(project.endDate) &&
                        getDaysLeft(project.endDate)! < 7
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {project.endDate
                        ? `${getDaysLeft(project.endDate)} jours restants`
                        : 'Pas de date limite'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Propriétaire</p>
                    <p className="text-sm font-medium text-white">{project.owner.fullName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-white">Progression</p>
                <p
                  className={`text-sm font-medium ${
                    progress >= 75
                      ? 'text-emerald-400'
                      : progress >= 40
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                  }`}
                >
                  {progress}%
                </p>
              </div>

              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    progress >= 75
                      ? 'bg-emerald-500'
                      : progress >= 40
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-zinc-500">
                <p>0%</p>
                <p>100%</p>
              </div>
            </div>
          </div>

          {/* Team members */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Équipe</h2>
              <button className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {project.teamMembers.length > 0 ? (
                project.teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {member.fullName
                        .split(' ')
                        .map(name => name[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.fullName}</p>
                      <p className="text-xs text-zinc-400">{member.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Aucun membre assigné</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tasks panel */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
          {/* Tasks header with actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-semibold text-white">Tâches</h2>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtrer</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle tâche</span>
                </motion.button>
              </div>
            </div>

            {/* Task tabs */}
            <div className="flex border-b border-zinc-800 mb-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setActiveTab('todo')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'todo'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300'
                }`}
              >
                À faire
              </button>
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'in-progress'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300'
                }`}
              >
                En cours
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'completed'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300'
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
                  <CheckCircle2 className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-zinc-500 mb-1">Aucune tâche trouvée</h3>
                  <p className="text-sm text-zinc-600 mb-4 max-w-md mx-auto">
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddTask(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Créer une tâche</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Activity feed */}
          <motion.div
            variants={itemVariants}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Activité récente</h2>

            <div className="space-y-4">
              {project.tasks.length > 0 ? (
                <>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                      {project.teamMembers[0]?.fullName
                        .split(' ')
                        .map(name => name[0])
                        .join('') || 'U'}
                    </div>
                    <div>
                      <p className="text-sm text-white">
                        <span className="font-medium">
                          {project.teamMembers[0]?.fullName || 'Un utilisateur'}
                        </span>{' '}
                        a été assigné à la tâche{' '}
                        <span className="font-medium">{project.tasks[0].title}</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">Il y a 2 jours</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {project.owner.fullName
                        .split(' ')
                        .map(name => name[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm text-white">
                        <span className="font-medium">{project.owner.fullName}</span> a créé le
                        projet <span className="font-medium">{project.name}</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">Il y a 5 jours</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Aucune activité récente</p>
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-zinc-900 p-8 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Créer une tâche</h2>

            <form className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1">
                  Titre
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-zinc-300 mb-1">
                  Date limite
                </label>
                <input
                  id="deadline"
                  type="date"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-zinc-300 mb-1">
                  Priorité
                </label>
                <select
                  id="priority"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="1">Basse</option>
                  <option value="2">Moyenne</option>
                  <option value="3">Haute</option>
                </select>
              </div>

              <div>
                <label htmlFor="assignee" className="block text-sm font-medium text-zinc-300 mb-1">
                  Assigné à
                </label>
                <select
                  id="assignee"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            projectTeam={project.teamMembers}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Task item component to display individual tasks
interface TaskItemProps {
  task: TaskWithProject;
  formatDate: (date: Date | null) => string;
  onClick: () => void;
}

function TaskItem({ task, formatDate, onClick }: TaskItemProps) {
  // Get the assigned user if any
  const assignedUser = task.userTasks[0]?.user;

  // Get status color and text
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Terminée' };
      case TaskStatus.IN_PROGRESS:
        return { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'En cours' };
      case TaskStatus.CANCELED:
        return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Annulée' };
      default:
        return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', label: 'À faire' };
    }
  };

  // Get priority indicator
  const getPriority = (priority: number) => {
    switch (priority) {
      case 3:
        return { color: 'bg-rose-500', label: 'Haute' };
      case 2:
        return { color: 'bg-amber-500', label: 'Moyenne' };
      default:
        return { color: 'bg-emerald-500', label: 'Basse' };
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
      className="p-4 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-colors group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3 items-start">
          <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${priority.color}`}></div>
          <div>
            <h3 className="text-white font-medium">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-zinc-400 line-clamp-1">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center sm:justify-end">
          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-1 text-xs text-zinc-400">
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
              className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs"
            >
              {assignedUser.fullName
                .split(' ')
                .map((name: string) => name[0])
                .join('')}
            </div>
          ) : (
            <div
              title="Non assignée"
              className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-500 text-xs border border-zinc-600"
            >
              ?
            </div>
          )}

          {/* Action button */}
          <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
