-- ============================================
-- TABLA DE HORARIOS (SCHEDULES)
-- ============================================

-- Crear tabla de horarios si no existe
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE(course_id, day_of_week, start_time)
);

-- Tabla para almacenar horarios de estudiantes
CREATE TABLE IF NOT EXISTS student_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    schedule_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    UNIQUE(student_id, schedule_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_schedules_student_id ON student_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_student_schedules_course_id ON student_schedules(course_id);

-- ============================================
-- QUERIES ÚTILES PARA HORARIOS
-- ============================================

-- Ver horarios de un profesor
-- SELECT * FROM schedules WHERE teacher_id = 'TEACHER_ID' ORDER BY day_of_week, start_time;

-- Ver horarios de un estudiante
-- SELECT s.*, c.name as course_name, t.name as teacher_name 
-- FROM student_schedules ss
-- JOIN schedules s ON ss.schedule_id = s.id
-- JOIN courses c ON s.course_id = c.id
-- JOIN teachers t ON s.teacher_id = t.id
-- WHERE ss.student_id = 'STUDENT_ID'
-- ORDER BY s.day_of_week, s.start_time;

-- Ver horarios de un curso
-- SELECT * FROM schedules WHERE course_id = 'COURSE_ID' ORDER BY day_of_week, start_time;
