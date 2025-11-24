import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logout exitoso' },
    { status: 200 }
  );

  // Limpiar cookies
  response.cookies.set('auth_token', '', { maxAge: 0 });
  response.cookies.set('user_session', '', { maxAge: 0 });

  return response;
}
