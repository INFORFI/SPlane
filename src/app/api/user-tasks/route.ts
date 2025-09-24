import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAssignedTasks } from '@/action/tasks/getAssignedTasks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    const tasks = await getAssignedTasks(user.id);

    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: {
        id: task.project.id,
        name: task.project.name,
        description: task.project.description,
        startDate: task.project.startDate,
        endDate: task.project.endDate,
      },
      assignedUsers: task.userTasks.map(userTask => ({
        id: userTask.user.id,
        fullName: userTask.user.fullName,
        email: userTask.user.email,
        assignedAt: userTask.assignedAt,
      })),
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      tasks: formattedTasks,
      totalTasks: formattedTasks.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Méthode GET non supportée. Utilisez POST avec email et password dans le body.',
    },
    { status: 405 }
  );
}
