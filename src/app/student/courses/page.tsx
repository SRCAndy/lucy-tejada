"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { Users, Clock, BookUser, AlertTriangle, Star, Loader2, Bell, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
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

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author?: string
  image_url?: string
  category?: string
  created_at: string
  updated_at: string
}

interface AttendanceRecord {
  date: string
  attended: boolean
}

interface AttendanceData {
  studentId: string
  courseId: string
  totalClasses: number
  attended: number
  absent: number
  percentage: number
  lastClasses: AttendanceRecord[]
}

const CourseDetailsModal = ({ course, token }: { course: Course; token: string }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [attendance, setAttendance] = useState<AttendanceData | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(true)

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        // Cargar avisos
        const announcementsResponse = await fetch(`/api/courses/${course.id}/announcements`)
        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json()
          setAnnouncements(announcementsData)
        }

        // Cargar asistencia
        const attendanceResponse = await fetch(`/api/courses/${course.id}/attendance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          setAttendance(attendanceData)
        }
      } catch (err) {
        console.error('Error loading course details:', err)
      } finally {
        setLoadingDetails(false)
      }
    }

    loadCourseDetails()
  }, [course.id, token])

  return (
    <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BookUser className="h-5 w-5 text-primary" />
          {course.name}
        </DialogTitle>
        <DialogDescription>
          {course.code} | Profesor: {course.teacher}
        </DialogDescription>
      </DialogHeader>

      {loadingDetails ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="announcements">
              <Bell className="w-4 h-4 mr-2" />
              Avisos ({announcements.length})
            </TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg border bg-card/80">
              <h4 className="font-semibold mb-3">Información General</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Código:</span> {course.code}</p>
                <p><span className="font-medium">Profesor:</span> {course.teacher}</p>
                <p><span className="font-medium">Créditos:</span> {course.credits}</p>
                <p><span className="font-medium">Estudiantes:</span> {course.enrolled_students}/{course.capacity}</p>
                {course.days_of_week && (
                  <p><span className="font-medium">Horario:</span> {course.days_of_week} {course.start_time} - {course.end_time}</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4 mt-4">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No hay avisos en este momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-lg border bg-card hover:bg-card/80 transition">
                    {announcement.image_url && (
                      <div className="mb-3 rounded overflow-hidden h-40">
                        <img 
                          src={announcement.image_url} 
                          alt={announcement.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Bell className="w-4 h-4 text-primary" />
                          {announcement.title}
                        </h4>
                        {announcement.category && (
                          <Badge variant="outline" className="mt-2 mb-2">
                            {announcement.category}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                          {announcement.author && (
                            <span>Por: {announcement.author}</span>
                          )}
                          <span>
                            {new Date(announcement.date || announcement.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4 mt-4">
            {attendance ? (
              <>
                <div className="p-4 rounded-lg border bg-card/80">
                  <h4 className="font-semibold mb-4">Resumen de Asistencia</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{attendance.attended}</div>
                      <div className="text-xs text-muted-foreground">Clases Asistidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{attendance.absent}</div>
                      <div className="text-xs text-muted-foreground">Ausencias</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${attendance.percentage >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {attendance.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Asistencia</div>
                    </div>
                  </div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${attendance.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-card/80">
                  <h4 className="font-semibold mb-3">Últimas Clases</h4>
                  <div className="space-y-2">
                    {attendance.lastClasses.map((record) => (
                      <div key={record.date} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <span className="text-sm">
                          {new Date(record.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {record.attended ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Presente
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <X className="w-3 h-3 mr-1" />
                            Ausente
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay datos de asistencia disponibles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DialogContent>
  )
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    const loadStudentCourses = async () => {
      try {
        const authToken = getAuthToken()
        const session = getSessionFromStorage()

        if (!session || !authToken) {
          setError('No estás autenticado')
          setLoading(false)
          return
        }

        setToken(authToken)
        const studentId = session.userId
        console.log('📚 Estudiante ID:', studentId)

        // Obtener todos los cursos
        const response = await fetch('/api/admin/courses')
        const allCourses = await response.json()

        console.log('📚 Todos los cursos:', allCourses)

        if (response.ok && Array.isArray(allCourses)) {
          // Filtrar solo los cursos en los que el estudiante está inscrito
          const enrolledCourses = allCourses.filter((course: any) => {
            const isEnrolled = course.student_ids && course.student_ids.includes(studentId)
            console.log(`📚 Curso ${course.name} - student_ids:`, course.student_ids, `- inscrito: ${isEnrolled}`)
            return isEnrolled
          })
          
          console.log('📚 Cursos matriculados:', enrolledCourses)
          setCourses(enrolledCourses)
        } else {
          setError('No se pudieron cargar los cursos')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error al cargar los cursos')
      } finally {
        setLoading(false)
      }
    }

    loadStudentCourses()
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
        title="Mis Cursos"
        description="Aquí puedes ver los cursos en los que estás matriculado."
      />
      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No estás inscrito en ningún curso. 
                <Link href="/student/enroll" className="text-primary hover:underline ml-1">
                  Inscríbete aquí
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => (
            <Dialog key={course.id}>
              <Card className="flex flex-col md:flex-row md:items-center p-4">
                <div className="flex-grow">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {course.name}
                  </CardTitle>
                  <CardDescription className="mt-1 ml-4">
                    {course.code} | Profesor: {course.teacher}
                  </CardDescription>
                  <div className="mt-4 ml-4 flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolled_students}/{course.capacity} estudiantes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookUser className="w-4 h-4" />
                      <span>{course.credits} créditos</span>
                    </div>
                    {course.days_of_week && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{course.days_of_week}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                  <DialogTrigger asChild>
                    <Button variant="outline">Ver Detalles</Button>
                  </DialogTrigger>
                </div>
              </Card>
              <CourseDetailsModal course={course} token={token} />
            </Dialog>
          ))
        )}
      </div>
    </div>
  )
}
