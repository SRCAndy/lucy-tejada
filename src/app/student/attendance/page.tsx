'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  course_id: string;
  course_name: string;
  attendance_date: string;
  present: boolean;
}

interface CourseAttendance {
  course_name: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  attendance_percentage: number;
  records: AttendanceRecord[];
}

export default function AttendancePage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, CourseAttendance>>({});
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

    const loadAttendance = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/attendance?studentId=${studentId}`);
        if (!response.ok) throw new Error('Failed to load attendance');

        const data = await response.json();
        setAttendance(data);
      } catch (err) {
        console.error('Error loading attendance:', err);
        setError('No se pudo cargar el registro de asistencias');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [studentId]);

  if (!studentId) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando asistencias...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const courses = Object.values(attendance);

  return (
    <div className="flex-1 space-y-8">
      <PageHeader
        title="Mi Asistencia"
        description="Revisa tu registro de asistencia en los cursos"
      />

      {courses.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No tienes registros de asistencia aún.
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(attendance).map(([courseId, courseData]) => (
            <Card key={courseId} className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{courseData.course_name}</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {courseData.attendance_percentage}%
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-semibold text-lg">
                      {courseData.present_count}
                    </div>
                    <div className="text-gray-600">Presentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-semibold text-lg">
                      {courseData.absent_count}
                    </div>
                    <div className="text-gray-600">Ausentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 font-semibold text-lg">
                      {courseData.total_classes}
                    </div>
                    <div className="text-gray-600">Total Clases</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseData.records.map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {new Date(record.attendance_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {record.present ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Presente
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="w-4 h-4" />
                              Ausente
                            </div>
                          )}
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
