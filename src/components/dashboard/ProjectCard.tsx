import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

import { itemVariants } from '@/utils/ItemVariants';

export default function ProjectCard({ project }: { project: { name: string, description: string, progress: number, deadline: string, team: { initials: string }[] } }) {
  return (
    <motion.div 
      variants={itemVariants}
    className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4"
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-lg text-white">{project.name}</h3>
        <p className="text-zinc-400 text-sm line-clamp-2 mt-1">{project.description}</p>
      </div>
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
        project.progress >= 75 ? 'bg-emerald-500/10 text-emerald-400' :
        project.progress >= 50 ? 'bg-amber-500/10 text-amber-400' :
        'bg-indigo-500/10 text-indigo-400'
      }`}>
        {project.progress}%
      </span>
    </div>

    <div className="space-y-3">
      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            project.progress >= 75 ? 'bg-emerald-500' :
            project.progress >= 50 ? 'bg-amber-500' :
            'bg-indigo-500'
          }`}
          style={{ width: `${project.progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1 text-zinc-400">
          <Clock className="h-4 w-4" />
          <span>{project.deadline}</span>
        </div>
        
        <div className="flex -space-x-2">
          {project.team.map((member: { initials: string }, index: number) => (
            <div 
              key={index}
              className="h-6 w-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs text-white"
            >
              {member.initials}
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);
}