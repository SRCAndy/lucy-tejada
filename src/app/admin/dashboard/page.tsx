import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarChart, Book, GraduationCap, Users } from "lucide-react"
import { PageHeader } from "@/components/page-header"

const stats = [
    { title: "Total de Estudiantes", value: "1,254", icon: <GraduationCap className="h-6 w-6 text-primary" />, change: "+12.5%" },
    { title: "Total de Profesores", value: "87", icon: <Users className="h-6 w-6 text-primary" />, change: "+5.2%" },
    { title: "Cursos Ofrecidos", value: "42", icon: <Book className="h-6 w-6 text-primary" />, change: "+2" },
    { title: "Tasa de Inscripción", value: "89%", icon: <BarChart className="h-6 w-6 text-primary" />, change: "-1.8%" },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de Administración"
        description="Un resumen del rendimiento de tu plataforma."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {stat.title}
                    </CardTitle>
                    {stat.icon}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                        {stat.change} desde el mes pasado
                    </p>
                </CardContent>
            </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Inscripciones Recientes</CardTitle>
            <CardDescription>Una lista de estudiantes que se inscribieron recientemente.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">El gráfico o la lista de inscripciones recientes se mostrará aquí.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividad de la Plataforma</CardTitle>
            <CardDescription>Un resumen de la actividad de los usuarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">El feed de actividad o el gráfico se mostrará aquí.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}