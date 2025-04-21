import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { itemVariants } from '@/utils/ItemVariants';

export default function MiniCalendar() {
  // Simulation des dates avec des événements
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get start day of month (0 = Sunday, 1 = Monday, etc.)
  const startDay = new Date(currentYear, currentMonth, 1).getDay();
  
  // Days with events
  const daysWithEvents = [4, 10, 15, 22, 28];
  
  // Create calendar days
  const days = [];
  
  // Add empty spaces for days before start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  
  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  return (
    <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white">Avril 2025</h3>
        <div className="flex gap-1">
          <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-zinc-400">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          day === null ? (
            <div key={`empty-${index}`} className="h-8 w-8"></div>
          ) : (
            <div 
              key={day}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                day === today.getDate() 
                  ? 'bg-indigo-600 text-white font-medium' 
                  : daysWithEvents.includes(day)
                    ? 'text-white relative after:absolute after:bottom-1 after:h-1 after:w-1 after:bg-indigo-500 after:rounded-full'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {day}
            </div>
          )
        ))}
      </div>
      
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium text-white">Événements à venir</h4>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
            <div>
              <p className="text-xs font-medium text-white">Design du nouveau site</p>
              <p className="text-xs text-zinc-400">Today, 14:00 - 15:30</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <div>
              <p className="text-xs font-medium text-white">Réunion mobile app</p>
              <p className="text-xs text-zinc-400">Demain, 10:00 - 11:00</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};