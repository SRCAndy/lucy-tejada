'use client';

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PageHeader } from "@/components/page-header"
import { Book, User, Star, ClipboardList, Loader2, AlertCircle } from "lucide-react"
import { getAuthToken, getSessionFromStorage } from "@/lib/auth"

interface Course {
  id: string
  name: string
  code: string
  teacher: string
  credits: number
  capacity: number
  enrolled_students: number
  days_of_week?: string
  start_time?: string
  end_time?: string
}

interface Assessment {
  id: string
  title: string
  grade: number
}

interface CourseWithAssessments extends Course {
  assessments: Assessment[]
}

export default function EvaluationsPage() {
  const [courses, setCourses] = useState<CourseWithAssessments[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStudentEvaluations = async () => {
      try {
        const token = getAuthToken()
        const session = getSessionFromStorage()

        if (!session || !token) {
          setError('No estás autenticado')
          setLoading(false)
          return
        }

        const studentId = session.userId

        // Obtener todos los cursos
        const response = await fetch('/api/admin/courses')
        const allCourses = await response.json()

        if (response.ok && Array.isArray(allCourses)) {
          // Filtrar solo los cursos en los que el estudiante está inscrito
          const enrolledCourses = allCourses.filter((course: any) => 
            course.student_ids && course.student_ids.includes(studentId)
          )

          // Agregar evaluaciones ficticias por ahora (puedes agregar un endpoint real después)
          const coursesWithAssessments = enrolledCourses.map((course: Course) => ({
            ...course,
            assessments: [
              { id: '1', title: 'Parcial 1', grade: 4.5 },
              { id: '2', title: 'Parcial 2', grade: 4.0 },
              { id: '3', title: 'Trabajo Final', grade: 4.8 },
              { id: '4', title: 'Asistencia', grade: 5.0 },
            ]
          }))

          setCourses(coursesWithAssessments)
        } else {
          setError('No se pudieron cargar los cursos')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error al cargar las evaluaciones')
      } finally {
        setLoading(false)
      }
    }

    loadStudentEvaluations()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portal de Evaluaciones"
        description="Consulta tus notas y el detalle de cada evaluación por asignatura."
      >
        <ClipboardList className="h-8 w-8 text-primary" />
      </PageHeader>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {courses.length === 0 && !error ? (
        <div className="text-center p-8 rounded-lg border bg-card">
          <p className="text-muted-foreground">
            No estás inscrito en ningún curso aún. Inscríbete para ver tus evaluaciones.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible defaultValue={`item-0`} className="w-full space-y-4">
          {courses.map((course, index) => (
            <AccordionItem value={`item-${index}`} key={course.id} className="border-b-0">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex flex-col text-left items-start gap-2">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                      <Book className="h-5 w-5 text-primary" />
                      <span>{course.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-7">
                      <User className="h-4 w-4" />
                      <span>{course.teacher}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-3 pt-4 border-t">
                    {course.assessments.map(assessment => (
                      <div key={assessment.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <p>{assessment.title}</p>
                        <div className="flex items-center gap-2 text-primary font-semibold">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{assessment.grade} / 5.0</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Promedio general del curso */}
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg font-semibold mt-4 border-t">
                      <p>Promedio del Curso</p>
                      <div className="flex items-center gap-2 text-primary">
                        <Star className="h-4 w-4 fill-current" />
                        <span>
                          {(course.assessments.reduce((sum, a) => sum + a.grade, 0) / course.assessments.length).toFixed(2)} / 5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
