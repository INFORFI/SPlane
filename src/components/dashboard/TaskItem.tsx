import { motion } from 'framer-motion';
import { itemVariants } from '@/utils/ItemVariants';

export default function TaskItem({ task }: { task: { title: string, project: string, priority: string, deadline: string, status: string } }) {
  return (
    <motion.div 
      variants={itemVariants}
    className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors"
  >
    <div className={`h-2 w-2 rounded-full ${
      task.priority === 'high' ? 'bg-rose-500' :
      task.priority === 'medium' ? 'bg-amber-500' :
      'bg-emerald-500'
    }`}></div>
    
    <div className="flex-1">
      <h4 className="text-sm font-medium text-white">{task.title}</h4>
      <p className="text-xs text-zinc-400">{task.project}</p>
    </div>
    
    <div className="text-xs text-zinc-400">{task.deadline}</div>
    
    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
      task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
      task.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
      'bg-indigo-500/10 text-indigo-400'
    }`}>
      {task.status === 'completed' ? 'Complété' : 
       task.status === 'in_progress' ? 'En cours' : 'À faire'}
    </div>
  </motion.div>
);
}