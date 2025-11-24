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
    const result = await client.query('SELECT NOW()');
    await client.end();
    
    return NextResponse.json(
      {
        status: 'ok',
        message: '✅ Conexión exitosa a PostgreSQL',
        timestamp: result.rows[0].now,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error de conexión a BD:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: '❌ Error de conexión a PostgreSQL',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
