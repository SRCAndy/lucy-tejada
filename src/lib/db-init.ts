import { Client } from 'pg';

export async function initializeDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('[DB-INIT] Iniciando migraciones de base de datos...');

    // Verificar si la tabla schedules existe
    const checkSchedulesTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schedules'
      );
    `);

    if (!checkSchedulesTable.rows[0].exists) {
      // Crear tabla schedules
      await client.query(`
        CREATE TABLE schedules (
          id UUID PRIMARY KEY,
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
          day_of_week VARCHAR(20) NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabla schedules creada');

      // Crear índices para schedules
      await client.query(`
        CREATE INDEX idx_schedules_course_id ON schedules(course_id);
        CREATE INDEX idx_schedules_teacher_id ON schedules(teacher_id);
      `);
      console.log('✅ Índices de schedules creados');
    } else {
      console.log('✅ Tabla schedules ya existe');
      
      // Verificar que las columnas existan con los tipos correctos
      const columnCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'schedules'
      `);
      console.log('Columnas actuales en schedules:');
      columnCheck.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Verificar si la tabla student_schedules existe
    const checkStudentSchedulesTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'student_schedules'
      );
    `);

    if (!checkStudentSchedulesTable.rows[0].exists) {
      // Crear tabla student_schedules
      await client.query(`
        CREATE TABLE student_schedules (
          id UUID PRIMARY KEY,
          student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, schedule_id)
        );
      `);
      console.log('✅ Tabla student_schedules creada');

      // Crear índices para student_schedules
      await client.query(`
        CREATE INDEX idx_student_schedules_student_id ON student_schedules(student_id);
        CREATE INDEX idx_student_schedules_course_id ON student_schedules(course_id);
        CREATE INDEX idx_student_schedules_schedule_id ON student_schedules(schedule_id);
      `);
      console.log('✅ Índices de student_schedules creados');
    } else {
      console.log('✅ Tabla student_schedules ya existe');
    }

    // Verificar si la tabla grade_types existe
    const checkGradeTypesTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'grade_types'
      );
    `);

    if (!checkGradeTypesTable.rows[0].exists) {
      // Crear tabla grade_types
      await client.query(`
        CREATE TABLE grade_types (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          weight DECIMAL(3, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(course_id, name)
        );
      `);
      console.log('✅ Tabla grade_types creada');

      // Crear índice para grade_types
      await client.query(`
        CREATE INDEX idx_grade_types_course_id ON grade_types(course_id);
      `);
      console.log('✅ Índice de grade_types creado');
    } else {
      console.log('✅ Tabla grade_types ya existe');
    }

    // Verificar si la tabla grades existe
    const checkGradesTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'grades'
      );
    `);

    if (!checkGradesTable.rows[0].exists) {
      // Crear tabla grades
      await client.query(`
        CREATE TABLE grades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
          student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          grade_type_id UUID NOT NULL REFERENCES grade_types(id) ON DELETE CASCADE,
          score DECIMAL(5, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(course_id, student_id, grade_type_id)
        );
      `);
      console.log('✅ Tabla grades creada');

      // Crear índices para grades
      await client.query(`
        CREATE INDEX idx_grades_course_id ON grades(course_id);
        CREATE INDEX idx_grades_student_id ON grades(student_id);
        CREATE INDEX idx_grades_grade_type_id ON grades(grade_type_id);
        CREATE INDEX idx_grades_unique_lookup ON grades(course_id, student_id);
      `);
      console.log('✅ Índices de grades creados');
    } else {
      console.log('✅ Tabla grades ya existe');
      
      // Verificar que la columna grade_type_id existe
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'grades' AND column_name = 'grade_type_id'
        );
      `);
      
      if (!columnCheck.rows[0].exists) {
        console.log('⚠️ Tabla grades existe pero necesita ser actualizada. Recreando...');
        
        // Eliminar tabla antigua
        await client.query('DROP TABLE IF EXISTS grades CASCADE;');
        
        // Crear tabla nueva
        await client.query(`
          CREATE TABLE grades (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            grade_type_id UUID NOT NULL REFERENCES grade_types(id) ON DELETE CASCADE,
            score DECIMAL(5, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(course_id, student_id, grade_type_id)
          );
        `);
        console.log('✅ Tabla grades recreada correctamente');

        // Crear índices para grades
        await client.query(`
          CREATE INDEX idx_grades_course_id ON grades(course_id);
          CREATE INDEX idx_grades_student_id ON grades(student_id);
          CREATE INDEX idx_grades_grade_type_id ON grades(grade_type_id);
          CREATE INDEX idx_grades_unique_lookup ON grades(course_id, student_id);
        `);
        console.log('✅ Índices de grades creados');
      }
    }

    await client.end();
    console.log('[DB-INIT] ✅ Migraciones completadas exitosamente');
  } catch (error) {
    console.error('[DB-INIT] ❌ Error durante las migraciones:', error);
    throw error;
  }
}
