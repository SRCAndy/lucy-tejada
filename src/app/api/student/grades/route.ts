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

    // Obtener calificaciones del estudiante en sus cursos
    const result = await client.query(`
      SELECT 
        c.id as course_id,
        c.name as course_name,
        gt.name as grade_type_name,
        g.score
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      LEFT JOIN grades g ON c.id = g.course_id AND e.student_id = g.student_id
      LEFT JOIN grade_types gt ON g.grade_type_id = gt.id
      WHERE e.student_id = $1
      ORDER BY c.name, gt.created_at
    `, [studentId]);

    // Agrupar por curso
    const courseMap: Record<string, any> = {};

    result.rows.forEach((row: any) => {
      const courseId = row.course_id;
      
      if (!courseMap[courseId]) {
        courseMap[courseId] = {
          course_name: row.course_name,
          grades: [],
          average: 0
        };
      }

      if (row.grade_type_name && row.score !== null) {
        courseMap[courseId].grades.push({
          grade_type_name: row.grade_type_name,
          score: parseFloat(row.score)
        });
      }
    });

    // Calcular promedio por curso
    Object.values(courseMap).forEach((courseData: any) => {
      if (courseData.grades.length > 0) {
        const sum = courseData.grades.reduce((acc: number, g: any) => acc + g.score, 0);
        courseData.average = sum / courseData.grades.length;
      }
    });

    await client.end();

    return NextResponse.json(courseMap);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json(
      { error: 'Error al obtener calificaciones' },
      { status: 500 }
    );
  }
}
