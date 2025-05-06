'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar, Save, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '@prisma/client';
import { createProject } from '@/action/projects/createProject';
import TeamMember from '@/components/dashboard/TeamMembers/TeamMember';

// Types based on your Prisma schema
type ProjectFormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  teamMembers: number[];
};

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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

interface CreateProjectPageProps {
  users: User[];
  currentUserId: number;
}

export default function CreateProjectPage({ users, currentUserId }: CreateProjectPageProps) {
  // Initial form state
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    ownerId: currentUserId.toString(),
    teamMembers: [],
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

  // Toggle team member selection
  const toggleTeamMember = (userId: number) => {
    setFormData(prev => {
      const newTeamMembers = prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter(id => id !== userId)
        : [...prev.teamMembers, userId];

      return { ...prev, teamMembers: newTeamMembers };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Project owner is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Submit form
    try {
      setIsSubmitting(true);

      // Call the server action
      const result = await createProject({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        ownerId: formData.ownerId,
        teamMembers: formData.teamMembers,
      });

      if (!result.success) {
        setErrors({ submit: result.error || 'Failed to create project' });
        return;
      }

      setShowSuccessMessage(true);

      // Reset form after success
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        ownerId: currentUserId.toString(),
        teamMembers: [],
      });

      // Hide success message after a delay
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error) {
      setErrors({ submit: 'An error occurred while creating the project' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
          href="/dashboard/projects"
          className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-[var(--foreground)]">
          Create New Project
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
          <span>Project created successfully!</span>
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
          <h2 className="text-lg font-medium text-[var(--foreground)]">Project Information</h2>
          <p className="text-sm text-[var(--foreground-tertiary)]">Fill in the details to create a new project</p>
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-6">
          {/* Project name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground-secondary)]">
              Project Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className={`w-full px-4 py-2.5 bg-[var(--input)] border ${errors.name ? 'border-[var(--error)]' : 'border-[var(--border-secondary)]'} rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent`}
            />
            {errors.name && <p className="text-[var(--error)] text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Project description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground-secondary)]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your project"
              className="w-full px-4 py-2.5 bg-[var(--input)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>

          {/* Date fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start date */}
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-[var(--foreground-secondary)]">
                Start Date <span className="text-[var(--error)]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[var(--input)] border ${errors.startDate ? 'border-[var(--error)]' : 'border-[var(--border-secondary)]'} rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent`}
                />
                {errors.startDate && (
                  <p className="text-[var(--error)] text-xs mt-1">{errors.startDate}</p>
                )}
              </div>
            </div>

            {/* End date */}
            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-[var(--foreground-secondary)]">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-[var(--input)] border ${errors.endDate ? 'border-[var(--error)]' : 'border-[var(--border-secondary)]'} rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent`}
                />
                {errors.endDate && <p className="text-[var(--error)] text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Team assignment */}
          <div className="space-y-6">
            {/* Project owner */}
            <div className="space-y-2">
              <label htmlFor="ownerId" className="block text-sm font-medium text-[var(--foreground-secondary)]">
                Project Owner <span className="text-[var(--error)]">*</span>
              </label>
              <select
                id="ownerId"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--input)] border ${errors.ownerId ? 'border-[var(--error)]' : 'border-[var(--border-secondary)]'} rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent`}
              >
                <option value="">Select project owner</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
              {errors.ownerId && <p className="text-[var(--error)] text-xs mt-1">{errors.ownerId}</p>}
            </div>

            {/* Team members */}
            <TeamMember users={users} formData={formData} toggleTeamMember={toggleTeamMember} />
          </div>

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
            href="/dashboard/projects"
            className="px-4 py-2.5 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] rounded-lg text-sm font-medium text-[var(--foreground-secondary)] transition-colors"
          >
            Cancel
          </Link>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Create Project</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>

      {/* Project Preview */}
      <motion.div
        variants={itemVariants}
        className="mt-8 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6"
      >
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-4">Project Preview</h2>

        <div className="p-5 border border-[var(--border)] rounded-lg bg-[var(--background-tertiary)]/50">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-[var(--foreground)]">{formData.name || 'Project Name'}</h3>
            <p className="text-[var(--foreground-tertiary)] mt-1">
              {formData.description || 'Project description will appear here'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--primary-muted)] p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-[var(--foreground-tertiary)]">Timeline</p>
                  <p className="text-[var(--foreground)]">
                    {formData.startDate
                      ? new Date(formData.startDate).toLocaleDateString()
                      : 'Start date'}
                    {formData.endDate
                      ? ` - ${new Date(formData.endDate).toLocaleDateString()}`
                      : ' - Pas de date de fin'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-[var(--success-muted)] p-2 rounded-lg">
                  <Users className="h-5 w-5 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-[var(--foreground-tertiary)]">Team</p>
                  <p className="text-[var(--foreground)]">
                    {formData.teamMembers.length > 0
                      ? `${formData.teamMembers.length} members`
                      : 'No team members yet'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {formData.teamMembers.length > 0 && (
                <div className="flex -space-x-2">
                  {formData.teamMembers.slice(0, 3).map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <div
                        key={user.id}
                        className="h-8 w-8 rounded-full bg-[var(--primary)] border-2 border-[var(--background)] flex items-center justify-center text-xs text-[var(--primary-foreground)]"
                        title={user.fullName}
                      >
                        {user.fullName
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </div>
                    ) : null;
                  })}
                  {formData.teamMembers.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-[var(--border-secondary)] border-2 border-[var(--background)] flex items-center justify-center text-xs text-[var(--foreground)]">
                      +{formData.teamMembers.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
