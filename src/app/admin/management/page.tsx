import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Users, BookUser, LayoutGrid, Book } from "lucide-react";

export default function ManagementPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestión Administrativa"
        description="Herramientas y reportes para la administración de la institución."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Gestión de Estudiantes</CardTitle>
                <CardDescription>Registrar y consultar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end gap-2">
            <Button asChild className="w-full">
              <Link href="/admin/register-student">Registrar Estudiante</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/students">Consultar Estudiantes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                 <BookUser className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Gestión de Docentes</CardTitle>
                <CardDescription>Registrar y consultar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end gap-2">
            <Button asChild className="w-full">
              <Link href="/admin/register-teacher">Registrar Docente</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/teachers">Consultar Docentes</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Dashboard General</CardTitle>
                <CardDescription>Visualización de datos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/dashboard">Ver Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Gestión de Cursos</CardTitle>
                <CardDescription>Crear y administrar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end gap-2">
            <Button asChild className="w-full">
              <Link href="/admin/courses">Crear Curso</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/courses">Ver Cursos</Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}