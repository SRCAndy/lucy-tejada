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
    const { id, name, email, password, role } = await request.json();

    // Validar campos requeridos
    if (!id || !name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: id, name, email, password, role' },
        { status: 400 }
      );
    }

    // Validar rol
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    await client.connect();

    let table = '';
    if (role === 'admin') {
      table = 'admins';
    } else if (role === 'teacher') {
      table = 'teachers';
    } else if (role === 'student') {
      table = 'students';
    }

    // Verificar si el email ya existe
    const checkEmail = `SELECT email FROM ${table} WHERE email = $1`;
    const emailResult = await client.query(checkEmail, [email]);

    if (emailResult.rows.length > 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Generar UUID a partir del ID proporcionado (para mantener relación)
    // Usamos una combinación: primeros 8 caracteres del ID + UUID generado
    const generatedUuid = uuidv4();
    // Construimos un UUID determinístico basado en el ID del usuario
    const userIdUuid = `${id.padEnd(36, '0').substring(0, 8)}-${id.padEnd(36, '0').substring(8, 12)}-${id.padEnd(36, '0').substring(12, 16)}-${id.padEnd(36, '0').substring(16, 20)}-${id.padEnd(36, '0').substring(20, 32)}`;

    // Insertar nuevo usuario (usar UUID generado)
    let insertQuery = '';
    if (role === 'student') {
      insertQuery = `
        INSERT INTO students (id, name, email, password, id_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email;
      `;
    } else if (role === 'teacher') {
      insertQuery = `
        INSERT INTO teachers (id, name, email, password, document_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email;
      `;
    } else if (role === 'admin') {
      insertQuery = `
        INSERT INTO admins (id, name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email;
      `;
    }

    const result = role === 'admin' 
      ? await client.query(insertQuery, [generatedUuid, name, email, password])
      : await client.query(insertQuery, [generatedUuid, name, email, password, id]);
    await client.end();

    return NextResponse.json(
      {
        message: '✅ Registro exitoso',
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error en registro:', error);
    return NextResponse.json(
      {
        error: 'Error en el registro',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
