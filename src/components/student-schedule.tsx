'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface StudentSchedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course_name: string;
  teacher_name: string;
}

interface StudentScheduleProps {
  studentId?: string;
}

export default function StudentSchedule({ studentId }: StudentScheduleProps) {
  const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para agrupar bloques por curso
  const getUniqueCourses = () => {
    const uniqueCourses = new Map<string, StudentSchedule>();
    schedules.forEach(schedule => {
      if (schedule.course_name && !uniqueCourses.has(schedule.course_name)) {
        uniqueCourses.set(schedule.course_name, schedule);
      }
    });
    return Array.from(uniqueCourses.values());
  };

  useEffect(() => {
    const syncAndLoadSchedules = async () => {
      if (!studentId) {
        console.log('[STUDENT-SCHEDULE] No studentId provided');
        setLoading(false);
        return;
      }

      try {
        console.log('[STUDENT-SCHEDULE] Sincronizando horarios para estudiante:', studentId);
        
        // Primero, sincronizar/regenerar horarios
        const syncResponse = await fetch('/api/admin/regenerate-student-schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId }),
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log('[STUDENT-SCHEDULE] Sincronización completada:', syncData);
        } else {
          console.warn('[STUDENT-SCHEDULE] Error en sincronización:', await syncResponse.json());
        }

        // Ahora cargar los horarios
        console.log('[STUDENT-SCHEDULE] Cargando horarios para estudiante:', studentId);
        const response = await fetch(`/api/admin/schedules?studentId=${studentId}`);
        const data = await response.json();

        console.log('[STUDENT-SCHEDULE] Response:', { ok: response.ok, count: data.length || 0 });

        if (response.ok) {
          console.log('[STUDENT-SCHEDULE] Horarios obtenidos:', data.length);
          setSchedules(data);
          if (data.length === 0) {
            console.warn('[STUDENT-SCHEDULE] ⚠️ El estudiante no tiene horarios asignados');
          }
        } else {
          setError(data.error || 'Error al cargar horarios');
          console.error('[STUDENT-SCHEDULE] Error en response:', data);
        }
      } catch (err) {
        console.error('[STUDENT-SCHEDULE] Error de conexión:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    syncAndLoadSchedules();
    
    // Recargar horarios cada 5 segundos para detectar nuevas matriculaciones
    const interval = setInterval(syncAndLoadSchedules, 5000);
    
    return () => clearInterval(interval);
  }, [studentId]);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const timeSlots = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && schedules.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Horario</h1>
          <p className="text-muted-foreground">Visualiza tu horario de clases</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Horario</h1>
        <p className="text-muted-foreground">Visualiza tu horario de clases</p>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes clases registradas. Inscríbete en un curso para ver tu horario.</p>
              <p className="text-xs text-gray-400">
                {!studentId ? '(Sin ID de estudiante)' : `(Estudiante ID: ${studentId})`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Card>
            <CardHeader>
              <CardTitle>Horario de Clases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="border p-2 text-left font-bold">Hora</th>
                      {daysOfWeek.map((day) => (
                        <th key={day} className="border p-2 text-left font-bold text-center">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, timeIndex) => {
                      const nextTime = timeSlots[timeIndex + 1];
                      return (
                        <tr key={time} className="border-b hover:bg-gray-50">
                          <td className="border p-2 font-semibold text-sm">
                            {time} - {nextTime}
                          </td>
                          {daysOfWeek.map((day) => {
                            // Obtener TODOS los bloques que coinciden con este día y hora
                            const daySchedules = schedules.filter(
                              (s) =>
                                s.course_name &&
                                s.day_of_week === day && 
                                s.start_time.substring(0, 5) === time
                            );
                            
                            return (
                              <td key={`${day}-${time}`} className="border p-2 text-center">
                                {daySchedules.length > 0 ? (
                                  <div className="space-y-1">
                                    {daySchedules.map((schedule, idx) => (
                                      <div key={`${schedule.id}-${idx}`} className="bg-blue-100 border border-blue-400 rounded p-2 text-sm">
                                        <p className="font-semibold">{schedule.course_name}</p>
                                        <p className="text-xs text-gray-600">{schedule.teacher_name}</p>
                                        <p className="text-xs text-gray-600">
                                          {schedule.start_time} - {schedule.end_time}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="font-bold text-lg">Resumen de Clases</h3>
                {schedules && schedules.length > 0 ? (
                  getUniqueCourses().map((course) => {
                    // Obtener todos los bloques de este curso
                    const courseBlocks = schedules.filter(
                      s => s.course_name === course.course_name
                    );
                    
                    return (
                      <div key={course.course_name} className="flex items-start gap-3 p-3 bg-gray-50 rounded border">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                          <p className="font-semibold">{course.course_name}</p>
                          <p className="text-sm text-gray-600">
                            Profesor: {course.teacher_name}
                          </p>
                          <div className="text-sm text-gray-600 space-y-1 mt-1">
                            {courseBlocks.map((block, idx) => (
                              <p key={`${block.id}-${idx}`}>
                                {block.day_of_week}: {block.start_time} - {block.end_time}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay clases asignadas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
