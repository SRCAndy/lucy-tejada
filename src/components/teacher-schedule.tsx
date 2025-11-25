'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle, Send } from 'lucide-react';

interface Schedule {
  id: string;
  course_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  classroom?: string;
  course_name: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author?: string;
  created_at: string;
  category?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface TeacherScheduleProps {
  teacherId?: string;
}

export default function TeacherSchedule({ teacherId }: TeacherScheduleProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadSchedules = async () => {
      if (!teacherId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/schedules?teacherId=${teacherId}`);
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
  }, [teacherId]);

  // Cargar cursos del profesor
  useEffect(() => {
    const loadCourses = async () => {
      if (!teacherId) return;

      try {
        const response = await fetch('/api/teacher/courses', {
          headers: { 'x-teacher-id': teacherId }
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data);
          if (data.length > 0) {
            setSelectedCourseId(data[0].id);
            loadAnnouncements(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    loadCourses();
  }, [teacherId]);

  // Cargar avisos cuando cambia el curso
  useEffect(() => {
    if (selectedCourseId) {
      loadAnnouncements(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadAnnouncements = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/announcements`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId || !title.trim() || !content.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSubmitting(true);
    setError('');
    setSubmitSuccess('');

    try {
      const response = await fetch(`/api/courses/${selectedCourseId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          author: 'Profesor',
          category: 'General',
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitSuccess('✅ Aviso publicado correctamente');
        setTitle('');
        setContent('');
        loadAnnouncements(selectedCourseId);
        setTimeout(() => setSubmitSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al publicar');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && schedules.length === 0) {
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
        <p className="text-muted-foreground">Visualiza tu horario de clases y gestiona avisos</p>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No hay horarios registrados</p>
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
                                  <div className="bg-yellow-100 border border-yellow-400 rounded p-2 text-sm">
                                    <p className="font-semibold">{schedule.course_name}</p>
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
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div className="flex-1">
                      <p className="font-semibold">{schedule.course_name}</p>
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

      {/* Sección de Avisos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Avisos */}
        <Card>
          <CardHeader>
            <CardTitle>Publicar Aviso</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-center text-gray-500">No tienes cursos asignados</p>
            ) : (
              <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-select">Curso</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={submitting}>
                    <SelectTrigger id="course-select">
                      <SelectValue placeholder="Selecciona un curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement-title">Título del Aviso</Label>
                  <Input
                    id="announcement-title"
                    placeholder="Ej: Recordatorio de examen"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="announcement-content">Contenido del Aviso</Label>
                  <Textarea
                    id="announcement-content"
                    placeholder="Escribe aquí los detalles del aviso..."
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded bg-red-50 border border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {submitSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded bg-green-50 border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700">{submitSuccess}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publicar Aviso
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Lista de Avisos Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Avisos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-center text-gray-500">No hay avisos publicados</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="font-semibold text-sm">{announcement.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(announcement.created_at).toLocaleDateString()} {new Date(announcement.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
