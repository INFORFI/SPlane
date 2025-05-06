'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { TaskWithProject } from '@/action/tasks/getTasks';
import { TaskStatus } from '@prisma/client';
import { containerVariants, itemVariants } from '@/utils/ItemVariants';

interface CalendarClientProps {
  tasks: TaskWithProject[];
}

export default function CalendarClient({ tasks }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateTasksMap, setDateTasksMap] = useState<Map<string, TaskWithProject[]>>(new Map());

  // Group tasks by date for easier lookup
  useEffect(() => {
    const taskMap = new Map<string, TaskWithProject[]>();

    tasks.forEach(task => {
      if (task.deadline) {
        const dateKey = new Date(task.deadline).toDateString();
        const existingTasks = taskMap.get(dateKey) || [];
        taskMap.set(dateKey, [...existingTasks, task]);
      }
    });

    setDateTasksMap(taskMap);
  }, [tasks]);

  // Calendar navigation functions
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Calculate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Days from previous month to fill the first week
    const prevMonthDays = [];
    if (firstDayIndex > 0) {
      // Skip if month starts on Sunday
      const prevMonth = new Date(year, month, 0);
      const prevMonthDaysCount = prevMonth.getDate();

      for (let i = firstDayIndex - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: new Date(year, month - 1, prevMonthDaysCount - i),
          isCurrentMonth: false,
        });
      }
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Days from next month to complete the grid
    const nextMonthDays = [];
    const totalDaysShown = 42; // 6 rows of 7 days
    const remainingDays = totalDaysShown - prevMonthDays.length - currentMonthDays.length;

    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const today = new Date().toDateString();
  const currentMonthName = currentDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  // Handle day selection
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Get tasks for the selected date
  const getTasksForDate = (date: Date): TaskWithProject[] => {
    const dateKey = date.toDateString();
    return dateTasksMap.get(dateKey) || [];
  };

  // Get status color and label
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return {
          color: 'bg-[var(--success)]',
          textColor: 'text-[var(--success)]',
          bg: 'bg-[var(--success-muted)]',
          label: 'Terminée',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          color: 'bg-[var(--warning)]',
          textColor: 'text-[var(--warning)]',
          bg: 'bg-[var(--warning-muted)]',
          label: 'En cours',
        };
      case TaskStatus.CANCELED:
        return {
          color: 'bg-[var(--foreground-muted)]',
          textColor: 'text-[var(--foreground-tertiary)]',
          bg: 'bg-[var(--foreground-muted)]/10',
          label: 'Annulée',
        };
      default:
        return {
          color: 'bg-[var(--primary)]',
          textColor: 'text-[var(--primary)]',
          bg: 'bg-[var(--primary-muted)]',
          label: 'À faire',
        };
    }
  };

  // Get priority color
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

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Count tasks for a specific day (for dots in calendar)
  const countTasksForDate = (date: Date): number => {
    const dateKey = date.toDateString();
    const dayTasks = dateTasksMap.get(dateKey);
    return dayTasks ? dayTasks.length : 0;
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // Calculate upcoming tasks (deadline in the next 7 days)
  const upcomingTasks = tasks
    .filter(task => {
      if (!task.deadline) return false;

      const taskDate = new Date(task.deadline);
      const today = new Date();
      const diffTime = taskDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= 0 && diffDays <= 7 && task.status !== TaskStatus.COMPLETED;
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Calendrier</h1>
          <p className="text-[var(--foreground-tertiary)]">Gérez vos tâches et suivez les échéances</p>
        </motion.div>

        <div className="flex gap-2">
          <Link href="/dashboard/tasks/create">
            <motion.button
              variants={itemVariants}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle tâche</span>
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Panel */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-[var(--primary)]" />
              <span>{currentMonthName}</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-medium bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-secondary)] rounded-md transition-colors"
              >
                Aujourd&apos;hui
              </button>

              <div className="flex">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-l-md bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-r-md bg-[var(--background-tertiary)] hover:bg-[var(--border-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex rounded-md overflow-hidden border border-[var(--border)]">
                <button
                  onClick={() => setCurrentView('month')}
                  className={`px-3 py-1 text-xs font-medium ${
                    currentView === 'month'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)] hover:bg-[var(--border-secondary)] hover:text-[var(--foreground-secondary)]'
                  } transition-colors`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setCurrentView('week')}
                  className={`px-3 py-1 text-xs font-medium ${
                    currentView === 'week'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)] hover:bg-[var(--border-secondary)] hover:text-[var(--foreground-secondary)]'
                  } transition-colors`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setCurrentView('day')}
                  className={`px-3 py-1 text-xs font-medium ${
                    currentView === 'day'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)] hover:bg-[var(--border-secondary)] hover:text-[var(--foreground-secondary)]'
                  } transition-colors`}
                >
                  Jour
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="pb-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map(day => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-sm font-medium text-[var(--foreground-tertiary)]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, isCurrentMonth }) => {
                const dateKey = date.toDateString();
                const isToday = dateKey === today;
                const isSelected = selectedDate && dateKey === selectedDate.toDateString();
                const taskCount = countTasksForDate(date);

                return (
                  <motion.div
                    key={dateKey}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDayClick(date)}
                    className={`h-24 p-1 rounded-lg border relative cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                        : isToday
                          ? 'border-[var(--primary)]/50 bg-[var(--background-tertiary)]/80'
                          : isCurrentMonth
                            ? 'border-[var(--border)] bg-[var(--background-tertiary)]/50 hover:bg-[var(--background-tertiary)]'
                            : 'border-transparent bg-transparent'
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        isCurrentMonth
                          ? isToday
                            ? 'text-[var(--primary)]'
                            : 'text-[var(--foreground-secondary)]'
                          : 'text-[var(--foreground-muted)]'
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    {taskCount > 0 && (
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {dateTasksMap
                          .get(dateKey)
                          ?.slice(0, 2)
                          .map(task => (
                            <div
                              key={task.id}
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${getStatusInfo(task.status).bg} ${getStatusInfo(task.status).textColor}`}
                            >
                              {task.title}
                            </div>
                          ))}

                        {taskCount > 2 && (
                          <div className="text-xs text-[var(--foreground-tertiary)] px-1.5">
                            + {taskCount - 2} de plus
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Tasks */}
          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div
                key={selectedDate.toDateString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="mt-6 border-t border-[var(--border)] pt-6"
              >
                <h3 className="text-[var(--foreground)] font-medium mb-4">
                  Tâches pour le {formatDate(selectedDate)}
                </h3>

                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 border border-[var(--border)] hover:border-[var(--border-secondary)] rounded-lg flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-2 w-2 rounded-full mt-2 ${getPriorityColor(task.priority)}`}
                          ></div>
                          <div>
                            <div className="font-medium text-[var(--foreground)]">{task.title}</div>
                            <div className="text-sm text-[var(--foreground-tertiary)]">{task.project.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusInfo(task.status).bg} ${getStatusInfo(task.status).textColor}`}
                          >
                            {getStatusInfo(task.status).label}
                          </div>

                          {task.userTasks && task.userTasks[0] && (
                            <div
                              className="h-6 w-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-xs"
                              title={task.userTasks[0].user.fullName}
                            >
                              {task.userTasks[0].user.fullName
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-[var(--foreground-muted)]">
                    <CheckCircle2 className="h-12 w-12 mb-3 opacity-50" />
                    <p className="mb-1">Aucune tâche pour cette date</p>
                    <button className="mt-3 px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg text-sm font-medium text-[var(--primary-foreground)] transition-colors flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Ajouter une tâche</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Upcoming Tasks */}
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Tâches à venir</h2>

            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map(task => {
                  const taskDate = new Date(task.deadline!);
                  const today = new Date();
                  const diffTime = taskDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  let timeInfo = '';
                  if (diffDays === 0) timeInfo = "Aujourd'hui";
                  else if (diffDays === 1) timeInfo = 'Demain';
                  else timeInfo = `Dans ${diffDays} jours`;

                  const isUrgent = diffDays <= 2 && task.status !== TaskStatus.COMPLETED;

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg transition-colors ${
                        isUrgent
                          ? 'bg-[var(--error-muted)] border border-[var(--error)]/20'
                          : 'bg-[var(--background-tertiary)]/50 hover:bg-[var(--background-tertiary)]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-medium ${isUrgent ? 'text-[var(--error)]' : 'text-[var(--foreground)]'}`}>
                          {task.title}
                        </h3>
                        <div
                          className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-[var(--error)]' : 'text-[var(--foreground-tertiary)]'}`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{timeInfo}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--foreground-tertiary)] mb-2">{task.project.name}</p>

                      <div className="flex justify-between items-center text-xs">
                        <div
                          className={`px-2 py-1 rounded-full ${getStatusInfo(task.status).bg} ${getStatusInfo(task.status).textColor}`}
                        >
                          {getStatusInfo(task.status).label}
                        </div>

                        {task.userTasks && task.userTasks[0] && (
                          <div className="flex items-center gap-2 text-[var(--foreground-tertiary)]">
                            <User className="h-3 w-3" />
                            <span>{task.userTasks[0].user.fullName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--foreground-muted)]">
                <CheckCircle2 className="h-12 w-12 mb-3 opacity-50" />
                <p>Aucune tâche à venir</p>
              </div>
            )}
          </div>

          {/* Project Progress */}
          <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Progression des projets</h2>

            <div className="space-y-4">
              {/* Group tasks by project and calculate progress */}
              {Array.from(new Set(tasks.map(task => task.projectId))).map(projectId => {
                const projectTasks = tasks.filter(task => task.projectId === projectId);
                const project = projectTasks[0]?.project;

                if (!project) return null;

                const totalTasks = projectTasks.length;
                const completedTasks = projectTasks.filter(
                  task => task.status === TaskStatus.COMPLETED
                ).length;
                const progress =
                  totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div key={projectId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-[var(--foreground)]">{project.name}</h3>
                      <span
                        className={`text-xs font-medium ${
                          progress >= 75
                            ? 'text-[var(--success)]'
                            : progress >= 25
                              ? 'text-[var(--warning)]'
                              : 'text-[var(--primary)]'
                        }`}
                      >
                        {progress}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progress >= 75
                            ? 'bg-[var(--success)]'
                            : progress >= 25
                              ? 'bg-[var(--warning)]'
                              : 'bg-[var(--primary)]'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                      <span>
                        {completedTasks} sur {totalTasks} tâches
                      </span>
                      {project.endDate && (
                        <span>
                          Échéance:{' '}
                          {new Date(project.endDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
