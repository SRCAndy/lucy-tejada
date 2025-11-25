'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface GradeInfo {
  grade_type_name: string;
  score: number;
}

interface CourseGrades {
  course_name: string;
  grades: GradeInfo[];
  average: number;
}

export default function StudentGradesPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, CourseGrades>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStudentId = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setStudentId(data.id);
      } catch (err) {
        console.error('Error getting student ID:', err);
        router.push('/login');
      }
    };

    getStudentId();
  }, [router]);

  useEffect(() => {
    if (!studentId) return;

    const loadGrades = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/grades?studentId=${studentId}`);
        if (!response.ok) throw new Error('Failed to load grades');

        const data = await response.json();
        setGrades(data);
      } catch (err) {
        console.error('Error loading grades:', err);
        setError('No se pudo cargar las calificaciones');
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [studentId]);

  if (!studentId) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const courses = Object.values(grades);

  return (
    <div className="flex-1 space-y-8">
      <PageHeader
        title="Mis Calificaciones"
        description="Revisa tu desempeño académico en los cursos"
      />

      {courses.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No tienes calificaciones registradas aún.
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grades).map(([courseId, courseData]) => (
            <Card key={courseId} className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{courseData.course_name}</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {courseData.average.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evaluación</TableHead>
                      <TableHead className="text-center">Calificación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData.grades.map((grade, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{grade.grade_type_name}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-semibold ${
                            grade.score >= 3 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {grade.score.toFixed(2)}/5.00
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
