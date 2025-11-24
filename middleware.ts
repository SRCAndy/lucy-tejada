import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/forgot-password', '/api/auth', '/api/health'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar si hay cookie de autenticación
  const authToken = request.cookies.get('auth_token')?.value;

  if (!authToken) {
    // Si no hay token, redirigir al login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Proteger todas las rutas excepto las públicas
    '/((?!_next|.*\\..*|login|register|forgot-password|api/auth|api/health).*)',
  ],
};
