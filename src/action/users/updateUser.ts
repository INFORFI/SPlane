'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function updateUser(fullName: string, email: string) {
  const userId = await requireAuth();

  if (!userId) {
    return { success: false, error: 'User not found' };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { fullName, email },
  });

  return { success: true, user: updatedUser };
}
