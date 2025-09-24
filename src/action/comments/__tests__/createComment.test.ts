import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createComment } from '../createComment';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { User, Task, Project } from '@prisma/client';

// Mock requireAuth
jest.mock('@/lib/auth');
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('createComment', () => {
  let testUser: User;
  let testProject: Project;
  let testTask: Task;

  beforeEach(async () => {
    // Créer un utilisateur de test
    testUser = await prisma.user.create({
      data: {
        email: `test-create-comment-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        fullName: 'Test User Create Comment',
      },
    });

    // Créer un projet de test
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project Create Comment',
        ownerId: testUser.id,
      },
    });

    // Créer une tâche de test
    testTask = await prisma.task.create({
      data: {
        title: 'Test Task Create Comment',
        projectId: testProject.id,
      },
    });

    // Mock de l'authentification
    mockRequireAuth.mockResolvedValue(testUser.id);
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
      where: { email: testUser.email },
    });

    jest.clearAllMocks();
  });

  it('devrait créer un commentaire avec succès', async () => {
    const commentData = {
      content: 'Voici un nouveau commentaire',
      taskId: testTask.id,
    };

    const result = await createComment(commentData);

    expect(result.success).toBe(true);
    expect(result.comment).toBeDefined();
    expect(result.comment!.content).toBe(commentData.content);
    expect(result.comment!.taskId).toBe(testTask.id);
    expect(result.comment!.authorId).toBe(testUser.id);
    expect(result.comment!.author).toMatchObject({
      id: testUser.id,
      fullName: testUser.fullName,
      email: testUser.email,
    });
  });

  it('devrait échouer si l\'utilisateur n\'est pas authentifié', async () => {
    mockRequireAuth.mockResolvedValueOnce(null);

    const commentData = {
      content: 'Commentaire sans auth',
      taskId: testTask.id,
    };

    const result = await createComment(commentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentification requise');
    expect(result.comment).toBeUndefined();
  });

  it('devrait échouer si le contenu est vide', async () => {
    const commentData = {
      content: '   ', // Contenu vide avec espaces
      taskId: testTask.id,
    };

    const result = await createComment(commentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Le contenu du commentaire ne peut pas être vide');
    expect(result.comment).toBeUndefined();
  });

  it('devrait échouer si le contenu dépasse 1000 caractères', async () => {
    const longContent = 'a'.repeat(1001);
    const commentData = {
      content: longContent,
      taskId: testTask.id,
    };

    const result = await createComment(commentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Le commentaire ne peut pas dépasser 1000 caractères');
    expect(result.comment).toBeUndefined();
  });

  it('devrait échouer si la tâche n\'existe pas', async () => {
    const commentData = {
      content: 'Commentaire pour tâche inexistante',
      taskId: 99999, // ID inexistant
    };

    const result = await createComment(commentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Tâche introuvable');
    expect(result.comment).toBeUndefined();
  });

  it('devrait nettoyer le contenu en supprimant les espaces en trop', async () => {
    const commentData = {
      content: '   Commentaire avec espaces   ',
      taskId: testTask.id,
    };

    const result = await createComment(commentData);

    expect(result.success).toBe(true);
    expect(result.comment!.content).toBe('Commentaire avec espaces');
  });
});