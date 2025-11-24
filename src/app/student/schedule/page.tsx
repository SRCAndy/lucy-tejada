import { PageHeader } from "@/components/page-header";
import ScheduleForm from "./schedule-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const scheduleData = [
  {
    time: "08:00 - 10:00",
    Lunes: null,
    Martes: { name: "Pintura al Óleo", room: "A-101", color: "blue" },
    Miércoles: null,
    Jueves: { name: "Pintura al Óleo", room: "A-101", color: "blue" },
    Viernes: null,
  },
  {
    time: "10:00 - 12:00",
    Lunes: { name: "Danza Contemporánea", room: "C-203", color: "purple" },
    Miércoles: { name: "Danza Contemporánea", room: "C-203", color: "purple" },
    Martes: null,
    Jueves: null,
    Viernes: null,
  },
  {
    time: "14:00 - 16:00",
    Lunes: null,
    Martes: null,
    Miércoles: { name: "Teatro Experimental", room: "B-105", color: "green" },
    Jueves: { name: "Teatro Experimental", room: "B-105", color: "green" },
    Viernes: null,
  },
];

const deliveries = [
    { subject: "Pintura al Óleo", task: "Entrega de bocetos finales", date: "10 de noviembre de 2024" },
    { subject: "Danza Contemporánea", task: "Video de coreografía individual", date: "12 de noviembre de 2024" },
    { subject: "Teatro Experimental", task: "Ensayo sobre teatro del absurdo", date: "15 de noviembre de 2024" },
    { subject: "Pintura al Óleo", task: "Proyecto final: Serie de paisajes", date: "25 de noviembre de 2024" },
];

const getCourseColor = (color: string) => {
    switch (color) {
        case "blue": return "bg-blue-100 border-blue-200 text-blue-800";
        case "purple": return "bg-purple-100 border-purple-200 text-purple-800";
        case "green": return "bg-green-100 border-green-200 text-green-800";
        default: return "bg-gray-100 border-gray-200 text-gray-800";
    }
}

export default function SchedulePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Mi Horario"
        description="Consulta tu horario semanal y las próximas fechas de entrega."
      >
        <Calendar className="h-8 w-8 text-primary" />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Horario de Clases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="border">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px]">Hora</TableHead>
                  <TableHead>Lunes</TableHead>
                  <TableHead>Martes</TableHead>
                  <TableHead>Miércoles</TableHead>
                  <TableHead>Jueves</TableHead>
                  <TableHead>Viernes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((row) => (
                  <TableRow key={row.time}>
                    <TableCell className="font-medium text-muted-foreground">{row.time}</TableCell>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => {
                        const course = row[day as keyof typeof row] as { name: string; room: string; color: string } | null;
                        return (
                            <TableCell key={day} className="p-1 align-top h-24">
                                {course && (
                                    <div className={`p-2 rounded-lg border h-full ${getCourseColor(course.color)}`}>
                                        <p className="font-semibold text-sm">{course.name}</p>
                                        <p className="text-xs">Salón: {course.room}</p>
                                    </div>
                                )}
                            </TableCell>
                        )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary"/>
                Próximas Entregas
            </CardTitle>
          <CardDescription>Fechas de entrega para tus próximos trabajos y evaluaciones.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Asignatura</TableHead>
                        <TableHead>Trabajo/Evaluación</TableHead>
                        <TableHead className="text-right">Fecha de Entrega</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deliveries.map((delivery, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{delivery.subject}</TableCell>
                            <TableCell>{delivery.task}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant="outline" className="font-normal">{delivery.date}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <ScheduleForm />
    </div>
  );
}