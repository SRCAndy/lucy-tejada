'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<any[]>([]);

  const handleSync = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    setCourses([]);

    try {
      const response = await fetch('/api/sync/student-ids', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setCourses(data.courses || []);
      } else {
        setError(data.error || 'Error en la sincronización');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Sincronización de Datos</h1>
        <p className="text-muted-foreground">Sincroniza los IDs de estudiantes en los cursos</p>
      </div>

      <Button onClick={handleSync} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sincronizando...
          </>
        ) : (
          'Sincronizar Ahora'
        )}
      </Button>

      {message && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-700">{message}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {courses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Cursos Sincronizados</h2>
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="text-lg">{course.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><span className="font-medium">Código:</span> {course.code}</p>
                <p><span className="font-medium">Estudiantes inscritos:</span> {course.total_students || 0}</p>
                <p><span className="font-medium">Contador:</span> {course.enrolled_students}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
