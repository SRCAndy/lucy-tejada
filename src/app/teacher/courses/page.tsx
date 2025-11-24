
"use client"

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Users, Clock, Check, FilePenLine, PlusCircle, Calendar as CalendarIcon, Loader2, AlertCircle } from "lucide-react"
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
  const [percentage, setPercentage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (name && percentage) {
      onAddGrade(`${name} (${percentage}%)`);
      setName('');
      setPercentage('');
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
            Ingrese el nombre y el porcentaje de la nueva evaluación.
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
              placeholder="Ej: Taller 3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade-percentage" className="text-right">
              Porcentaje
            </Label>
            <Input
              id="grade-percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="col-span-3"
              placeholder="Ej: 10"
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
  const [assignments, setAssignments] = useState(["Parcial 1 (25%)", "Taller 2 (15%)", "Examen Final (30%)", "Nota Final"]);
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());

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

        // Obtener estudiantes para cada curso
        const coursesWithStudents = await Promise.all(
          coursesData.map(async (course: Course) => {
            try {
              const studentsResponse = await fetch(`/api/teacher/courses/${course.id}`);
              if (studentsResponse.ok) {
                const courseData = await studentsResponse.json();
                return {
                  ...course,
                  students: courseData.students || []
                };
              }
              return {
                ...course,
                students: []
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
                                      {attendanceDates.map(date => <TableHead key={date} className="text-center">{date}</TableHead>)}
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
                                        course.students.map(student => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                {attendanceDates.map(date => (
                                                    <TableCell key={`${student.id}-${date}`} className="text-center">
                                                        <Checkbox defaultChecked={Math.random() > 0.15}/>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
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
                              <Button>Guardar Asistencias</Button>
                          </div>
                      </TabsContent>
                      
                      <TabsContent value="calificaciones" className="p-6">
                          <Card>
                               <CardContent className="p-0">
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                          <TableHead className="font-bold w-[250px]">Estudiante</TableHead>
                                          {assignments.map(assignment => <TableHead key={assignment} className="text-center">{assignment}</TableHead>)}
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          {course.students.length === 0 ? (
                                            <TableRow>
                                              <TableCell colSpan={assignments.length + 1} className="text-center py-4 text-muted-foreground">
                                                No hay estudiantes inscritos en este curso
                                              </TableCell>
                                            </TableRow>
                                          ) : (
                                            course.students.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">{student.name}</TableCell>
                                                    {assignments.map(assignment => (
                                                        <TableCell key={`${student.id}-${assignment}`} className="text-center px-1">
                                                            <Input 
                                                                type="number"
                                                                min="0"
                                                                max="5"
                                                                step="0.1"
                                                                defaultValue={assignment === 'Nota Final' ? '' : (Math.random() * (5 - 2.5) + 2.5).toFixed(1)}
                                                                className="text-center mx-auto max-w-20"
                                                                readOnly={assignment === 'Nota Final'}
                                                                />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                          )}
                                      </TableBody>
                                  </Table>
                              </CardContent>
                          </Card>
                          <div className="flex justify-end mt-4 gap-2">
                               <AddGradeDialog onAddGrade={(gradeName: string) => {
                                 const finalNote = assignments.pop();
                                 setAssignments(prev => [...prev, gradeName, finalNote!]);
                               }} />
                              <Button>Guardar Calificaciones</Button>
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
