import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

// Chemins publics qui ne nécessitent pas d'authentification
const publicPaths = ['/', '/login', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  // Vérifier si le chemin est public
  const path = request.nextUrl.pathname;
  if (publicPaths.some(pp => path === pp || path.startsWith(`${pp}/`))) {
    return NextResponse.next();
  }
  
  // Pour les API routes d'authentification, permettre l'accès
  if (path.startsWith('/api/auth') && !path.includes('/me')) {
    return NextResponse.next();
  }
  
  // Pour toutes les autres routes, vérifier l'authentification
  const token = request.cookies.get('session_token')?.value;
  
  if (!token) {
    // Rediriger vers la page de login si le token n'existe pas
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', encodeURIComponent(request.url));
    return NextResponse.redirect(loginUrl);
  }
  
  // Vérifier la validité du token
  const userId = await verifySessionToken(token);
  
  if (!userId) {
    // Rediriger vers la page de login si le token est invalide
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', encodeURIComponent(request.url));
    return NextResponse.redirect(loginUrl);
  }
  
  // Si l'utilisateur est authentifié, permettre l'accès
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};