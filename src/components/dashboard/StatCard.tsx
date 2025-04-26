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
  return (
    <motion.div
      variants={itemVariants}
      className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>{icon}</div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
            <ArrowUpRight className="h-3 w-3" />
            <span>{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-zinc-400 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}
