import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Helper para decodificar token
function decodeToken(token: string) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded;
  } catch {
    return null;
  }
}

// Helper para obtener token del header
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Si no está en header, intentar desde cookies
  return request.cookies.get('auth_token')?.value || null;
}

export async function GET(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Obtener token
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Decodificar token
    const tokenData = decodeToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let studentId = searchParams.get('id');

    // Si no se proporciona ID, usar el del token
    if (!studentId) {
      studentId = tokenData.userId;
    }

    // Verificar que el usuario solo acceda a su propio perfil
    if (studentId !== tokenData.userId && tokenData.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a este perfil' },
        { status: 403 }
      );
    }

    await client.connect();

    const query = `
      SELECT id, name, email, address, city, id_number, gender
      FROM students
      WHERE id = $1
    `;

    const result = await client.query(query, [studentId]);
    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener perfil',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Obtener token
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Decodificar token
    const tokenData = decodeToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { id, name, email, address, city, id_number, gender } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario solo actualice su propio perfil
    if (id !== tokenData.userId && tokenData.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permiso para actualizar este perfil' },
        { status: 403 }
      );
    }

    await client.connect();

    const query = `
      UPDATE students
      SET name = $1, email = $2, address = $3, city = $4, id_number = $5, gender = $6
      WHERE id = $7
      RETURNING id, name, email, address, city, id_number, gender
    `;

    const result = await client.query(query, [
      name,
      email,
      address,
      city,
      id_number,
      gender,
      id,
    ]);

    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: '✅ Perfil actualizado correctamente',
        student: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar perfil',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
