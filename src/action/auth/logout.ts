'use server';

import { cookies } from 'next/headers';

/**
 * Déconnecte l'utilisateur en supprimant le cookie de session
 * @returns Un objet indiquant le succès de l'opération
 */
export async function logout() {
  try {
    const cookieStore = await cookies();
    
    // Suppression du cookie de session
    cookieStore.delete({
      name: 'session_token',
      path: '/',
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return { success: false, error: 'Une erreur est survenue lors de la déconnexion' };
  }
}