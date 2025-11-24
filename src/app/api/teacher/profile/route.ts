import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Función para decodificar token
function decodeToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Función para obtener token del request
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = request.cookies.get('auth_token');
  return cookies?.value || null;
}

// GET - Obtener perfil del profesor
export async function GET(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const tokenData = decodeToken(token);

    if (!tokenData?.userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    await client.connect();

    const query = `
      SELECT id, name, email, employment_type, document_number, phone, department, entry_date
      FROM teachers
      WHERE id = $1
    `;

    const result = await client.query(query, [tokenData.userId]);
    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    const teacher = result.rows[0];

    return NextResponse.json(
      {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        employment_type: teacher.employment_type,
        document_number: teacher.document_number,
        phone: teacher.phone,
        department: teacher.department,
        entry_date: teacher.entry_date,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al obtener perfil del profesor:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener perfil',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar perfil del profesor
export async function PUT(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const tokenData = decodeToken(token);

    if (!tokenData?.userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { name, email, employment_type, phone, department } = await request.json();

    await client.connect();

    const updateQuery = `
      UPDATE teachers
      SET name = $1, email = $2, employment_type = $3, phone = $4, department = $5
      WHERE id = $6
      RETURNING id, name, email, employment_type, document_number, phone, department, entry_date
    `;

    const result = await client.query(updateQuery, [
      name,
      email,
      employment_type || null,
      phone || null,
      department || null,
      tokenData.userId,
    ]);

    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    const teacher = result.rows[0];

    return NextResponse.json(
      {
        message: '✅ Perfil actualizado correctamente',
        profile: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          employment_type: teacher.employment_type,
          document_number: teacher.document_number,
          phone: teacher.phone,
          department: teacher.department,
          entry_date: teacher.entry_date,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al actualizar perfil del profesor:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar perfil',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
