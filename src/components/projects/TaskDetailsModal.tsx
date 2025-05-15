import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Clock, Calendar, CheckCircle2, Edit, Trash2, Plus } from 'lucide-react';
import { TaskStatus, Task, User as UserType, UserTask, Project } from '@prisma/client';
import changeTaskStatus from '@/action/tasks/changeTaskStatus';
import updateTask from '@/action/tasks/updateTask';
import { TaskWithProject } from '@/action/tasks/getTasks';

type TaskDetailsModalProps = {
  task: TaskWithProject;
  onClose: () => void;
  onUpdate?: (updatedTask: TaskWithProject) => void;
  projectTeam: UserType[];
  formatDate: (date: Date | null) => string;
};

export default function TaskDetailsModal({
  task,
  onClose,
  onUpdate,
  projectTeam,
  formatDate,
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);
  const [taskForm, setTaskForm] = useState({
    title: task.title,
    description: task.description || '',
    deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    status: task.status,
    priority: task.priority,
    assigneeId: task.userTasks[0]?.userId || '',
  });

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

  const status = getStatusColor(currentStatus);
  const priority = getPriority(task.priority);
  const assignedUser = task.userTasks[0]?.user;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for the update
      const updateData = {
        title: taskForm.title,
        description: taskForm.description || null,
        deadline: taskForm.deadline ? new Date(taskForm.deadline) : null,
        status: taskForm.status as TaskStatus,
        priority: Number(taskForm.priority),
        assigneeId: taskForm.assigneeId.toString() || undefined,
      };

      // Call the server action to update the task
      const result = await updateTask(task.id, updateData);

      if (result.success) {
        // Update the local state to reflect changes
        setCurrentStatus(updateData.status);
        
        // Call onUpdate with the updated task data
        if (onUpdate) {
          const updatedTask: TaskWithProject = {
            ...task,
            title: updateData.title,
            description: updateData.description,
            deadline: updateData.deadline,
            status: updateData.status,
            priority: updateData.priority,
            userTasks: [...task.userTasks]
          };
          
          // Update assignee if changed
          if (updateData.assigneeId) {
            const assignee = projectTeam.find(member => member.id.toString() === updateData.assigneeId);
            if (assignee) {
              updatedTask.userTasks = [{
                id: task.userTasks[0]?.id || 0,
                userId: parseInt(updateData.assigneeId),
                taskId: task.id,
                assignedAt: new Date(),
                user: assignee
              }];
            }
          } else if (updateData.assigneeId === '') {
            updatedTask.userTasks = [];
          }
          
          onUpdate(updatedTask);
        }
        
        // Exit edit mode
        setIsEditing(false);
      } else {
        // Handle error (could add toast notification here)
        console.error('Failed to update task:', result.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setCurrentStatus(newStatus);

    const result = await changeTaskStatus(task.id, newStatus);

    if (!result || !result.success) {
      setCurrentStatus(task.status);
    } else if (result.success && onUpdate) {
      // Call onUpdate with the updated task data
      const updatedTask: TaskWithProject = {
        ...task,
        status: newStatus
      };
      onUpdate(updatedTask);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[var(--background)]/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${priority.color}`}></div>
            {!isEditing ? (
              <h2 className="text-xl font-semibold text-[var(--foreground)]">{task.title}</h2>
            ) : (
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Modifier la tâche</h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              key="edit-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                >
                  Titre
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={taskForm.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                  required
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
                  name="description"
                  rows={4}
                  value={taskForm.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                  >
                    Statut
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={taskForm.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                  >
                    <option value="TODO">À faire</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="COMPLETED">Terminée</option>
                    <option value="CANCELED">Annulée</option>
                  </select>
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
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                  >
                    <option value="1">Basse</option>
                    <option value="2">Moyenne</option>
                    <option value="3">Haute</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                  >
                    Date limite
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-[var(--foreground-muted)]" />
                    </div>
                    <input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={taskForm.deadline}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="assigneeId"
                    className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
                  >
                    Assigné à
                  </label>
                  <select
                    id="assigneeId"
                    name="assigneeId"
                    value={taskForm.assigneeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
                  >
                    <option value="">Non assignée</option>
                    {projectTeam.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
                  Enregistrer
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="task-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Task description */}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground-tertiary)] mb-2">
                      Description
                    </h3>
                    <p className="text-[var(--foreground)]">
                      {task.description || 'Aucune description fournie.'}
                    </p>
                  </div>

                  {/* Comments section */}
                  <div>
                    <h3 className="text-sm font-medium text-[var(--foreground-tertiary)] mb-3">
                      Commentaires
                    </h3>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm">
                          {assignedUser
                            ? assignedUser.fullName
                                .split(' ')
                                .map(name => name[0])
                                .join('')
                            : 'U'}
                        </div>
                        <div className="flex-1 p-3 bg-[var(--background-tertiary)] rounded-lg">
                          <p className="text-sm text-[var(--foreground)]">
                            J&apos;ai commencé à travailler sur cette tâche. Je pense pouvoir la
                            terminer d&apos;ici demain.
                          </p>
                          <p className="text-xs text-[var(--foreground-muted)] mt-1">
                            Il y a 2 jours
                          </p>
                        </div>
                      </div>

                      {/* Comment input */}
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--border-secondary)] flex items-center justify-center text-[var(--foreground)] text-sm">
                          U
                        </div>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Ajouter un commentaire..."
                            className="w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent pr-10"
                          />
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--primary)] hover:text-[var(--primary-hover)]">
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task details sidebar */}
                <div className="space-y-6">
                  <div className="bg-[var(--background-tertiary)]/50 rounded-lg p-4 space-y-4">
                    {/* Status */}
                    <div>
                      <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-1">
                        STATUT
                      </h4>
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}
                      >
                        {status.label}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-1">
                        PRIORITÉ
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${priority.color}`}></div>
                        <span className="text-sm text-[var(--foreground)]">{priority.label}</span>
                      </div>
                    </div>

                    {/* Assignee */}
                    <div>
                      <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-1">
                        ASSIGNÉ À
                      </h4>
                      {assignedUser ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-xs">
                            {assignedUser.fullName
                              .split(' ')
                              .map(name => name[0])
                              .join('')}
                          </div>
                          <span className="text-sm text-[var(--foreground)]">
                            {assignedUser.fullName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--foreground-tertiary)]">
                          Non assignée
                        </span>
                      )}
                    </div>

                    {/* Deadline */}
                    {task.deadline && (
                      <div>
                        <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-1">
                          DATE LIMITE
                        </h4>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--foreground-tertiary)]" />
                          <span className="text-sm text-[var(--foreground)]">
                            {formatDate(task.deadline)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] rounded-lg text-sm font-medium text-[var(--foreground-secondary)] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </motion.button>

                    {currentStatus !== TaskStatus.COMPLETED ? (
                      <motion.button
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--success-muted)] hover:bg-[var(--success-muted)]/70 text-[var(--success)] rounded-lg text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Marquer terminée</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary-muted)] hover:bg-[var(--primary-muted)]/70 text-[var(--primary)] rounded-lg text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(TaskStatus.TODO)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Marquer non terminée</span>
                      </motion.button>
                    )}

                    <motion.button
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--error-muted)] hover:bg-[var(--error-muted)]/70 text-[var(--error)] rounded-lg text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
