'use client';

import { motion } from 'framer-motion';
import { itemVariants } from '@/utils/ItemVariants';
import { useEffect, useState } from 'react';
import { getRecentActivity, ActivityData } from '@/action/activity/getRecentActivity';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const data = await getRecentActivity(3);
        setActivities(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  return (
    <motion.section
      variants={itemVariants}
      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-5"
      id="dashboard-activity"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Activité récente</h2>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse h-4 w-3/4 bg-[var(--border)] rounded"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-[var(--foreground-tertiary)] text-center py-2">
            Aucune activité récente
          </p>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="flex gap-3">
              <div
                className={`h-8 w-8 rounded-full bg-[var(--${activity.userColor})] flex items-center justify-center text-[var(--${activity.userColor}-foreground)] text-sm font-medium`}
              >
                {activity.userInitials}
              </div>
              <div>
                <p className="text-sm text-[var(--foreground)]">
                  <span className="font-medium">{activity.userName}</span> {activity.content}
                </p>
                <p className="text-xs text-[var(--foreground-tertiary)] mt-1">{activity.timeAgo}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
