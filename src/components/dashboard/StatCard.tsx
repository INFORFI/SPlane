import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import { itemVariants } from '@/utils/ItemVariants';

export default function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string | null;
  color: string;
}) {
  // Fonction pour convertir les classes Tailwind en variables CSS
  const getColorVariable = (colorClass: string) => {
    switch (colorClass) {
      case 'bg-indigo-500':
        return 'bg-[var(--primary-muted)]';
      case 'bg-emerald-500':
        return 'bg-[var(--success-muted)]';
      case 'bg-amber-500':
        return 'bg-[var(--warning-muted)]';
      case 'bg-purple-500':
        return 'bg-[var(--accent-muted)]';
      case 'bg-rose-500':
        return 'bg-[var(--error-muted)]';
      default:
        return 'bg-[var(--primary-muted)]';
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${getColorVariable(color)}`}>{icon}</div>
        {trend && (
          <div className="flex items-center gap-1 text-[var(--success)] text-xs font-medium">
            <ArrowUpRight className="h-3 w-3" />
            <span>{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-[var(--foreground)]">{value}</h3>
        <p className="text-[var(--foreground-tertiary)] text-sm">{label}</p>
      </div>
    </motion.div>
  );
}
