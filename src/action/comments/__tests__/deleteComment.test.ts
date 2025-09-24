import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { deleteComment } from '../deleteComment';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { User, Task, Project, Comment } from '@prisma/client';

// Mock requireAuth
jest.mock('@/lib/auth');
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('deleteComment', () => {
  let testUser: User;
  let otherUser: User;
  let adminUser: User;
  let testProject: Project;
  let testTask: Task;
  let testComment: Comment;

  beforeEach(async () => {
    // Créer utilisateurs de test
    testUser = await prisma.user.create({
      data: {
        email: `test-delete-comment-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        fullName: 'Test User Delete Comment',
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: `other-user-delete-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        fullName: 'Other User',
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: `admin-user-delete-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        fullName: 'Admin User',
        role: 'ADMIN',
      },
    });

    // Créer un projet de test
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project Delete Comment',
        ownerId: testUser.id,
      },
    });

    // Créer une tâche de test
    testTask = await prisma.task.create({
      data: {
        title: 'Test Task Delete Comment',
        projectId: testProject.id,
      },
    });

    // Créer un commentaire de test
    testComment = await prisma.comment.create({
      data: {
        content: 'Commentaire à supprimer',
        taskId: testTask.id,
        authorId: testUser.id,
      },
    });
  });

  afterEach(async () => {
    // Nettoyer les données de test
    await prisma.comment.deleteMany({
      where: { taskId: testTask.id },
    });
    await prisma.task.deleteMany({
      where: { projectId: testProject.id },
    });
    await prisma.project.deleteMany({
      where: { ownerId: testUser.id },
    });
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testUser.email },
          { email: otherUser.email },
          { email: adminUser.email }
        ]
      },
    });

    jest.clearAllMocks();
  });

  it('devrait permettre à l\'auteur de supprimer son commentaire', async () => {
    mockRequireAuth.mockResolvedValue(testUser.id);

    const result = await deleteComment(testComment.id);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    // Vérifier que le commentaire a été supprimé
    const deletedComment = await prisma.comment.findUnique({
      where: { id: testComment.id },
    });
    expect(deletedComment).toBeNull();
  });

  it('devrait permettre à un administrateur de supprimer n\'importe quel commentaire', async () => {
    mockRequireAuth.mockResolvedValue(adminUser.id);

    const result = await deleteComment(testComment.id);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    // Vérifier que le commentaire a été supprimé
    const deletedComment = await prisma.comment.findUnique({
      where: { id: testComment.id },
    });
    expect(deletedComment).toBeNull();
  });

  it('devrait empêcher un autre utilisateur de supprimer un commentaire', async () => {
    mockRequireAuth.mockResolvedValue(otherUser.id);

    const result = await deleteComment(testComment.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Vous n\'avez pas le droit de supprimer ce commentaire');

    // Vérifier que le commentaire n'a pas été supprimé
    const existingComment = await prisma.comment.findUnique({
      where: { id: testComment.id },
    });
    expect(existingComment).not.toBeNull();
  });

  it('devrait échouer si l\'utilisateur n\'est pas authentifié', async () => {
    mockRequireAuth.mockResolvedValue(null);

    const result = await deleteComment(testComment.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentification requise');

    // Vérifier que le commentaire n'a pas été supprimé
    const existingComment = await prisma.comment.findUnique({
      where: { id: testComment.id },
    });
    expect(existingComment).not.toBeNull();
  });

  it('devrait échouer si le commentaire n\'existe pas', async () => {
    mockRequireAuth.mockResolvedValue(testUser.id);

    const result = await deleteComment(99999); // ID inexistant

    expect(result.success).toBe(false);
    expect(result.error).toBe('Commentaire introuvable');
  });

  it('devrait échouer si l\'utilisateur actuel n\'existe pas', async () => {
    mockRequireAuth.mockResolvedValue(99999); // ID utilisateur inexistant

    const result = await deleteComment(testComment.id);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Utilisateur introuvable');

    // Vérifier que le commentaire n'a pas été supprimé
    const existingComment = await prisma.comment.findUnique({
      where: { id: testComment.id },
    });
    expect(existingComment).not.toBeNull();
  });
});