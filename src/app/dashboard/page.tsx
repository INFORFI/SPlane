"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, BarChart2, Users, Plus } from 'lucide-react';

// Mock data based on your database schema
const mockProjects = [
  { id: 1, name: 'Website Redesign', tasksCount: 8, completedTasks: 3, daysLeft: 21 },
  { id: 2, name: 'Mobile App Development', tasksCount: 12, completedTasks: 2, daysLeft: 45 },
];

const mockTasks = [
  { id: 1, title: 'Design homepage mockup', deadline: '2025-04-23', status: 'TODO', priority: 2, projectId: 1 },
  { id: 2, title: 'Implement responsive layout', deadline: '2025-04-30', status: 'TODO', priority: 1, projectId: 1 },
  { id: 3, title: 'Design UI/UX for mobile app', deadline: '2025-04-26', status: 'TODO', priority: 3, projectId: 2 },
];

const mockTeamMembers = [
  { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', assignedTasks: 2 },
  { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/32/32', assignedTasks: 1 },
];

const priorityColors = {
  1: 'bg-blue-100 text-blue-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800',
};

const statusColors = {
  'TODO': 'bg-gray-100 text-gray-800',
  'IN_PROGRESS': 'bg-blue-100 text-blue-800',
  'COMPLETED': 'bg-green-100 text-green-800',
  'CANCELED': 'bg-red-100 text-red-800',
};

const Dashboard = () => {
  const [currentDate] = useState(new Date());
  const [isTasksVisible, setIsTasksVisible] = useState(true);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md"
            >
              <Plus size={18} />
              <span>New Project</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats overview */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <BarChart2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{mockProjects.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed Tasks</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {mockProjects.reduce((acc, project) => acc + project.completedTasks, 0)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {mockTasks.filter(task => task.status !== 'COMPLETED').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{mockTeamMembers.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Projects and calendar sections */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Projects section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Your Projects</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all
                  </motion.button>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {mockProjects.map((project) => (
                  <motion.li 
                    key={project.id}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                    className="px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <CheckCircle className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-400" />
                          <span>{project.completedTasks} of {project.tasksCount} tasks completed</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {project.daysLeft} days left
                        </div>
                        <div className="mt-2 w-32 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${(project.completedTasks / project.tasksCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Tasks section */}
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Tasks</h2>
                  <motion.button
                    onClick={() => setIsTasksVisible(!isTasksVisible)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {isTasksVisible ? 'Hide' : 'Show'}
                  </motion.button>
                </div>
              </div>
              <AnimatePresence>
                {isTasksVisible && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="divide-y divide-gray-200"
                  >
                    {mockTasks.map((task) => {
                      const deadline = new Date(task.deadline);
                      const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                      
                      return (
                        <motion.li 
                          key={task.id}
                          whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                          className="px-4 py-4 sm:px-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span>Due {deadline.toLocaleDateString()}</span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                                Priority {task.priority}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Calendar and team section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            {/* Calendar section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2">{day}</div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const isToday = day === currentDate.getDate();
                    const hasTask = mockTasks.some(task => {
                      const taskDate = new Date(task.deadline);
                      return taskDate.getDate() === day && 
                             taskDate.getMonth() === currentDate.getMonth() &&
                             taskDate.getFullYear() === currentDate.getFullYear();
                    });
                    
                    return (
                      <motion.button
                        key={day}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`py-2 text-sm rounded-lg ${
                          isToday 
                            ? 'bg-indigo-600 text-white font-semibold' 
                            : hasTask 
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Team section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Team</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {mockTeamMembers.map((member) => (
                  <motion.li 
                    key={member.id}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                    className="px-4 py-4 sm:px-6 flex items-center"
                  >
                    <img className="h-8 w-8 rounded-full" src={member.avatar} alt={member.name} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.assignedTasks} tasks assigned</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
              <div className="px-4 py-4 sm:px-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;