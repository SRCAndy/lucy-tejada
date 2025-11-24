'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle, Plus, Trash2, Users, X } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
  teacher: string;
  credits: number;
  capacity: number;
  enrolled_students?: number;
  student_ids?: string[];
  days_of_week?: string;
  start_time?: string;
  end_time?: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showStudents, setShowStudents] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    teacher_id: '',
    credits: '',
    capacity: '',
    days_of_week: '',
    start_time: '',
    end_time: '',
  });

  // Cargar cursos y profesores
  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          fetch('/api/admin/courses'),
          fetch('/api/admin/teachers'),
        ]);

        const coursesData = await coursesRes.json();
        const teachersData = await teachersRes.json();

        if (coursesRes.ok) {
          setCourses(coursesData);
        }
        if (teachersRes.ok) {
          setTeachers(teachersData);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          teacher_id: formData.teacher_id,
          credits: parseInt(formData.credits),
          capacity: parseInt(formData.capacity),
          days_of_week: formData.days_of_week || null,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Curso creado correctamente');
        setCourses([...courses, data.course]);
        setFormData({
          name: '',
          code: '',
          teacher_id: '',
          credits: '',
          capacity: '',
          days_of_week: '',
          start_time: '',
          end_time: '',
        });
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al crear curso');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso?')) return;

    try {
      const response = await fetch(`/api/admin/courses?id=${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== courseId));
        setSuccess('✅ Curso eliminado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
          <p className="text-muted-foreground">Crea y administra los cursos disponibles</p>
        </div>
        <Button 
          className="bg-primary text-primary-foreground"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear Curso
        </Button>
      </div>

      {/* Formulario de Crear Curso */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Curso</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Matemáticas Básicas"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código del Curso</Label>
                  <Input
                    id="code"
                    placeholder="Ej: MAT101"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher_id">Profesor</Label>
                  <Select value={formData.teacher_id} onValueChange={(value) => handleInputChange('teacher_id', value)} disabled={saving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un profesor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Créditos</Label>
                  <Input
                    id="credits"
                    type="number"
                    placeholder="Ej: 3"
                    value={formData.credits}
                    onChange={(e) => handleInputChange('credits', e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Ej: 40"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days_of_week">Días (opcional)</Label>
                  <Input
                    id="days_of_week"
                    placeholder="Ej: Lun, Mié, Vie"
                    value={formData.days_of_week}
                    onChange={(e) => handleInputChange('days_of_week', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora de Inicio (opcional)</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora de Fin (opcional)</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-primary text-primary-foreground"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Curso'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Lista de Cursos */}
      <div className="grid gap-4">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No hay cursos registrados</p>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{course.name}</h3>
                    <p className="text-sm text-gray-600">Código: {course.code}</p>
                    <p className="text-sm text-gray-600">Profesor: {course.teacher}</p>
                    <p className="text-sm text-gray-600">Créditos: {course.credits} | Capacidad: {course.capacity}</p>
                    <p className="text-sm text-gray-600">Estudiantes inscritos: {course.student_ids?.length || 0}</p>
                    {course.days_of_week && (
                      <p className="text-sm text-gray-600">Horario: {course.days_of_week} {course.start_time} - {course.end_time}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowStudents(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Ver Estudiantes
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Estudiantes */}
      {showStudents && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{selectedCourse.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Total estudiantes: {selectedCourse.student_ids?.length || 0}</p>
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
                      <span className="text-sm font-mono">{studentId}</span>
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
