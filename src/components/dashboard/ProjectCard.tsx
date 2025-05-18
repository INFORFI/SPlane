import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

import { itemVariants } from '@/utils/ItemVariants';

export default function ProjectCard({
  project,
}: {
  project: {
    name: string;
    description: string;
    progress: number;
    deadline: string;
    team: { initials: string }[];
  };
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-[var(--foreground)]">{project.name}</h3>
          <p className="text-[var(--foreground-tertiary)] text-sm line-clamp-2 mt-1">
            {project.description}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            project.progress >= 75
              ? 'bg-[var(--success-muted)] text-[var(--success)]'
              : project.progress >= 50
                ? 'bg-[var(--warning-muted)] text-[var(--warning)]'
                : 'bg-[var(--primary-muted)] text-[var(--primary)]'
          }`}
        >
          {project.progress}%
        </span>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-[var(--background-tertiary)] rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              project.progress >= 75
                ? 'bg-[var(--success)]'
                : project.progress >= 50
                  ? 'bg-[var(--warning)]'
                  : 'bg-[var(--primary)]'
            }`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-[var(--foreground-tertiary)]">
            <Clock className="h-4 w-4" />
            <span>{project.deadline}</span>
          </div>

          <div className="flex -space-x-2">
            {project.team.map((member: { initials: string }, index: number) => (
              <div
                key={index}
                className="h-6 w-6 rounded-full bg-[var(--border-secondary)] border-2 border-[var(--background-secondary)] flex items-center justify-center text-xs text-[var(--foreground)]"
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
