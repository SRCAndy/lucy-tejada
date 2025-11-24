-- ============================================
-- TABLAS PARA AVISOS Y ASISTENCIA
-- ============================================

-- 1. AGREGAR COLUMNA DE CURSO A ANNOUNCEMENTS (si no existe)
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

-- Crear índice para course_id
CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);


-- 2. CREAR TABLA DE ASISTENCIA (ATTENDANCE)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  present BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREAR ÍNDICES PARA ATTENDANCE
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON attendance(course_id, student_id, attendance_date);

-- 4. INSERTAR REGISTROS DE ASISTENCIA DE EJEMPLO (OPCIONAL)
INSERT INTO attendance (course_id, student_id, attendance_date, present)
SELECT c.id, s.id, CURRENT_DATE - interval '1 day' * (n), RANDOM() > 0.2
FROM courses c
CROSS JOIN students s
CROSS JOIN generate_series(1, 10) as n
WHERE s.id = ANY(c.student_ids)
ON CONFLICT DO NOTHING;
