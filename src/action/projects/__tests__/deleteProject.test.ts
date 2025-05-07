import { deleteProject } from '@/action/projects/deleteProject';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Mocks
jest.mock('@/lib/prisma', () => {
  const mockUserTaskDeleteMany = jest.fn().mockResolvedValue({});
  const mockTaskDeleteMany = jest.fn().mockResolvedValue({});
  const mockProjectDelete = jest.fn().mockResolvedValue({});
  const mockFindUnique = jest.fn();

  return {
    prisma: {
      project: {
        findUnique: mockFindUnique,
        delete: mockProjectDelete,
      },
      task: {
        deleteMany: mockTaskDeleteMany,
      },
      userTask: {
        deleteMany: mockUserTaskDeleteMany,
      },
      $transaction: jest.fn(async (callback) => {
        // Exécute réellement le callback avec l'objet transaction simulé
        return await callback({
          userTask: { deleteMany: mockUserTaskDeleteMany },
          task: { deleteMany: mockTaskDeleteMany },
          project: { delete: mockProjectDelete },
        });
      }),
    },
  };
});

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('deleteProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return error if projectId is not a valid number', async () => {
    const result = await deleteProject('invalid-id');

    expect(result).toEqual({
      success: false,
      message: 'ID de projet invalide',
      error: 'INVALID_ID',
    });
    expect(requireAuth).not.toHaveBeenCalled();
    expect(prisma.project.findUnique).not.toHaveBeenCalled();
  });

  it('should return error if user is not authenticated', async () => {
    // Mock requireAuth to return null (not authenticated)
    (requireAuth as jest.Mock).mockResolvedValue(null);

    const result = await deleteProject('123');

    expect(result).toEqual({
      success: false,
      message: 'Vous devez être connecté pour supprimer un projet',
      error: 'UNAUTHORIZED',
    });
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.project.findUnique).not.toHaveBeenCalled();
  });

  it('should return error if project is not found', async () => {
    // Mock requireAuth to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    // Mock project not found
    (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await deleteProject('123');

    expect(result).toEqual({
      success: false,
      message: 'Projet non trouvé',
      error: 'NOT_FOUND',
    });
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should return error if user is not the project owner', async () => {
    // Mock requireAuth to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    // Mock project with different owner
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 123,
      ownerId: 2, // Different user ID
    });

    const result = await deleteProject('123');

    expect(result).toEqual({
      success: false,
      message: "Vous n'êtes pas autorisé à supprimer ce projet",
      error: 'FORBIDDEN',
    });
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should delete project and all related data successfully', async () => {
    // Mock requireAuth to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    // Mock project with matching owner
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 123,
      ownerId: 1, // Same as user ID
    });
    // Mock transaction success
    (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteProject('123');

    expect(result).toEqual({
      success: true,
      message: 'Projet supprimé avec succès',
    });
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
    expect(prisma.$transaction).toHaveBeenCalled(); 

    // Vérifier que les chemins ont été revalidés
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/projects');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  it('should accept and convert numeric projectId', async () => {
    // Mock requireAuth to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    // Mock project with matching owner
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 123,
      ownerId: 1,
    });
    // Mock transaction success
    (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);

    // Passer un ID numérique plutôt qu'une chaîne
    const result = await deleteProject(123);

    expect(result.success).toBe(true);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
  });

  it('should handle database errors', async () => {
    // Mock requireAuth to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    // Mock project with matching owner
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 123,
      ownerId: 1,
    });
    // Mock transaction failure
    const testError = new Error('Database error');
    (prisma.$transaction as jest.Mock).mockRejectedValue(testError);

    const result = await deleteProject('123');

    expect(result).toEqual({
      success: false,
      message: 'Une erreur est survenue lors de la suppression du projet',
      error: 'Database error',
    });
    expect(requireAuth).toHaveBeenCalled();
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should handle unexpected error types', async () => {
    // Mock requireAuth to return a user ID
    (requireAuth as jest.Mock).mockResolvedValue(1);
    // Mock project with matching owner
    (prisma.project.findUnique as jest.Mock).mockResolvedValue({
      id: 123,
      ownerId: 1,
    });
    // Mock transaction failure with non-Error object
    (prisma.$transaction as jest.Mock).mockRejectedValue('Unexpected error');

    const result = await deleteProject('123');

    expect(result).toEqual({
      success: false,
      message: 'Une erreur est survenue lors de la suppression du projet',
      error: 'UNKNOWN_ERROR',
    });
  });
});