'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
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
          color: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          label: 'Terminée',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          color: 'bg-amber-500',
          textColor: 'text-amber-400',
          bg: 'bg-amber-500/10',
          label: 'En cours',
        };
      case TaskStatus.CANCELED:
        return {
          color: 'bg-zinc-500',
          textColor: 'text-zinc-400',
          bg: 'bg-zinc-500/10',
          label: 'Annulée',
        };
      default:
        return {
          color: 'bg-indigo-500',
          textColor: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
          label: 'À faire',
        };
    }
  };

  // Get priority color
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return 'bg-rose-500';
      case 2:
        return 'bg-amber-500';
      case 1:
        return 'bg-emerald-500';
      default:
        return 'bg-indigo-500';
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
          <h1 className="text-2xl font-bold text-white">Calendrier</h1>
          <p className="text-zinc-400">Gérez vos tâches et suivez les échéances</p>
        </motion.div>

        <div className="flex gap-2">
          <motion.button
            variants={itemVariants}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium text-zinc-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="h-4 w-4" />
            <span>Filtrer</span>
          </motion.button>

          <motion.button
            variants={itemVariants}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle tâche</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Panel */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-400" />
              <span>{currentMonthName}</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors"
              >
                Aujourd&apos;hui
              </button>

              <div className="flex">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-l-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-r-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex rounded-md overflow-hidden border border-zinc-800">
                <button
                  onClick={() => setCurrentView('month')}
                  className={`px-3 py-1 text-xs font-medium ${
                    currentView === 'month'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  } transition-colors`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setCurrentView('week')}
                  className={`px-3 py-1 text-xs font-medium ${
                    currentView === 'week'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  } transition-colors`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setCurrentView('day')}
                  className={`px-3 py-1 text-xs font-medium ${
                    currentView === 'day'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
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
                  className="h-10 flex items-center justify-center text-sm font-medium text-zinc-400"
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
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : isToday
                          ? 'border-indigo-500/50 bg-zinc-800/80'
                          : isCurrentMonth
                            ? 'border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800'
                            : 'border-transparent bg-transparent'
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        isCurrentMonth
                          ? isToday
                            ? 'text-indigo-400'
                            : 'text-zinc-200'
                          : 'text-zinc-600'
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
                          <div className="text-xs text-zinc-400 px-1.5">
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
                className="mt-6 border-t border-zinc-800 pt-6"
              >
                <h3 className="text-white font-medium mb-4">
                  Tâches pour le {formatDate(selectedDate)}
                </h3>

                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-2 w-2 rounded-full mt-2 ${getPriorityColor(task.priority)}`}
                          ></div>
                          <div>
                            <div className="font-medium text-white">{task.title}</div>
                            <div className="text-sm text-zinc-400">{task.project.name}</div>
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
                              className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs"
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
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                    <CheckCircle2 className="h-12 w-12 mb-3 opacity-50" />
                    <p className="mb-1">Aucune tâche pour cette date</p>
                    <button className="mt-3 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Tâches à venir</h2>

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
                          ? 'bg-rose-500/10 border border-rose-500/20'
                          : 'bg-zinc-800/50 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-medium ${isUrgent ? 'text-rose-400' : 'text-white'}`}>
                          {task.title}
                        </h3>
                        <div
                          className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-rose-400' : 'text-zinc-400'}`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{timeInfo}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 mb-2">{task.project.name}</p>

                      <div className="flex justify-between items-center text-xs">
                        <div
                          className={`px-2 py-1 rounded-full ${getStatusInfo(task.status).bg} ${getStatusInfo(task.status).textColor}`}
                        >
                          {getStatusInfo(task.status).label}
                        </div>

                        {task.userTasks && task.userTasks[0] && (
                          <div className="flex items-center gap-2 text-zinc-400">
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
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <CheckCircle2 className="h-12 w-12 mb-3 opacity-50" />
                <p>Aucune tâche à venir</p>
              </div>
            )}
          </div>

          {/* Project Progress */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Progression des projets</h2>

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
                      <h3 className="text-sm font-medium text-white">{project.name}</h3>
                      <span
                        className={`text-xs font-medium ${
                          progress >= 75
                            ? 'text-emerald-400'
                            : progress >= 25
                              ? 'text-amber-400'
                              : 'text-indigo-400'
                        }`}
                      >
                        {progress}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progress >= 75
                            ? 'bg-emerald-500'
                            : progress >= 25
                              ? 'bg-amber-500'
                              : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-zinc-500">
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
