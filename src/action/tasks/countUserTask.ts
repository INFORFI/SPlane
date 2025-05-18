'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function countUserTasks(): Promise<number> {
  try {
    const userId = await requireAuth();

    if (!userId) {
      return 0;
    }

    return prisma.userTask.count({
      where: {
        userId: userId,
      },
    });
  } catch (error) {
    console.error(error);
    return 0;
  }
}
