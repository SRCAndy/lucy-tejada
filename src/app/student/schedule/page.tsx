'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/auth';
import StudentSchedule from '@/components/student-schedule';

export default function SchedulePage() {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSessionFromStorage();
    if (session?.userId) {
      setStudentId(session.userId);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return <StudentSchedule studentId={studentId} />;
}