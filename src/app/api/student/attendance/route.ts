import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID requerido' }, { status: 400 });
    }

    await client.connect();

    // Obtener cursos inscritos del estudiante con su asistencia
    const result = await client.query(`
      SELECT 
        c.id as course_id,
        c.name as course_name,
        a.attendance_date,
        a.present
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      LEFT JOIN attendance a ON c.id = a.course_id AND e.student_id = a.student_id
      WHERE e.student_id = $1
      ORDER BY c.name, a.attendance_date DESC
    `, [studentId]);

    // Agrupar por curso
    const courseMap: Record<string, any> = {};

    result.rows.forEach((row: any) => {
      const courseId = row.course_id;
      
      if (!courseMap[courseId]) {
        courseMap[courseId] = {
          course_name: row.course_name,
          total_classes: 0,
          present_count: 0,
          absent_count: 0,
          attendance_percentage: 0,
          records: []
        };
      }

      // Solo agregar registro si hay asistencia registrada
      if (row.attendance_date) {
        courseMap[courseId].records.push({
          course_id: courseId,
          course_name: row.course_name,
          attendance_date: row.attendance_date,
          present: row.present
        });
      }
    });

    // Calcular totales
    Object.values(courseMap).forEach((courseData: any) => {
      courseData.total_classes = courseData.records.length;
      courseData.present_count = courseData.records.filter((r: any) => r.present).length;
      courseData.absent_count = courseData.total_classes - courseData.present_count;
      courseData.attendance_percentage = courseData.total_classes > 0 
        ? Math.round((courseData.present_count / courseData.total_classes) * 100) 
        : 0;
    });

    return NextResponse.json(courseMap);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { error: 'Error al obtener asistencias' },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
