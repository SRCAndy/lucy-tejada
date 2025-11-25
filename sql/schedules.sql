-- Crear tabla schedules si no existe
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON schedules(day_of_week, start_time, end_time);

-- Crear tabla student_schedules si no existe
CREATE TABLE IF NOT EXISTS student_schedules (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, schedule_id)
);

-- Crear índices para student_schedules
CREATE INDEX IF NOT EXISTS idx_student_schedules_student_id ON student_schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_student_schedules_course_id ON student_schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_student_schedules_schedule_id ON student_schedules(schedule_id);
