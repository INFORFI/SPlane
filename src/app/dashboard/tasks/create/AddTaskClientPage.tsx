'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Layers,
  Save,
  User,
} from 'lucide-react';
import { TaskStatus, User as UserType } from '@prisma/client';
import TeamMember from '@/components/dashboard/TeamMembers/TeamMember';
import { containerVariants, itemVariants } from '@/utils/ItemVariants';
import { createTask } from '@/action/tasks/createTask';
import { toast } from 'react-toastify';

// Define types based on your Prisma schema
type Project = {
  id: number;
  name: string;
  description?: string | null;
  ownerId: number;
};

const NewTaskPage = ({
  projects = [],
  users = [],
  projectId = null,
}: {
  projects: Project[];
  users: UserType[];
  projectId?: number | null;
}) => {
  // Task form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    status: TaskStatus.TODO,
    priority: 2, // Medium priority as default
    projectId: projectId || '',
    assignees: [] as number[],
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage] = useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field if any
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Toggle assignee selection
  const toggleAssignee = (userId: number) => {
    setFormData(prev => {
      const newAssignees = prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId];

      return { ...prev, assignees: newAssignees };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Veuillez sélectionner un projet';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'La date limite est obligatoire';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Submit form
    try {
      setIsSubmitting(true);

      const response = await createTask(formData);

      if (!response) {
        toast.error('Une erreur est survenue lors de la création de la tâche');
      } else {
        toast.success('La tâche a été créée avec succès');
      }
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue lors de la création de la tâche' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get priority label and color
  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 3:
        return { label: 'Haute', color: 'text-[var(--error)]' };
      case 2:
        return { label: 'Moyenne', color: 'text-[var(--warning)]' };
      case 1:
        return { label: 'Basse', color: 'text-[var(--success)]' };
      default:
        return { label: 'Moyenne', color: 'text-[var(--warning)]' };
    }
  };

  // Get status label and color
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return {
          label: 'Terminée',
          color: 'text-[var(--success)]',
          bg: 'bg-[var(--success-muted)]',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          label: 'En cours',
          color: 'text-[var(--warning)]',
          bg: 'bg-[var(--warning-muted)]',
        };
      case TaskStatus.CANCELED:
        return {
          label: 'Annulée',
          color: 'text-[var(--foreground-muted)]',
          bg: 'bg-[var(--foreground-muted)]/10',
        };
      default:
        return {
          label: 'À faire',
          color: 'text-[var(--primary)]',
          bg: 'bg-[var(--primary-muted)]',
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pb-12 max-w-4xl mx-auto"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={
            formData.projectId ? `/dashboard/projects/${formData.projectId}` : '/dashboard/tasks'
          }
          className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-[var(--foreground)]">
          Nouvelle tâche
        </motion.h1>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 p-4 rounded-lg bg-[var(--success-muted)] border border-[var(--success)]/20 flex items-center gap-3 text-[var(--success)]"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>La tâche a été créée avec succès!</span>
        </motion.div>
      )}

      {/* Main form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
      >
        {/* Form header */}
        <div className="bg-[var(--background-tertiary)]/50 px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-medium text-[var(--foreground)]">Informations de la tâche</h2>
          <p className="text-sm text-[var(--foreground-tertiary)]">
            Créez une nouvelle tâche pour votre projet
          </p>
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-6">
          {/* Title and Project row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title field */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[var(--foreground-secondary)]"
              >
                Titre <span className="text-[var(--error)]">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nom de la tâche"
                className={`w-full px-4 py-2.5 bg-[var(--input)] border ${errors.title ? 'border-[var(--error)]' : 'border-[var(--border-secondary)]'} rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent`}
              />
              {errors.title && <p className="text-[var(--error)] text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Project field */}
            <div className="space-y-2">
              <label
                htmlFor="projectId"
                className="block text-sm font-medium text-[var(--foreground-secondary)]"
              >
                Projet <span className="text-[var(--error)]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Layers className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2.5 bg-[var(--input)] border ${errors.projectId ? 'border-[var(--error)]' : 'border-[var(--border-secondary)]'} rounded-lg text-[var(--foreground)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent`}
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
              </div>
              {errors.projectId && (
                <p className="text-[var(--error)] text-xs mt-1">{errors.projectId}</p>
              )}
            </div>
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[var(--foreground-secondary)]"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Description détaillée de la tâche"
              className="w-full px-4 py-2.5 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>

          {/* Deadline, Status, Priority row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Deadline field */}
            <div className="space-y-2">
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-[var(--foreground-secondary)]"
              >
                Date limite <span className="text-[var(--error)]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[var(--input)] border ${errors.deadline ? 'border-[var(--error)]' : 'border-[var(--border-secondary)]'} rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent`}
                />
              </div>
              {errors.deadline && (
                <p className="text-[var(--error)] text-xs mt-1">{errors.deadline}</p>
              )}
            </div>

            {/* Status field */}
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-[var(--foreground-secondary)]"
              >
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
              >
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>
                    {getStatusInfo(status as TaskStatus).label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority field */}
            <div className="space-y-2">
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-[var(--foreground-secondary)]"
              >
                Priorité
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
              >
                <option value={1}>Basse</option>
                <option value={2}>Moyenne</option>
                <option value={3}>Haute</option>
              </select>
            </div>
          </div>

          {/* Assignees field */}
          <TeamMember
            users={users}
            formData={{ ...formData, teamMembers: formData.assignees }}
            toggleTeamMember={toggleAssignee}
          />

          {/* General error message */}
          {errors.submit && (
            <div className="p-3 bg-[var(--error-muted)] border border-[var(--error)]/20 rounded-lg flex items-center gap-3 text-[var(--error)]">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}
        </div>

        {/* Form actions */}
        <div className="px-6 py-4 bg-[var(--background-tertiary)]/50 border-t border-[var(--border)] flex justify-end gap-3">
          <Link
            href={
              formData.projectId ? `/dashboard/projects/${formData.projectId}` : '/dashboard/tasks'
            }
            className="px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] rounded-lg text-sm font-medium text-[var(--foreground-secondary)] transition-colors"
          >
            Annuler
          </Link>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-[var(--primary-foreground)]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Créer la tâche</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>

      {/* Task Preview */}
      <motion.div
        variants={itemVariants}
        className="mt-8 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6"
      >
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">Aperçu de la tâche</h2>

        <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-tertiary)]/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-medium text-[var(--foreground)]">
                {formData.title || 'Titre de la tâche'}
              </h3>
              <p className="text-sm text-[var(--foreground-tertiary)]">
                {formData.projectId
                  ? projects.find(p => p.id.toString() === formData.projectId.toString())?.name ||
                    'Projet'
                  : 'Projet'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusInfo(formData.status as TaskStatus).bg} ${getStatusInfo(formData.status as TaskStatus).color}`}
              >
                {getStatusInfo(formData.status as TaskStatus).label}
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 bg-[var(--background-tertiary)] rounded-full text-xs">
                <div
                  className={`h-2 w-2 rounded-full ${getPriorityInfo(formData.priority).color}`}
                ></div>
                <span className="text-[var(--foreground-secondary)]">
                  {getPriorityInfo(formData.priority).label}
                </span>
              </div>
            </div>
          </div>

          {formData.description && (
            <div className="mb-4">
              <p className="text-[var(--foreground-secondary)] text-sm">{formData.description}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              {formData.deadline && (
                <div className="flex items-center gap-2 text-[var(--foreground-tertiary)]">
                  <Clock className="h-4 w-4" />
                  <span>
                    Échéance:{' '}
                    {new Date(formData.deadline).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {formData.assignees.length > 0 && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--foreground-muted)]" />
                <div className="flex -space-x-2">
                  {formData.assignees.map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <div
                        key={user.id}
                        className="h-6 w-6 rounded-full bg-[var(--primary)] border-2 border-[var(--background)] flex items-center justify-center text-xs text-[var(--primary-foreground)]"
                        title={user.fullName}
                      >
                        {user.fullName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewTaskPage;
