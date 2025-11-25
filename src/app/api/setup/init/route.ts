import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db-init';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    return NextResponse.json(
      { message: '✅ Base de datos inicializada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al inicializar BD:', error);
    return NextResponse.json(
      {
        error: 'Error al inicializar base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
