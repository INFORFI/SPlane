"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Filter, 
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
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description?.toLowerCase().includes(query) || false) ||
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
      upcoming: upcomingCount
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
      case 3: return 'bg-rose-500';
      case 2: return 'bg-amber-500';
      case 1: return 'bg-emerald-500';
      default: return 'bg-indigo-500';
    }
  };
  
  // Get label for task priority
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Normal';
    }
  };
  
  // Get status information (color, label)
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' };
      case TaskStatus.IN_PROGRESS:
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'In Progress' };
      case TaskStatus.CANCELED:
        return { color: 'text-zinc-400', bg: 'bg-zinc-500/10', label: 'Canceled' };
      default:
        return { color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'To Do' };
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
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-zinc-400">Manage and track your assigned tasks</p>
        </motion.div>
        
        <Link href="/dashboard/tasks/add">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
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
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex overflow-x-auto pb-2 gap-1 border-b border-zinc-800">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors ${
              activeFilter === 'all' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => handleFilterChange('todo')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'todo' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            To Do
            {taskCounts.todo > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">
                {taskCounts.todo}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterChange('in-progress')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'in-progress' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            In Progress
            {taskCounts.inProgress > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                {taskCounts.inProgress}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterChange('completed')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'completed' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            Completed
            {taskCounts.completed > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                {taskCounts.completed}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterChange('upcoming')}
            className={`px-4 py-2 whitespace-nowrap text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeFilter === 'upcoming' 
                ? 'bg-zinc-800 text-white' 
                : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            Upcoming
            {taskCounts.upcoming > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-500/20 text-rose-400 rounded-full">
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
            {filteredTasks.map((task) => (
              <motion.div
                key={`task-${task.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-5 w-5 mt-0.5 rounded-md flex-shrink-0 ${
                      task.status === TaskStatus.COMPLETED ? 'bg-emerald-500/20' : 'bg-zinc-800'
                    } border ${
                      task.status === TaskStatus.COMPLETED ? 'border-emerald-500' : 'border-zinc-700'
                    } flex items-center justify-center`}>
                      {task.status === TaskStatus.COMPLETED && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-medium ${
                          task.status === TaskStatus.COMPLETED ? 'text-zinc-400 line-through' : 'text-white'
                        }`}>{task.title}</h3>
                        
                        {/* Priority indicator */}
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-zinc-800">
                          <div className={`h-1.5 w-1.5 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          <span className="text-zinc-400">{getPriorityLabel(task.priority)}</span>
                        </div>
                      </div>
                      
                      {/* Project name */}
                      <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                        <Layers className="h-3 w-3" />
                        <span>{task.project.name}</span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Deadline */}
                    {task.deadline && (
                      <div className={`flex items-center gap-1 text-xs ${
                        isOverdue(task.deadline) && task.status !== TaskStatus.COMPLETED
                          ? 'text-rose-400' 
                          : 'text-zinc-400'
                      }`}>
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDeadline(task.deadline)}</span>
                      </div>
                    )}
                    
                    {/* Status badge */}
                    <div className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(task.status).bg} ${getStatusInfo(task.status).color}`}>
                      {getStatusInfo(task.status).label}
                    </div>
                    
                    {/* Task actions */}
                    <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
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
                <Search className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-medium text-zinc-400 mb-2">No matching tasks found</h3>
                <p className="text-zinc-500 max-w-md mb-4">
                  We couldn't find any tasks matching your search "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : activeFilter !== 'all' ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-medium text-zinc-400 mb-2">No {activeFilter.replace('-', ' ')} tasks</h3>
                <p className="text-zinc-500 max-w-md mb-4">
                  {activeFilter === 'todo' && "You don't have any tasks to do yet. Create a new task to get started."}
                  {activeFilter === 'in-progress' && "You don't have any tasks in progress. Start working on a task to see it here."}
                  {activeFilter === 'completed' && "You haven't completed any tasks yet. Keep up the good work!"}
                  {activeFilter === 'upcoming' && "You don't have any upcoming tasks due in the next 7 days."}
                </p>
                <button
                  onClick={() => handleFilterChange('all')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
                >
                  View all tasks
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-xl font-medium text-zinc-400 mb-2">No tasks assigned to you</h3>
                <p className="text-zinc-500 max-w-md mb-4">
                  You don't have any tasks assigned to you yet. Create a new task or ask your team to assign you tasks.
                </p>
                <Link
                  href="/dashboard/tasks/add"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
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
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getPriorityColor(selectedTask.priority)}`}></div>
                  <h2 className="text-xl font-semibold text-white">{selectedTask.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <AlertCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Task description */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Description</h3>
                    <p className="text-white">
                      {selectedTask.description || "No description provided."}
                    </p>
                  </div>
                  
                  {/* Project info */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Project</h3>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-zinc-800 rounded-md">
                        <Layers className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedTask.project.name}</p>
                        {selectedTask.project.description && (
                          <p className="text-sm text-zinc-400">{selectedTask.project.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Task assignees */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Assigned to</h3>
                    <div className="space-y-2">
                      {selectedTask.userTasks.map((userTask) => (
                        <div key={userTask.id} className="flex items-center gap-3 p-2 bg-zinc-800 rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                            {userTask.user.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{userTask.user.fullName}</p>
                            <p className="text-xs text-zinc-400">{userTask.user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Task details sidebar */}
                <div className="space-y-4">
                  {/* Status */}
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase mb-3">Status</h4>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedTask.status).bg} ${getStatusInfo(selectedTask.status).color}`}>
                      {getStatusInfo(selectedTask.status).label}
                    </div>
                  </div>
                  
                  {/* Priority */}
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase mb-3">Priority</h4>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getPriorityColor(selectedTask.priority)}`}></div>
                      <span className="text-sm text-white">{getPriorityLabel(selectedTask.priority)}</span>
                    </div>
                  </div>
                  
                  {/* Deadline */}
                  {selectedTask.deadline && (
                    <div className="p-4 bg-zinc-800 rounded-lg">
                      <h4 className="text-xs font-medium text-zinc-500 uppercase mb-3">Deadline</h4>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-zinc-400" />
                        <span className={`text-sm ${
                          isOverdue(selectedTask.deadline) && selectedTask.status !== TaskStatus.COMPLETED
                            ? 'text-rose-400'
                            : 'text-white'
                        }`}>
                          {new Date(selectedTask.deadline).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="space-y-2">
                    {selectedTask.status !== TaskStatus.COMPLETED ? (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors">
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as Completed
                      </button>
                    ) : (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-sm font-medium transition-colors">
                        <AlertCircle className="h-4 w-4" />
                        Mark as Todo
                      </button>
                    )}
                    
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors">
                      <User className="h-4 w-4" />
                      Reassign Task
                    </button>
                    
                    {selectedTask.status !== TaskStatus.CANCELED && (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-lg text-sm font-medium transition-colors">
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