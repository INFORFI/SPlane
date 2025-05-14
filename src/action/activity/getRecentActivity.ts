'use server';

import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export type ActivityData = {
  id: number;
  userInitials: string;
  userName: string;
  content: string;
  timeAgo: string;
  userColor: string;
};

export async function getRecentActivity(limit: number = 3): Promise<ActivityData[]> {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Générer des couleurs cohérentes basées sur le type d'activité
    const colorMap = {
      TASK_COMPLETED: 'primary',
      TASK_STARTED: 'accent',
      PROJECT_CREATED: 'success',
      TASK_CREATED: 'warning',
      PROJECT_UPDATED: 'secondary',
    };

    return activities.map(activity => {
      const userInitials = activity.user.fullName
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();

      // Déterminer la couleur basée sur le type d'activité
      const activityType = activity.type as keyof typeof colorMap;
      const userColor = colorMap[activityType] || 'primary';

      return {
        id: activity.id,
        userInitials,
        userName: activity.user.fullName,
        content: activity.content,
        timeAgo: formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: fr }),
        userColor,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    return [];
  }
}
