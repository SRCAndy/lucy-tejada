# Guía de Fixes para el Módulo de Horarios

## Problema Identificado
El módulo de guardado de horarios no estaba guardando correctamente los datos de `day_of_week`, `start_time` y `end_time` en la base de datos.

## Causas Raíces Encontradas

1. **Tabla `schedules` puede no existir** - Las migraciones de BD no se estaban ejecutando automáticamente
2. **Falta de validación** - Los errores en la inserción no se estaban capturando adecuadamente
3. **Sin logs de depuración** - Era difícil saber dónde fallaba el proceso

## Soluciones Implementadas

### 1. Sistema de Migraciones Automáticas (`src/lib/db-init.ts`)
Se creó una función `initializeDatabase()` que:
- Verifica si la tabla `schedules` existe
- Crea la tabla con la estructura correcta:
  ```sql
  CREATE TABLE schedules (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );
  ```
- Crea índices para mejorar rendimiento
- Verifica la tabla `student_schedules` y sus índices

### 2. Endpoint de Inicialización (`src/app/api/setup/init/route.ts`)
Se creó un endpoint GET que ejecuta las migraciones:
```
GET /api/setup/init
```
Úsalo una vez al iniciar para asegurar que la BD está lista.

### 3. Logs Detallados Agregados
Se añadieron console.logs en:
- `src/app/api/admin/courses/route.ts` - Para ver cuando se generan y insertan horarios
- `src/app/api/admin/schedules/route.ts` - Para depuración de generación de horarios
- `src/app/api/student/enrollments/route.ts` - Para ver cuando se vinculan horarios a estudiantes

## Pasos para Aplicar los Fixes

### Paso 0: Verificar el Estado Actual (Opcional)
Ejecuta este comando para ver si ya tienes horarios configurados:
```bash
node verify-schedules.js
```

Verás algo como:
```
🔍 Verificando configuración de horarios...

✅ Conectado a PostgreSQL

1️⃣  Verificando tabla schedules...
   ✅ Tabla schedules existe

   Estructura:
     - id: uuid
     - course_id: uuid
     - teacher_id: uuid
     - day_of_week: character varying
     - start_time: time without time zone
     - end_time: time without time zone

2️⃣  Verificando tabla student_schedules...
   ✅ Tabla student_schedules existe

3️⃣  Verificando datos en schedules...
   Total de horarios: 5
```

### Paso 1: Inicializar la Base de Datos
1. Inicia la aplicación
2. Abre en tu navegador: `http://localhost:3000/api/setup/init`
3. Deberías ver una respuesta como:
   ```json
   {
     "message": "✅ Base de datos inicializada correctamente"
   }
   ```

### Paso 2: Crear un Curso
1. Ve al panel de administración
2. Crea un nuevo curso con:
   - Nombre: "Matemáticas 101"
   - Código: "MAT101"
   - Créditos: 3 (esto genera 2 bloques de 2 horas)
   - Capacidad: 30
3. Observa en la consola los logs:
   ```
   [COURSES] Generando 2 bloques de horario para el curso [uuid]
   [COURSES] Insertando horario: Lunes 06:00-08:00
   [COURSES] ✅ Horario insertado: [uuid]
   [COURSES] Insertando horario: Miércoles 10:00-12:00
   [COURSES] ✅ Horario insertado: [uuid]
   ```

### Paso 3: Verificar en la Base de Datos
```sql
SELECT * FROM schedules LIMIT 5;
```
Deberías ver filas con:
- `day_of_week`: "Lunes", "Miércoles", etc.
- `start_time`: "06:00:00", "10:00:00", etc.
- `end_time`: "08:00:00", "12:00:00", etc.

### Paso 4: Matricular un Estudiante
1. Como estudiante, inscríbete en el curso
2. Observa en la consola:
   ```
   [ENROLLMENTS] Obteniendo horarios para el curso [uuid]
   [ENROLLMENTS] Se encontraron 2 horarios para el curso
   [ENROLLMENTS] Vinculando horario [uuid] al estudiante
   [ENROLLMENTS] ✅ Horario vinculado al estudiante
   ```

### Paso 5: Ver los Horarios
Los horarios deberían aparecer en:
- **Para profesores**: `/admin/schedules` 
- **Para estudiantes**: `/student/schedule`

## Función de Generación de Bloques

La función `generateScheduleBlocks(credits)` genera automáticamente horarios según los créditos:
- **2 créditos** → 2 horas por semana (1 bloque de 2 horas)
- **3 créditos** → 4 horas por semana (2 bloques de 2 horas)
- **4 créditos** → 6 horas por semana (3 bloques de 2 horas)

Los horarios se distribuyen en:
- Lunes, Martes, Miércoles, Jueves, Viernes
- Franjas de 2 horas (06:00-20:00)

## Qué Esperar

Después de aplicar estos cambios:

1. ✅ Los horarios se guardarán correctamente en la BD
2. ✅ Los logs te mostrarán exactamente qué está sucediendo
3. ✅ Los profesores verán sus horarios de clase
4. ✅ Los estudiantes verán los horarios de sus cursos inscritos
5. ✅ No habrá más datos faltantes (`NULL`) en day_of_week, start_time, end_time

## Troubleshooting

Si aún no ves los horarios:

1. **Verifica que la tabla existe**:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'schedules';
   ```

2. **Revisa los logs de la consola** cuando crees un curso

3. **Verifica que las referencias FK existan**:
   ```sql
   SELECT * FROM courses LIMIT 1;
   SELECT * FROM teachers LIMIT 1;
   ```

4. **Ejecuta manualmente la migración**:
   ```
   GET /api/setup/init
   ```

## Archivos Modificados

- `src/lib/db-init.ts` - Nuevo (sistema de migraciones)
- `src/app/api/setup/init/route.ts` - Nuevo (endpoint de inicialización)
- `src/app/api/admin/courses/route.ts` - Modificado (logs agregados)
- `src/app/api/admin/schedules/route.ts` - Modificado (logs agregados)
- `src/app/api/student/enrollments/route.ts` - Modificado (logs agregados)
- `sql/schedules.sql` - Actualizado (definición de tablas)
