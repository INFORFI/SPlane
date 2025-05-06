import { motion } from 'framer-motion';
import { itemVariants } from '@/utils/ItemVariants';

export default function TaskItem({
  task,
}: {
  task: { title: string; project: string; priority: string; deadline: string; status: string };
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-3 p-3 hover:bg-[var(--background-tertiary)]/50 rounded-lg transition-colors"
    >
      <div
        className={`h-2 w-2 rounded-full ${
          task.priority === 'high'
            ? 'bg-[var(--error)]'
            : task.priority === 'medium'
              ? 'bg-[var(--warning)]'
              : 'bg-[var(--success)]'
        }`}
      ></div>

      <div className="flex-1">
        <h4 className="text-sm font-medium text-[var(--foreground)]">{task.title}</h4>
        <p className="text-xs text-[var(--foreground-tertiary)]">{task.project}</p>
      </div>

      <div className="text-xs text-[var(--foreground-tertiary)]">{task.deadline}</div>

      <div
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.status === 'completed'
            ? 'bg-[var(--success-muted)] text-[var(--success)]'
            : task.status === 'in_progress'
              ? 'bg-[var(--warning-muted)] text-[var(--warning)]'
              : 'bg-[var(--primary-muted)] text-[var(--primary)]'
        }`}
      >
        {task.status === 'completed'
          ? 'Complété'
          : task.status === 'in_progress'
            ? 'En cours'
            : 'À faire'}
      </div>
    </motion.div>
  );
}