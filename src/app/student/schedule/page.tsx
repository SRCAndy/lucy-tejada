'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/auth';
import StudentSchedule from '@/components/student-schedule';
import { Card, CardContent } from '@/components/ui/card';

export default function SchedulePage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getSessionFromStorage();
    console.log('[SCHEDULE-PAGE] Session:', session);
    
    if (session?.userId) {
      console.log('[SCHEDULE-PAGE] Student ID:', session.userId);
      setStudentId(session.userId);
    } else {
      setError('No se pudo obtener la sesión del estudiante');
      console.error('[SCHEDULE-PAGE] No se encontró sesión válida');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 m-4">
        <CardContent className="pt-6">
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!studentId) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 m-4">
        <CardContent className="pt-6">
          <p className="text-yellow-700">Por favor, inicia sesión primero</p>
        </CardContent>
      </Card>
    );
  }

  return <StudentSchedule studentId={studentId} />;
}