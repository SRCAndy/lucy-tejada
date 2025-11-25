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

  useEffect(() => {
    const loadSchedules = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/schedules?studentId=${studentId}`);
        const data = await response.json();

        if (response.ok) {
          setSchedules(data);
        } else {
          setError(data.error || 'Error al cargar horarios');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
    
    // Recargar horarios cada 5 segundos para detectar nuevas matriculaciones
    const interval = setInterval(loadSchedules, 5000);
    
    return () => clearInterval(interval);
  }, [studentId]);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
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
            <p className="text-center text-gray-500">No tienes clases registradas. Inscríbete en un curso para ver tu horario.</p>
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
                            const schedule = schedules.find(
                              (s) =>
                                s.day_of_week === day && s.start_time.substring(0, 5) === time
                            );
                            return (
                              <td key={`${day}-${time}`} className="border p-2 text-center">
                                {schedule ? (
                                  <div className="bg-blue-100 border border-blue-400 rounded p-2 text-sm">
                                    <p className="font-semibold">{schedule.course_name}</p>
                                    <p className="text-xs text-gray-600">{schedule.teacher_name}</p>
                                    <p className="text-xs text-gray-600">
                                      {schedule.start_time} - {schedule.end_time}
                                    </p>
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
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <p className="font-semibold">{schedule.course_name}</p>
                      <p className="text-sm text-gray-600">
                        Profesor: {schedule.teacher_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {schedule.day_of_week} de {schedule.start_time} a {schedule.end_time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
