'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut'
);

// Créer un token JWT pour l'authentification
export async function createSessionToken(userId: number): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('7d') // Expire après 7 jours
    .sign(JWT_SECRET);
}

// Vérifier et décoder un token JWT
export async function verifySessionToken(token: string): Promise<number | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload.userId as number;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
}

// Générer un token pour la réinitialisation du mot de passe
export async function generateResetToken(userId: number): Promise<string> {
  // Créer un token avec une durée de validité courte (1 heure)
  const token = await new SignJWT({ userId, type: 'reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);

  // En production, vous pourriez stocker ce token dans une base de données
  // avec une date d'expiration pour une validation supplémentaire

  return token;
}

// Vérifier un token de réinitialisation de mot de passe
export async function verifyResetToken(token: string): Promise<number | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);

    // Vérifier que c'est bien un token de réinitialisation
    if (verified.payload.type !== 'reset') {
      return null;
    }

    return verified.payload.userId as number;
  } catch (error) {
    console.error('Erreur de vérification du token de réinitialisation:', error);
    return null;
  }
}

// Récupérer l'utilisateur authentifié à partir de la requête
export async function getAuthenticatedUser(): Promise<number | null> {
  // Récupérer le token depuis les cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return null;
  }

  // Vérifier le token et récupérer l'ID de l'utilisateur
  return await verifySessionToken(token);
}

export async function requireAuth(): Promise<number | null> {
  const userId = await getAuthenticatedUser();

  if (!userId) {
    return null;
  }

  return userId;
}
