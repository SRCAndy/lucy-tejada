import { NextResponse } from 'next/server';
import { Client } from 'pg';

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

    const query = `
      SELECT id, name, email
      FROM teachers
      ORDER BY name ASC
    `;

    const result = await client.query(query);
    await client.end();

    return NextResponse.json(
      { teachers: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al obtener profesores:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener profesores',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
