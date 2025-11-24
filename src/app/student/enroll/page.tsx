'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle, BookOpen, X, Users } from 'lucide-react';
import { getAuthToken, getSessionFromStorage } from '@/lib/auth';

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  capacity: number;
  enrolled_students: number;
  student_ids?: string[];
  days_of_week?: string;
  start_time?: string;
  end_time?: string;
}

export default function EnrollPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showStudents, setShowStudents] = useState(false);
  const [studentId, setStudentId] = useState<string>('');

  useEffect(() => {
    const loadCoursesAndEnrollments = async () => {
      try {
        const session = getSessionFromStorage();
        if (session?.userId) {
          setStudentId(session.userId);
        }

        const response = await fetch('/api/admin/courses');
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setCourses(data);
          
          // Obtener los cursos en los que el estudiante está inscrito
          if (session?.userId) {
            const enrolled = data
              .filter((course: Course) => course.student_ids?.includes(session.userId))
              .map((course: Course) => course.id);
            setEnrolledCourses(enrolled);
          }
        } else {
          setError('Error al cargar cursos');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    loadCoursesAndEnrollments();
  }, []);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(true);
    setError('');
    setSuccess('');

    const token = getAuthToken();

    if (!token) {
      setError('Debes estar logueado como estudiante');
      setEnrolling(false);
      return;
    }

    try {
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Inscripción exitosa');
        setEnrolledCourses([...enrolledCourses, courseId]);
        setTimeout(() => setSuccess(''), 3000);
      } else if (response.status === 409) {
        setError('Ya estás inscrito en este curso');
      } else {
        setError(data.error || 'Error al inscribirse');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Inscribirse en Cursos</h1>
        <p className="text-muted-foreground">Selecciona los cursos en los que deseas inscribirte</p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Lista de Cursos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No hay cursos disponibles en este momento</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          courses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course.id);
            const isFull = course.enrolled_students >= course.capacity;

            return (
              <Card key={course.id} className={isFull ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{course.code}</p>
                    </div>
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Profesor:</span> {course.teacher}</p>
                    <p><span className="font-semibold">Créditos:</span> {course.credits}</p>
                    <p><span className="font-semibold">Estudiantes:</span> {course.enrolled_students}/{course.capacity}</p>
                    {course.days_of_week && (
                      <p><span className="font-semibold">Horario:</span> {course.days_of_week} {course.start_time} - {course.end_time}</p>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(course.enrolled_students / course.capacity) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleEnroll(course.id)}
                      disabled={isEnrolled || isFull || enrolling}
                      variant={isEnrolled ? 'outline' : 'default'}
                      title={isEnrolled ? 'Ya estás inscrito en este curso' : isFull ? 'El curso está lleno' : 'Haz clic para inscribirte'}
                    >
                      {isEnrolled ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Ya estás inscrito
                        </>
                      ) : isFull ? (
                        'Lleno'
                      ) : (
                        'Inscribirse'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowStudents(true);
                      }}
                      className="px-3"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Estudiantes */}
      {showStudents && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{selectedCourse.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Estudiantes inscritos: {selectedCourse.enrolled_students}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowStudents(false);
                  setSelectedCourse(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {selectedCourse.student_ids && selectedCourse.student_ids.length > 0 ? (
                <div className="space-y-2">
                  {selectedCourse.student_ids.map((studentId, index) => (
                    <div
                      key={studentId}
                      className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                      <span className="text-sm">{studentId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm">No hay estudiantes inscritos</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
