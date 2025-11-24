# 📚 Sistema de Inscripciones - Documentación de Cambios

## ✅ Cambios Realizados

### 1. **Estructura de Datos Actualizada**

La tabla `courses` ahora contiene:
```sql
student_ids UUID[] -- Array que almacena los IDs de estudiantes inscritos
```

Este array se sincroniza automáticamente cuando:
- Un estudiante se inscribe en un curso
- Un estudiante se desinscribe de un curso

### 2. **Migraciones Automáticas**

Al iniciar la aplicación, se ejecutan automáticamente:
- ✅ Crear columna `student_ids` si no existe
- ✅ Crear función `update_course_student_ids()` para sincronización
- ✅ Crear trigger `trigger_update_course_student_ids` en la tabla `enrollments`
- ✅ Actualizar arrays existentes con datos de inscripciones

**Ubicación**: `/src/lib/startup-migrations.ts`

### 3. **API Endpoints**

#### **GET `/api/admin/courses`**
Retorna lista de cursos con `student_ids` incluido:
```json
[
  {
    "id": "uuid",
    "name": "Curso Ejemplo",
    "code": "CUR101",
    "teacher": "Juan Pérez",
    "capacity": 40,
    "enrolled_students": 25,
    "student_ids": ["uuid1", "uuid2", "uuid3", ...]
  }
]
```

#### **GET `/api/admin/courses/[courseId]/students`**
Obtiene información detallada de estudiantes de un curso:
```json
{
  "course": {
    "id": "uuid",
    "name": "Curso Ejemplo",
    "code": "CUR101",
    "teacher": "Juan Pérez"
  },
  "students": [
    {
      "id": "student-uuid",
      "name": "Juan Estudiante",
      "email": "juan@example.com",
      "id_number": "1234567",
      "city": "Bogotá",
      "gender": "M",
      "enrolled_at": "2025-11-24T10:30:00Z"
    }
  ],
  "total_students": 25
}
```

### 4. **Interfaces Frontend Actualizadas**

```typescript
interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  capacity: number;
  enrolled_students?: number;
  student_ids?: string[];  // ← NUEVO
  days_of_week?: string;
  start_time?: string;
  end_time?: string;
}
```

### 5. **Vistas del Estudiante**

#### **Página `/student/enroll`**
- Muestra todos los cursos disponibles
- Botón "Ver Estudiantes" para cada curso
- Modal que muestra lista de IDs de estudiantes inscritos

### 6. **Vistas del Administrador**

#### **Página `/admin/courses`**
- Nuevo botón "Ver Estudiantes" en cada tarjeta de curso
- Muestra cantidad de estudiantes inscritos
- Modal con lista de IDs de estudiantes

## 🔄 Flujo de Sincronización

```
Estudiante se inscribe en un curso
         ↓
POST /api/student/enroll
         ↓
Insertar en tabla 'enrollments'
         ↓
Trigger: trigger_update_course_student_ids
         ↓
Ejecuta función update_course_student_ids()
         ↓
UPDATE courses.student_ids con ARRAY_AGG(student_id)
```

## 📋 Queries SQL Útiles

Todos estos queries están documentados en `/sql/inscripciones.sql`:

### Ver estudiantes de un curso:
```sql
SELECT 
  c.id, c.name, c.code, c.teacher,
  s.id as student_id, s.name as student_name,
  s.email, s.id_number, s.city, s.gender
FROM courses c
LEFT JOIN students s ON s.id = ANY(c.student_ids)
WHERE c.id = 'COURSE_ID'
ORDER BY s.name ASC;
```

### Ver todos los cursos de un estudiante:
```sql
SELECT c.id, c.name, c.code, c.teacher
FROM courses c
WHERE 'STUDENT_ID' = ANY(c.student_ids)
ORDER BY c.name ASC;
```

### Ver cursos con lista de estudiantes en JSON:
```sql
SELECT 
  c.id, c.name, c.teacher,
  ARRAY_LENGTH(c.student_ids, 1) as total_inscritos,
  c.student_ids
FROM courses c
ORDER BY c.name ASC;
```

## 🚀 Cómo Funciona

1. **Inicio de la App**: Se ejecutan migraciones automáticamente
2. **Inscripción de Estudiante**: 
   - Se inserta en `enrollments`
   - Trigger actualiza `courses.student_ids`
3. **Vista de Estudiantes**:
   - Admin: `/admin/courses` → Ver Estudiantes
   - Estudiante: `/student/enroll` → Ver Estudiantes (por curso)
4. **Data API**: 
   - `/api/admin/courses` incluye `student_ids`
   - `/api/admin/courses/[courseId]/students` para detalles

## 📁 Archivos Modificados

- ✅ `/src/lib/startup-migrations.ts` - Nueva (migraciones automáticas)
- ✅ `/src/lib/migrations.ts` - Actualizado (función reutilizable)
- ✅ `/src/app/layout.tsx` - Agregada ejecución de migraciones
- ✅ `/src/app/api/migrations/route.ts` - Endpoint para migraciones manual
- ✅ `/src/app/api/admin/courses/route.ts` - Ahora incluye `student_ids`
- ✅ `/src/app/api/admin/courses/[courseId]/students/route.ts` - Nuevo endpoint
- ✅ `/src/app/admin/courses/page.tsx` - Agregado botón "Ver Estudiantes"
- ✅ `/src/app/student/enroll/page.tsx` - Agregado modal de estudiantes
- ✅ `/sql/inscripciones.sql` - Actualizado con nuevas queries
- ✅ `/src/app/admin/management/page.tsx` - Revertido (sin reportes)

## ⚠️ Notas Importantes

1. **Auto-actualización**: El array `student_ids` se mantiene sincronizado automáticamente
2. **Performance**: Para cursos con muchos estudiantes, el array puede crecer
3. **Consultas**: Se pueden filtrar estudiantes usando `= ANY(student_ids)`
4. **Integridad**: El trigger automático previene inconsistencias

## 🧪 Testing

Para verificar que funciona:

1. Crear un curso como admin
2. Inscribir un estudiante en el curso
3. Ir a `/admin/courses` y ver "Ver Estudiantes"
4. Ir a `/student/enroll` y ver "Ver Estudiantes" en el curso
5. Verificar que aparecen los IDs de estudiantes

---

**Última actualización**: Noviembre 24, 2025
