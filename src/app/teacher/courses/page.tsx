
"use client"

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Users, Clock, Check, FilePenLine, PlusCircle, Calendar as CalendarIcon, Loader2, AlertCircle, X } from "lucide-react"
import { getAuthToken, getSessionFromStorage } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Label } from "@/components/ui/label";

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
  student_ids?: string[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  id_number: string;
}

interface CourseWithStudents extends Course {
  students: Student[];
}

function AddGradeDialog({ onAddGrade }: { onAddGrade: (name: string) => void }) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (name) {
      onAddGrade(name);
      setName('');
      setIsOpen(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Calificación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Calificación</DialogTitle>
          <DialogDescription>
            Ingrese el nombre de la nueva evaluación.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="grade-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Taller 3, Parcial 1, etc"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Añadir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<CourseWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceDates, setAttendanceDates] = useState(["28-Oct", "30-Oct", "04-Nov", "06-Nov", "11-Nov"]);
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [teacherId, setTeacherId] = useState('');
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [gradesData, setGradesData] = useState<Record<string, Record<string, Record<string, number>>>>({});
  const [gradeTypes, setGradeTypes] = useState<Record<string, Record<string, string>>>({});
  const [savingGrades, setSavingGrades] = useState(false);

  useEffect(() => {
    const loadTeacherCourses = async () => {
      try {
        const token = getAuthToken();
        const session = getSessionFromStorage();

        if (!session?.userId) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        setTeacherId(session.userId);

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

        // Obtener estudiantes para cada curso y cargar asistencias
        const coursesWithStudents = await Promise.all(
          coursesData.map(async (course: Course) => {
            try {
              const studentsResponse = await fetch(`/api/teacher/courses/${course.id}`);
              let students: Student[] = [];
              if (studentsResponse.ok) {
                const courseData = await studentsResponse.json();
                students = courseData.students || [];
              }

              // Cargar calificaciones del curso
              try {
                const gradesResponse = await fetch(`/api/courses/${course.id}/grades?courseId=${course.id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });

                if (gradesResponse.ok) {
                  const gradesInfo = await gradesResponse.json();
                  setGradeTypes(prev => ({
                    ...prev,
                    [course.id]: gradesInfo.gradeTypes.reduce((acc: any, gt: any) => {
                      acc[gt.name] = gt.id;
                      return acc;
                    }, {})
                  }));
                  
                  setGradesData(prev => ({
                    ...prev,
                    [course.id]: gradesInfo.grades
                  }));
                }
              } catch (err) {
                console.error('Error cargando calificaciones:', err);
              }

              return {
                ...course,
                students
              };
            } catch (err) {
              console.error('Error fetching students:', err);
              return {
                ...course,
                students: []
              };
            }
          })
        );

        setCourses(coursesWithStudents);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los cursos');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherCourses();
  }, []);

  const handleAttendanceChange = (courseId: string, studentId: string, date: string, present: boolean) => {
    setAttendanceData(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [studentId]: {
          ...prev[courseId]?.[studentId],
          [date]: present
        }
      }
    }));
  };

  const saveAttendance = async (courseId: string) => {
    if (!teacherId) return;

    setSavingAttendance(true);
    try {
      const courseAttendance = attendanceData[courseId] || {};
      const response = await fetch(`/api/courses/${courseId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendance: courseAttendance,
          teacherId
        })
      });

      if (response.ok) {
        console.log('✅ Asistencias guardadas correctamente');
      } else {
        const error = await response.json();
        console.error(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      console.error('Error guardando asistencias:', err);
    } finally {
      setSavingAttendance(false);
    }
  };

  const deleteAttendanceDate = async (courseId: string, date: string) => {
    if (!teacherId) return;

    try {
      const response = await fetch(`/api/courses/${courseId}/attendance`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          teacherId
        })
      });

      if (response.ok) {
        console.log(`✅ Fecha ${date} eliminada`);
        // Remover la fecha del estado
        setAttendanceDates(prev => prev.filter(d => d !== date));
        // Limpiar datos de asistencia para esa fecha
        setAttendanceData(prev => ({
          ...prev,
          [courseId]: Object.keys(prev[courseId] || {}).reduce((acc, studentId) => {
            const dateStr = date.split('-').reverse().join('-'); // Convertir formato
            const { [dateStr]: _, ...rest } = prev[courseId][studentId];
            acc[studentId] = rest;
            return acc;
          }, {} as Record<string, Record<string, boolean>>)
        }));
      } else {
        const error = await response.json();
        console.error(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      console.error('Error eliminando fecha:', err);
    }
  };

  const handleGradeChange = (courseId: string, studentId: string, gradeTypeId: string, score: number) => {
    setGradesData(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [studentId]: {
          ...prev[courseId]?.[studentId],
          [gradeTypeId]: score
        }
      }
    }));
  };

  const saveGrades = async (courseId: string) => {
    if (!teacherId) return;

    setSavingGrades(true);
    try {
      const courseGrades = gradesData[courseId] || {};
      const courseGradeTypesMap = gradeTypes[courseId] || {};
      
      // Convertir {id: name} a {name: id} para la API
      const gradeTypesForApi: Record<string, string> = {};
      Object.entries(courseGradeTypesMap).forEach(([id, name]) => {
        gradeTypesForApi[name as string] = id;
      });
      
      const response = await fetch(`/api/courses/${courseId}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grades: courseGrades,
          gradeTypes: gradeTypesForApi,
          teacherId
        })
      });

      if (response.ok) {
        console.log('✅ Calificaciones guardadas correctamente');
      } else {
        const error = await response.json();
        console.error(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      console.error('Error guardando calificaciones:', err);
    } finally {
      setSavingGrades(false);
    }
  };

  const deleteGradeType = async (courseId: string, gradeTypeId: string, gradeName: string) => {
    if (!teacherId) return;

    try {
      const response = await fetch(`/api/courses/${courseId}/grades`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeTypeId,
          teacherId
        })
      });

      if (response.ok) {
        console.log(`✅ ${gradeName} eliminada`);
        // Remover del estado
        setGradeTypes(prev => ({
          ...prev,
          [courseId]: Object.fromEntries(
            Object.entries(prev[courseId] || {}).filter(([id]) => id !== gradeTypeId)
          )
        }));
        // Remover calificaciones de este tipo
        setGradesData(prev => ({
          ...prev,
          [courseId]: Object.fromEntries(
            Object.entries(prev[courseId] || {}).map(([studentId, grades]) => [
              studentId,
              Object.fromEntries(
                Object.entries(grades || {}).filter(([id]) => id !== gradeTypeId)
              )
            ])
          )
        }));
      } else {
        const error = await response.json();
        console.error(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      console.error('Error eliminando calificación:', err);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mis Cursos"
        description="Gestiona las asistencias y calificaciones de tus estudiantes."
      />

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center p-8 rounded-lg border bg-card">
          <p className="text-muted-foreground">
            No tienes cursos asignados en este momento.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {courses.map((course) => (
                <AccordionItem value={course.id} key={course.id}>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-lg">{course.name} ({course.code})</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5"><Users size={14}/> {course.students.length} Estudiantes</span>
                        {course.days_of_week && (
                          <span className="flex items-center gap-1.5"><Clock size={14}/> {course.days_of_week} a las {course.start_time}</span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted/50 border-t">
                    <Tabs defaultValue="asistencias" className="pt-2">
                      <TabsList className="grid w-full grid-cols-2 bg-muted/80 h-12">
                        <TabsTrigger value="asistencias" className="text-base h-10">
                          <Check className="mr-2 h-5 w-5"/> Asistencias
                        </TabsTrigger>
                        <TabsTrigger value="calificaciones" className="text-base h-10">
                          <FilePenLine className="mr-2 h-5 w-5"/> Calificaciones
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="asistencias" className="p-6">
                          <Card>
                              <CardContent className="p-0">
                                  <Table>
                                  <TableHeader>
                                      <TableRow>
                                      <TableHead className="font-bold w-[250px]">Estudiante</TableHead>
                                      {attendanceDates.map(date => (
                                        <TableHead key={date} className="text-center">
                                          <div className="flex items-center justify-center gap-2">
                                            <span>{date}</span>
                                            <button
                                              onClick={() => deleteAttendanceDate(course.id, date)}
                                              className="hover:text-red-600 transition-colors"
                                              title="Eliminar fecha"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </TableHead>
                                      ))}
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {course.students.length === 0 ? (
                                        <TableRow>
                                          <TableCell colSpan={attendanceDates.length + 1} className="text-center py-4 text-muted-foreground">
                                            No hay estudiantes inscritos en este curso
                                          </TableCell>
                                        </TableRow>
                                      ) : (
                                        course.students.map(student => {
                                          const studentAttendance = attendanceData[course.id]?.[student.id] || {};
                                          return (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                {attendanceDates.map(date => {
                                                  // Convertir fecha a YYYY-MM-DD
                                                  const [day, month] = date.split('-');
                                                  const currentYear = new Date().getFullYear();
                                                  const monthIndex = new Date(`${month} 1, 2020`).getMonth();
                                                  const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                  const isPresent = studentAttendance[dateStr];
                                                  
                                                  return (
                                                    <TableCell key={`${student.id}-${date}`} className="text-center">
                                                        <Checkbox 
                                                          checked={isPresent || false}
                                                          onCheckedChange={(checked) => 
                                                            handleAttendanceChange(course.id, student.id, dateStr, checked as boolean)
                                                          }
                                                        />
                                                    </TableCell>
                                                  );
                                                })}
                                            </TableRow>
                                          );
                                        })
                                      )}
                                  </TableBody>
                                  </Table>
                              </CardContent>
                          </Card>
                          <div className="flex justify-end mt-4 gap-2">
                              <Popover>
                                  <PopoverTrigger asChild>
                                      <Button variant="outline">
                                          <PlusCircle className="mr-2 h-4 w-4" />
                                          Añadir Fecha
                                      </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                      <Calendar
                                          mode="single"
                                          selected={newDate}
                                          onSelect={setNewDate}
                                          initialFocus
                                      />
                                      <div className="p-2 border-t">
                                          <Button size="sm" className="w-full" onClick={() => {
                                            if (newDate) {
                                              const formattedDate = format(newDate, "dd-LLL");
                                              if (!attendanceDates.includes(formattedDate)) {
                                                setAttendanceDates(prev => [...prev, formattedDate].sort());
                                              }
                                            }
                                          }}>
                                              <PlusCircle className="mr-2 h-4 w-4" />
                                              Confirmar Fecha
                                          </Button>
                                      </div>
                                  </PopoverContent>
                              </Popover>
                              <Button 
                                onClick={() => saveAttendance(course.id)}
                                disabled={savingAttendance}
                              >
                                {savingAttendance ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>Guardar Asistencias</>
                                )}
                              </Button>
                          </div>
                      </TabsContent>
                      
                      <TabsContent value="calificaciones" className="p-6">
                          <Card>
                               <CardContent className="p-0">
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                          <TableHead className="font-bold w-[250px]">Estudiante</TableHead>
                                          {Object.keys(gradeTypes[course.id] || {}).map(gradeName => (
                                            <TableHead key={gradeName} className="text-center">
                                              <div className="flex items-center justify-center gap-2">
                                                <span>{gradeName}</span>
                                              </div>
                                            </TableHead>
                                          ))}
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          {course.students.length === 0 ? (
                                            <TableRow>
                                              <TableCell colSpan={(Object.keys(gradeTypes[course.id] || {}).length) + 1} className="text-center py-4 text-muted-foreground">
                                                No hay estudiantes inscritos en este curso
                                              </TableCell>
                                            </TableRow>
                                          ) : (
                                            course.students.map(student => {
                                              const studentGrades = gradesData[course.id]?.[student.id] || {};
                                              return (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">{student.name}</TableCell>
                                                    {Object.entries(gradeTypes[course.id] || {}).map(([gradeTypeId, gradeName]) => (
                                                        <TableCell key={`${student.id}-${gradeTypeId}`} className="text-center px-1">
                                                            <Input 
                                                                type="number"
                                                                min="0"
                                                                max="5"
                                                                step="0.1"
                                                                value={studentGrades[gradeTypeId] || ''}
                                                                onChange={(e) => handleGradeChange(course.id, student.id, gradeTypeId, parseFloat(e.target.value) || 0)}
                                                                className="text-center mx-auto max-w-20"
                                                                placeholder="0.0"
                                                                />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                              );
                                            })
                                          )}
                                      </TableBody>
                                  </Table>
                              </CardContent>
                          </Card>
                          <div className="flex justify-end mt-4 gap-2">
                               <AddGradeDialog onAddGrade={(gradeName: string) => {
                                 // Crear nuevo tipo de calificación
                                 const typeId = uuidv4();
                                 setGradeTypes(prev => ({
                                   ...prev,
                                   [course.id]: {
                                     ...prev[course.id],
                                     [typeId]: gradeName
                                   }
                                 }));
                               }} />
                              <Button 
                                onClick={() => saveGrades(course.id)}
                                disabled={savingGrades}
                              >
                                {savingGrades ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>Guardar Calificaciones</>
                                )}
                              </Button>
                          </div>
                      </TabsContent>

                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
