import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { name, email, password } = await request.json();

    // Validar campos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, email, password' },
        { status: 400 }
      );
    }

    await client.connect();

    // Generar UUID automáticamente
    const id = uuidv4();

    // Insertar estudiante
    const query = `
      INSERT INTO students (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email;
    `;

    const result = await client.query(query, [id, name, email, password]);
    await client.end();

    return NextResponse.json(
      {
        message: '✅ Estudiante insertado correctamente',
        student: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al insertar estudiante:', error);
    return NextResponse.json(
      {
        error: 'Error al insertar estudiante',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Obtener todos los estudiantes
    const result = await client.query('SELECT id, name, email FROM students;');
    await client.end();

    return NextResponse.json(
      {
        message: '✅ Estudiantes obtenidos correctamente',
        students: result.rows,
        count: result.rows.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al obtener estudiantes:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estudiantes',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
