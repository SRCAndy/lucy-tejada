
'use client';

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, MessageSquarePlus, Send, MessageCircle, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAuthToken, getSessionFromStorage } from "@/lib/auth";

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  capacity: number;
  enrolled_students: number;
  days_of_week?: string;
  start_time?: string;
  end_time?: string;
}

const scheduleData = [
  {
    time: "08:00 - 10:00",
    Lunes: null,
    Martes: null,
    Miércoles: null,
    Jueves: null,
    Viernes: null,
  },
  {
    time: "10:00 - 11:30",
    Lunes: { name: "Introducción a la Ciencia de Datos", room: "A-101", color: "blue" },
    Miércoles: { name: "Introducción a la Ciencia de Datos", room: "A-101", color: "blue" },
    Martes: null,
    Jueves: null,
    Viernes: null,
  },
  {
    time: "14:00 - 15:30",
    Lunes: { name: "Estructuras de Datos", room: "B-105", color: "green" },
    Miércoles: { name: "Estructuras de Datos", room: "B-105", color: "green" },
    Martes: null,
    Jueves: null,
    Viernes: null,
  },
];

const recentAnnouncements = [
    {
        course: "Introducción a la Ciencia de Datos",
        title: "Recordatorio: Próximo examen parcial",
        date: "Hace 2 horas"
    },
    {
        course: "Estructuras de Datos",
        title: "Material de estudio complementario",
        date: "Ayer"
    }
]


const getCourseColor = (color: string) => {
    switch (color) {
        case "blue": return "bg-blue-100 border-blue-200 text-blue-800";
        case "purple": return "bg-purple-100 border-purple-200 text-purple-800";
        case "green": return "bg-green-100 border-green-200 text-green-800";
        default: return "bg-gray-100 border-gray-200 text-gray-800";
    }
}

export default function SchedulePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const loadTeacherCourses = async () => {
      try {
        const authToken = getAuthToken();
        const session = getSessionFromStorage();

        if (!session?.userId) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        setToken(authToken || '');

        // Obtener cursos del profesor
        const response = await fetch('/api/teacher/courses', {
          headers: {
            'x-teacher-id': session.userId,
          }
        });

        if (!response.ok) {
          setError('Error al cargar tus cursos');
          setLoading(false);
          return;
        }

        const coursesData = await response.json();
        setCourses(coursesData);
        
        // Establecer el primer curso como seleccionado por defecto
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0].id);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los cursos');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherCourses();
  }, []);

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          author: getSessionFromStorage()?.user_name || 'Profesor',
          date: new Date().toISOString(),
          category: 'General'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess('✅ Aviso publicado correctamente');
        setTitle('');
        setContent('');
        setTimeout(() => setSubmitSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al publicar el aviso');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al publicar el aviso');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="space-y-8">
      <PageHeader
        title="Mi Horario"
        description="Consulta tu horario de clases semanal y gestiona tus avisos."
      >
        <Calendar className="h-8 w-8 text-primary" />
      </PageHeader>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-700">{submitSuccess}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Horario de Clases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px]">Hora</TableHead>
                  <TableHead>Lunes</TableHead>
                  <TableHead>Martes</TableHead>
                  <TableHead>Miércoles</TableHead>
                  <TableHead>Jueves</TableHead>
                  <TableHead>Viernes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((row) => (
                  <TableRow key={row.time}>
                    <TableCell className="font-medium text-muted-foreground">{row.time}</TableCell>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => {
                        const course = row[day as keyof typeof row] as { name: string; room: string; color: string } | null;
                        return (
                            <TableCell key={day} className="p-1 align-top h-24">
                                {course && (
                                    <div className={`p-2 rounded-lg border h-full ${getCourseColor(course.color)}`}>
                                        <p className="font-semibold text-sm">{course.name}</p>
                                        <p className="text-xs">Salón: {course.room}</p>
                                    </div>
                                )}
                            </TableCell>
                        )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquarePlus className="h-5 w-5 text-primary" />
                    Publicar un Nuevo Aviso
                </CardTitle>
                <CardDescription>
                    Crea y envía notificaciones importantes a los estudiantes de tus cursos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tienes cursos asignados en este momento</p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handlePublishAnnouncement}>
                    <div className="space-y-2">
                        <Label htmlFor="course-select">Curso</Label>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger id="course-select">
                                <SelectValue placeholder="Selecciona un curso" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
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
                          rows={5}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          disabled={submitting}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button 
                          type="submit"
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
                    </div>
                  </form>
                )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Avisos Recientes
                </CardTitle>
                <CardDescription>
                    Un historial de tus últimos avisos publicados.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {recentAnnouncements.map((ann, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{ann.title}</p>
                                <p className="text-sm text-muted-foreground">{ann.course}</p>
                            </div>
                            <p className="text-xs text-muted-foreground flex-shrink-0">{ann.date}</p>
                        </div>
                        {index < recentAnnouncements.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
