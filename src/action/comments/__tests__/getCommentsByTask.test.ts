import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getCommentsByTask } from '../getCommentsByTask';
import { prisma } from '@/lib/prisma';
import { User, Task, Project, Comment } from '@prisma/client';

describe('getCommentsByTask', () => {
  let testUser: User;
  let testProject: Project;
  let testTask: Task;
  let testComment: Comment;

  beforeEach(async () => {
    // Créer un utilisateur de test
    testUser = await prisma.user.create({
      data: {
        email: `test-comments-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        fullName: 'Test User Comments',
      },
    });

    // Créer un projet de test
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project Comments',
        ownerId: testUser.id,
      },
    });

    // Créer une tâche de test
    testTask = await prisma.task.create({
      data: {
        title: 'Test Task Comments',
        projectId: testProject.id,
      },
    });

    // Créer un commentaire de test
    testComment = await prisma.comment.create({
      data: {
        content: 'Commentaire de test',
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
      where: { email: testUser.email },
    });
  });

  it('devrait récupérer les commentaires d\'une tâche avec les informations de l\'auteur', async () => {
    const comments = await getCommentsByTask(testTask.id);

    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      id: testComment.id,
      content: 'Commentaire de test',
      taskId: testTask.id,
      authorId: testUser.id,
      author: {
        id: testUser.id,
        fullName: 'Test User Comments',
        email: testUser.email,
      },
    });
  });

  it('devrait retourner une liste vide pour une tâche sans commentaires', async () => {
    // Créer une nouvelle tâche sans commentaires
    const taskWithoutComments = await prisma.task.create({
      data: {
        title: 'Task Without Comments',
        projectId: testProject.id,
      },
    });

    const comments = await getCommentsByTask(taskWithoutComments.id);

    expect(comments).toHaveLength(0);

    // Nettoyer
    await prisma.task.delete({
      where: { id: taskWithoutComments.id },
    });
  });

  it('devrait retourner les commentaires dans l\'ordre chronologique', async () => {
    // Créer un deuxième commentaire
    const secondComment = await prisma.comment.create({
      data: {
        content: 'Deuxième commentaire',
        taskId: testTask.id,
        authorId: testUser.id,
      },
    });

    const comments = await getCommentsByTask(testTask.id);

    expect(comments).toHaveLength(2);
    expect(new Date(comments[0].createdAt).getTime()).toBeLessThanOrEqual(
      new Date(comments[1].createdAt).getTime()
    );

    // Nettoyer
    await prisma.comment.delete({
      where: { id: secondComment.id },
    });
  });

  it('devrait retourner une liste vide en cas d\'erreur avec une tâche inexistante', async () => {
    const comments = await getCommentsByTask(99999); // ID inexistant

    expect(comments).toHaveLength(0);
  });
});