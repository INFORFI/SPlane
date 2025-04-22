"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  ArrowLeft,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { TaskStatus, Task, User as UserType, UserTask } from '@prisma/client';
import { getProjectById, ProjectWithDetails } from '@/action/projects/getProjectById';
import changeTaskStatus from '@/action/task/changeTaskStatus';

// Define types based on the data model
type KanbanTask = Task & {
  userTasks: (UserTask & {
    user: UserType
  })[];
};

type KanbanColumn = {
  id: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
  tasks: KanbanTask[];
};

interface KanbanProps {
  project: ProjectWithDetails;
}

export default function KanbanPage({ project }: KanbanProps) {
  // State for columns (TODO, IN_PROGRESS, COMPLETED, CANCELED)
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingTask, setDraggingTask] = useState<KanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<TaskStatus | null>(null);
  
  // Initialize columns with tasks sorted by status
  useEffect(() => {
    if (project) {
      const tasksByStatus: Record<TaskStatus, KanbanTask[]> = {
        [TaskStatus.TODO]: [],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.COMPLETED]: [],
        [TaskStatus.CANCELED]: [],
      };
      
      // Group tasks by status
      project.tasks.forEach(task => {
        tasksByStatus[task.status].push(task as KanbanTask);
      });
      
      // Create columns with tasks
      const kanbanColumns: KanbanColumn[] = [
        { 
          id: TaskStatus.TODO, 
          title: 'À faire', 
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/10',
          tasks: tasksByStatus[TaskStatus.TODO] 
        },
        { 
          id: TaskStatus.IN_PROGRESS, 
          title: 'En cours', 
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          tasks: tasksByStatus[TaskStatus.IN_PROGRESS] 
        },
        { 
          id: TaskStatus.COMPLETED, 
          title: 'Terminées', 
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          tasks: tasksByStatus[TaskStatus.COMPLETED] 
        },
        { 
          id: TaskStatus.CANCELED, 
          title: 'Annulées', 
          color: 'text-zinc-400',
          bgColor: 'bg-zinc-500/10',
          tasks: tasksByStatus[TaskStatus.CANCELED] 
        }
      ];
      
      setColumns(kanbanColumns);
      setLoading(false);
    }
  }, [project]);

  // Handle task dragging
  const onDragStart = (task: KanbanTask, sourceStatus: TaskStatus) => {
    setDraggingTask(task);
    setActiveColumn(sourceStatus);
  };

  // Handle dropping a task
  const onDragEnd = async (destinationStatus: TaskStatus) => {
    if (!draggingTask || !activeColumn) return;
    if (activeColumn === destinationStatus) {
      setDraggingTask(null);
      setActiveColumn(null);
      return;
    }
    
    // Optimistic UI update
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      // Find columns
      const sourceColumn = newColumns.find(col => col.id === activeColumn);
      const destColumn = newColumns.find(col => col.id === destinationStatus);
      
      if (!sourceColumn || !destColumn) return prevColumns;
      
      // Remove task from source column
      sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== draggingTask.id);
      
      // Remove task from destination column if it exists there (to avoid duplicates)
      destColumn.tasks = destColumn.tasks.filter(t => t.id !== draggingTask.id);
      
      // Add task to destination column with updated status (at the beginning)
      const updatedTask = { ...draggingTask, status: destinationStatus };
      destColumn.tasks = [updatedTask, ...destColumn.tasks];
      
      return newColumns;
    });
    
    // Call the server action to update task status in the database
    try {
      const result = await changeTaskStatus(draggingTask.id.toString(), destinationStatus);
      
      if (!result.success) {
        console.error("Failed to update task status:", result.error);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
    
    setDraggingTask(null);
    setActiveColumn(null);
  };

  // Format dates for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };
  
  // Get priority color for a task
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-rose-500';
      case 2: return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/dashboard/projects/${project.id}`} 
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">
              {project.name} - Tableau Kanban
            </h1>
          </div>
          <p className="text-zinc-400">
            Faites glisser les tâches pour mettre à jour leur statut
          </p>
        </div>
        
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
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle tâche</span>
          </motion.button>
        </div>
      </div>
      
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="flex flex-col h-full"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={() => onDragEnd(column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-2 ${column.color}`}>
                <h2 className="font-semibold">{column.title}</h2>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-xs">
                  {column.tasks.length}
                </span>
              </div>
              
              <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Task List */}
            <div 
              className={`flex-1 p-3 rounded-lg border border-zinc-800 ${column.bgColor} bg-opacity-5 overflow-hidden flex flex-col min-h-[500px] ${
                draggingTask && activeColumn !== column.id ? 'border-dashed border-2' : ''
              }`}
            >
              <div className="overflow-y-auto flex-1 space-y-3 pr-1
                [&::-webkit-scrollbar]:w-2 
                [&::-webkit-scrollbar-track]:bg-zinc-900 
                [&::-webkit-scrollbar-thumb]:bg-zinc-700 
                [&::-webkit-scrollbar-thumb:hover]:bg-indigo-600"
              >
                {column.tasks.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="flex flex-col items-center justify-center h-32 text-zinc-500 text-sm"
                  >
                    <p>Aucune tâche</p>
                    <p className="text-xs mt-1">Déposez une tâche ici</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {column.tasks.map(task => (
                      <KanbanTaskCard 
                        key={task.id}
                        task={task}
                        formatDate={formatDate}
                        getPriorityColor={getPriorityColor}
                        onDragStart={() => onDragStart(task, column.id)}
                        columnId={column.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KanbanTaskCardProps {
  task: KanbanTask;
  formatDate: (date: Date | null) => string;
  getPriorityColor: (priority: number) => string;
  onDragStart: () => void;
  columnId: TaskStatus;
}

function KanbanTaskCard({ 
  task, 
  formatDate, 
  getPriorityColor,
  onDragStart,
  columnId
}: KanbanTaskCardProps) {
  const assignedUser = task.userTasks?.[0]?.user;
  
  return (
    <motion.div
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex gap-2">
          <div className={`h-2 w-2 rounded-full mt-1.5 ${getPriorityColor(task.priority)}`}></div>
          <h3 className="font-medium text-white line-clamp-1">{task.title}</h3>
        </div>
        <button className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      
      {task.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3 pl-4">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-2">
          {task.deadline && (
            <div className="flex items-center gap-1 text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>{formatDate(task.deadline)}</span>
            </div>
          )}
        </div>
        
        {assignedUser && (
          <div 
            className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs"
            title={assignedUser.fullName}
          >
            {assignedUser.fullName.split(' ').map(name => name[0]).join('')}
          </div>
        )}
      </div>
    </motion.div>
  );
}