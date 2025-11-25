
'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/auth';
import TeacherSchedule from '@/components/teacher-schedule';

export default function SchedulePage() {
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSessionFromStorage();
    if (session?.userId) {
      setTeacherId(session.userId);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return <TeacherSchedule teacherId={teacherId} />;
}

