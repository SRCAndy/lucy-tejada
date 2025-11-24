import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { email, password, role } = await request.json();

    // Validar campos requeridos
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, contraseña y rol son requeridos' },
        { status: 400 }
      );
    }

    await client.connect();

    let query = '';
    let table = '';

    // Seleccionar tabla según el rol
    if (role === 'admin') {
      table = 'admins';
    } else if (role === 'teacher') {
      table = 'teachers';
    } else if (role === 'student') {
      table = 'students';
    } else {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Buscar usuario en la tabla correspondiente
    query = `SELECT id, name, email, password FROM ${table} WHERE email = $1`;
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verificar contraseña (comparación simple por ahora)
    if (user.password !== password) {
      await client.end();
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    await client.end();

    // Crear token simple (en producción usar JWT)
    const tokenData = {
      userId: user.id,
      email: user.email,
      role: role,
      name: user.name,
      timestamp: Date.now(),
    };

    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // Login exitoso - crear sesión
    const response = NextResponse.json(
      {
        message: 'Login exitoso',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
        },
      },
      { status: 200 }
    );

    // Guardar token en cookie httpOnly
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    // También guardar datos básicos en cookie no-httpOnly para acceso desde cliente
    response.cookies.set('user_session', JSON.stringify({
      userId: user.id,
      role: role,
      name: user.name,
      email: user.email,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      {
        error: 'Error en el login',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
