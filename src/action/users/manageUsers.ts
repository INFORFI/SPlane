'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import { Prisma } from '@prisma/client';

// Type for creating a new user
type CreateUserInput = {
  email: string;
  fullName: string;
  role: Role;
  password: string;
};

// Type for updating an existing user
type UpdateUserInput = {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  password?: string; // Optional for updates
};

// Response type for user operations
type UserOperationResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Creates a new user
 */
export async function createUser(input: CreateUserInput): Promise<UserOperationResponse> {
  try {
    // Check if the current user has admin privileges
    const currentUserId = await requireAuth();
    if (!currentUserId) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return {
        success: false,
        error: "Vous n'avez pas les droits d'administrateur nécessaires",
      };
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Un utilisateur avec cet email existe déjà',
        fieldErrors: {
          email: 'Cette adresse email est déjà utilisée',
        },
      };
    }

    // Hash the password
    const passwordHash = await hash(input.password, 10);

    // Create the user
    await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        role: input.role,
      },
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard/team');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de l'utilisateur",
    };
  }
}

/**
 * Updates an existing user
 */
export async function updateUser(input: UpdateUserInput): Promise<UserOperationResponse> {
  try {
    // Check if the current user has admin privileges
    const currentUserId = await requireAuth();
    if (!currentUserId) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return {
        success: false,
        error: "Vous n'avez pas les droits d'administrateur nécessaires",
      };
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: input.id },
    });

    if (!existingUser) {
      return {
        success: false,
        error: "L'utilisateur n'existe pas",
      };
    }

    // Check if email is already taken by another user
    if (input.email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (userWithEmail) {
        return {
          success: false,
          error: 'Un autre utilisateur utilise déjà cette adresse email',
          fieldErrors: {
            email: 'Cette adresse email est déjà utilisée',
          },
        };
      }
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {
      email: input.email,
      fullName: input.fullName,
      role: input.role,
    };

    // Hash and update password if provided
    if (input.password) {
      updateData.passwordHash = await hash(input.password, 10);
    }

    // Update the user
    await prisma.user.update({
      where: { id: input.id },
      data: updateData,
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard/team');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de l'utilisateur",
    };
  }
}

/**
 * Deletes a user
 */
export async function deleteUser(userId: number): Promise<UserOperationResponse> {
  try {
    // Check if the current user has admin privileges
    const currentUserId = await requireAuth();
    if (!currentUserId) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return {
        success: false,
        error: "Vous n'avez pas les droits d'administrateur nécessaires",
      };
    }

    // Prevent admins from deleting themselves
    if (userId === currentUserId) {
      return {
        success: false,
        error: 'Vous ne pouvez pas supprimer votre propre compte',
      };
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "L'utilisateur n'existe pas",
      };
    }

    // Use a transaction to handle cascading operations
    await prisma.$transaction(async tx => {
      // Remove user from tasks
      await tx.userTask.deleteMany({
        where: { userId },
      });

      // Handle projects owned by this user (optional: transfer or delete)
      // For this example, we'll transfer projects to the admin user
      await tx.project.updateMany({
        where: { ownerId: userId },
        data: { ownerId: currentUserId },
      });

      // Delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard/team');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de l'utilisateur",
    };
  }
}
