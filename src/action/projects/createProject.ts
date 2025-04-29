// src/action/projects/createProject.ts
'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

type CreateProjectInput = {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  ownerId: string;
  teamMembers?: number[];
};

export async function createProject(input: CreateProjectInput) {
  try {
    // Verify user is authenticated
    const userId = await requireAuth();
    if (!userId) {
      return { success: false, error: 'You must be logged in to create a project' };
    }

    // Basic validation
    if (!input.name.trim()) {
      return { success: false, error: 'Project name is required' };
    }

    if (!input.startDate) {
      return { success: false, error: 'Start date is required' };
    }

    const startDate = new Date(input.startDate);
    let endDate = null;

    if (input.endDate) {
      endDate = new Date(input.endDate);
      if (endDate < startDate) {
        return { success: false, error: 'End date must be after start date' };
      }
    }

    const ownerId = parseInt(input.ownerId);

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description || null,
        startDate,
        endDate,
        ownerId,
      },
    });

    // Update cache to reflect changes
    revalidatePath('/dashboard/projects');

    return {
      success: true,
      project,
      message: 'Project created successfully',
    };
  } catch (error) {
    console.error('Failed to create project:', error);
    return {
      success: false,
      error: 'An error occurred while creating the project',
    };
  }
}
