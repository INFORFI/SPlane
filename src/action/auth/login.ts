'use server';

import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';

import { createSessionToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function login(email: string, password: string) {
  if (!email || !password) {
    return { error: 'Email et mot de passe sont requis' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (!user) {
      return { error: 'Utilisateur non trouvé' };
    }

    const passwordMatch = await compare(password, user.passwordHash);

    if (!passwordMatch) {
      return { error: 'Mot de passe incorrect' };
    }

    const token = await createSessionToken(user.id);

    const cookieStore = await cookies();

    cookieStore.set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: 'strict',
    });

    return { success: 'Connexion réussie' };
  } catch (error) {
    console.error(error);
    return { error: 'Une erreur est survenue lors de la connexion' };
  }
}
