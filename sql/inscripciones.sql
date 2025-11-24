-- ============================================
-- QUERIES SQL PARA GESTIÓN DE INSCRIPCIONES
-- ============================================
-- Nota: La aplicación ejecuta automáticamente las migraciones
-- al iniciar. Estos queries son referencias para uso manual.
-- ============================================

-- 1. AGREGAR COLUMNA DE ESTUDIANTES A LA TABLA COURSES (si no existe)
-- Esta columna almacenará un array de IDs de estudiantes inscritos
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS student_ids UUID[] DEFAULT '{}';

-- 2. AGREGAR ESTUDIANTE A UN CURSO (Insertar en enrollments y actualizar array)
-- Pasos:
-- 1. Insertar en enrollments
-- 2. Actualizar el array student_ids en courses
INSERT INTO enrollments (student_id, course_id)
VALUES ('STUDENT_ID_AQUI', 'COURSE_ID_AQUI')
ON CONFLICT DO NOTHING;

-- Después ejecutar esta query para actualizar el array:
UPDATE courses 
SET student_ids = (
    SELECT ARRAY_AGG(DISTINCT e.student_id) 
    FROM enrollments e 
    WHERE e.course_id = courses.id
)
WHERE id = 'COURSE_ID_AQUI';

-- 3. OBTENER TODOS LOS ESTUDIANTES DE UN CURSO (desde el array)
SELECT 
    c.id,
    c.name,
    c.code,
    c.teacher,
    c.capacity,
    c.enrolled_students,
    c.student_ids,
    ARRAY_LENGTH(c.student_ids, 1) as total_estudiantes_array
FROM courses c
WHERE c.id = 'COURSE_ID_AQUI';

-- 4. OBTENER DETALLES COMPLETOS DE ESTUDIANTES EN UN CURSO
SELECT 
    c.id as course_id,
    c.name as course_name,
    s.id as student_id,
    s.name as student_name,
    s.email as student_email,
    s.id_number,
    s.city
FROM courses c
LEFT JOIN students s ON s.id = ANY(c.student_ids)
WHERE c.id = 'COURSE_ID_AQUI'
ORDER BY s.name ASC;

-- 5. ELIMINAR ESTUDIANTE DE UN CURSO
-- 1. Eliminar de enrollments
DELETE FROM enrollments 
WHERE student_id = 'STUDENT_ID_AQUI' 
AND course_id = 'COURSE_ID_AQUI';

-- 2. Actualizar el array en courses
UPDATE courses 
SET student_ids = (
    SELECT ARRAY_AGG(DISTINCT e.student_id) 
    FROM enrollments e 
    WHERE e.course_id = courses.id
)
WHERE id = 'COURSE_ID_AQUI';

-- 6. ACTUALIZAR TODOS LOS ARRAYS DE CURSOS (ejecutar después de cambios en enrollments)
UPDATE courses c
SET student_ids = (
    SELECT ARRAY_AGG(DISTINCT e.student_id) 
    FROM enrollments e 
    WHERE e.course_id = c.id
);

-- 7. VER TODOS LOS CURSOS CON SUS ESTUDIANTES
SELECT 
    c.id,
    c.name,
    c.code,
    c.teacher,
    c.capacity,
    c.enrolled_students,
    c.student_ids,
    ARRAY_LENGTH(c.student_ids, 1) as total_inscritos
FROM courses c
ORDER BY c.name ASC;

-- 8. CREAR TRIGGER PARA ACTUALIZAR AUTOMÁTICAMENTE EL ARRAY CUANDO HAY CAMBIOS EN ENROLLMENTS
CREATE OR REPLACE FUNCTION update_course_student_ids()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar cuando se inserta un enrollment
    IF TG_OP = 'INSERT' THEN
        UPDATE courses 
        SET student_ids = (
            SELECT ARRAY_AGG(DISTINCT e.student_id) 
            FROM enrollments e 
            WHERE e.course_id = NEW.course_id
        )
        WHERE id = NEW.course_id;
    END IF;
    
    -- Actualizar cuando se elimina un enrollment
    IF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET student_ids = (
            SELECT ARRAY_AGG(DISTINCT e.student_id) 
            FROM enrollments e 
            WHERE e.course_id = OLD.course_id
        )
        WHERE id = OLD.course_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CREAR TRIGGER EN LA TABLA ENROLLMENTS
DROP TRIGGER IF EXISTS trigger_update_course_student_ids ON enrollments;
CREATE TRIGGER trigger_update_course_student_ids
AFTER INSERT OR DELETE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_course_student_ids();

-- 10. BUSCAR UN ESTUDIANTE ESPECÍFICO EN UN CURSO
SELECT 
    c.id,
    c.name,
    'STUDENT_ID_AQUI' = ANY(c.student_ids) as esta_inscrito
FROM courses c
WHERE c.id = 'COURSE_ID_AQUI';

-- 11. CONTAR CUÁNTOS CURSOS TIENE UN ESTUDIANTE
SELECT 
    COUNT(*) as total_cursos
FROM courses c
WHERE 'STUDENT_ID_AQUI' = ANY(c.student_ids);

-- 12. VER TODOS LOS CURSOS DE UN ESTUDIANTE (desde el array)
SELECT 
    c.id,
    c.name,
    c.code,
    c.teacher,
    c.capacity,
    c.enrolled_students,
    c.days_of_week,
    c.start_time,
    c.end_time
FROM courses c
WHERE 'STUDENT_ID_AQUI' = ANY(c.student_ids)
ORDER BY c.name ASC;
