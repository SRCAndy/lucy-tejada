-- ============================================
-- TABLA DE CALIFICACIONES (GRADES)
-- ============================================

-- 1. CREAR TABLA DE TIPOS DE CALIFICACIONES
CREATE TABLE IF NOT EXISTS grade_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  weight DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, name)
);

-- 2. CREAR TABLA DE CALIFICACIONES
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  grade_type_id UUID NOT NULL REFERENCES grade_types(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, student_id, grade_type_id)
);

-- 3. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_grade_types_course_id ON grade_types(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_course_id ON grades(course_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_grade_type_id ON grades(grade_type_id);
CREATE INDEX IF NOT EXISTS idx_grades_unique_lookup ON grades(course_id, student_id);
