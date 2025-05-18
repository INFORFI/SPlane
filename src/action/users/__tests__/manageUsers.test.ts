import { createUser, updateUser, deleteUser } from '@/action/users/manageUsers';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockFindUnique = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockUpdateMany = jest.fn();
  const mockDelete = jest.fn();
  const mockDeleteMany = jest.fn();
  const mockTransaction = jest.fn();

  return {
    prisma: {
      user: {
        findUnique: mockFindUnique,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
      },
      userTask: {
        deleteMany: mockDeleteMany,
      },
      project: {
        updateMany: mockUpdateMany,
      },
      $transaction: mockTransaction,
    },
  };
});

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('User Management Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    const validUserInput = {
      email: 'test@example.com',
      fullName: 'Test User',
      role: Role.USER,
      password: 'password123',
    };

    it('should return error if user is not authenticated', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(null);

      const result = await createUser(validUserInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Vous devez être connecté pour effectuer cette action');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should return error if user is not an admin', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        role: Role.USER,
      });

      const result = await createUser(validUserInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Vous n'avez pas les droits d'administrateur nécessaires");
    });

    it('should return error if email is already taken', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce({ id: 2, email: 'test@example.com' });

      const result = await createUser(validUserInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Un utilisateur avec cet email existe déjà');
      expect(result.fieldErrors?.email).toBe('Cette adresse email est déjà utilisée');
    });

    it('should create user successfully', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 2,
        email: 'test@example.com',
        fullName: 'Test User',
        role: Role.USER,
      });

      const result = await createUser(validUserInput);

      expect(result.success).toBe(true);
      expect(hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'Test User',
          passwordHash: 'hashed_password',
          role: Role.USER,
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/team');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle database errors', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await createUser(validUserInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Une erreur est survenue lors de la création de l'utilisateur");
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const validUpdateInput = {
      id: 2,
      email: 'updated@example.com',
      fullName: 'Updated User',
      role: Role.USER,
    };

    it('should return error if user is not authenticated', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(null);

      const result = await updateUser(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Vous devez être connecté pour effectuer cette action');
    });

    it('should return error if user is not an admin', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        role: Role.USER,
      });

      const result = await updateUser(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Vous n'avez pas les droits d'administrateur nécessaires");
    });

    it('should return error if user to update does not exist', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce(null);

      const result = await updateUser(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("L'utilisateur n'existe pas");
    });

    it('should return error if new email is already taken', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce({ id: 2, email: 'old@example.com' })
        .mockResolvedValueOnce({ id: 3, email: 'updated@example.com' });

      const result = await updateUser(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Un autre utilisateur utilise déjà cette adresse email');
      expect(result.fieldErrors?.email).toBe('Cette adresse email est déjà utilisée');
    });

    it('should update user without password successfully', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce({ id: 2, email: 'old@example.com' })
        .mockResolvedValueOnce(null);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 2,
        email: 'updated@example.com',
        fullName: 'Updated User',
        role: Role.USER,
      });

      const result = await updateUser(validUpdateInput);

      expect(result.success).toBe(true);
      expect(hash).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          email: 'updated@example.com',
          fullName: 'Updated User',
          role: Role.USER,
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/team');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should update user with password successfully', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce({ id: 2, email: 'old@example.com' })
        .mockResolvedValueOnce(null);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 2,
        email: 'updated@example.com',
        fullName: 'Updated User',
        role: Role.USER,
      });

      const result = await updateUser({
        ...validUpdateInput,
        password: 'newpassword123',
      });

      expect(result.success).toBe(true);
      expect(hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          email: 'updated@example.com',
          fullName: 'Updated User',
          role: Role.USER,
          passwordHash: 'hashed_password',
        },
      });
    });

    it('should handle database errors', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce({ id: 2, email: 'old@example.com' })
        .mockResolvedValueOnce(null);
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await updateUser(validUpdateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Une erreur est survenue lors de la mise à jour de l'utilisateur");
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should return error if user is not authenticated', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(null);

      const result = await deleteUser(2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Vous devez être connecté pour effectuer cette action');
    });

    it('should return error if user is not an admin', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        role: Role.USER,
      });

      const result = await deleteUser(2);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Vous n'avez pas les droits d'administrateur nécessaires");
    });

    it('should prevent admin from deleting their own account', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1,
        role: Role.ADMIN,
      });

      const result = await deleteUser(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Vous ne pouvez pas supprimer votre propre compte');
    });

    it('should return error if user to delete does not exist', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce(null);

      const result = await deleteUser(2);

      expect(result.success).toBe(false);
      expect(result.error).toBe("L'utilisateur n'existe pas");
    });

    it('should delete user successfully', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce({ id: 2, email: 'user@example.com' });

      // Mock transaction execution
      const mockUserTaskDeleteMany = jest.fn().mockResolvedValue({});
      const mockProjectUpdateMany = jest.fn().mockResolvedValue({});
      const mockUserDelete = jest.fn().mockResolvedValue({});

      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        return await callback({
          userTask: { deleteMany: mockUserTaskDeleteMany },
          project: { updateMany: mockProjectUpdateMany },
          user: { delete: mockUserDelete },
        });
      });

      const result = await deleteUser(2);

      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockUserTaskDeleteMany).toHaveBeenCalledWith({
        where: { userId: 2 },
      });
      expect(mockProjectUpdateMany).toHaveBeenCalledWith({
        where: { ownerId: 2 },
        data: { ownerId: 1 },
      });
      expect(mockUserDelete).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/team');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle database errors', async () => {
      (requireAuth as jest.Mock).mockResolvedValue(1);
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: Role.ADMIN })
        .mockResolvedValueOnce({ id: 2, email: 'user@example.com' });
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await deleteUser(2);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Une erreur est survenue lors de la suppression de l'utilisateur");
      expect(console.error).toHaveBeenCalled();
    });
  });
});
