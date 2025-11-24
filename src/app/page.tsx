import Link from 'next/link';
import { Shield, BookUser, GraduationCap } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CulturalCenterIcon } from '@/components/icons';

const roles = [
  {
    name: 'Admin',
    href: '/admin/dashboard',
    icon: <Shield className="h-12 w-12" />,
    description: 'Gestiona usuarios, cursos y configuración de la plataforma.',
  },
  {
    name: 'Profesor',
    href: '/teacher/courses',
    icon: <BookUser className="h-12 w-12" />,
    description: 'Ver cursos asignados y gestionar a tus estudiantes.',
  },
  {
    name: 'Estudiante',
    href: '/student/courses',
    icon: <GraduationCap className="h-12 w-12" />,
    description: 'Inscríbete en cursos y sigue tu progreso de aprendizaje.',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <CulturalCenterIcon className="h-20 w-20 mb-4 text-primary" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground font-headline">
          Bienvenido a Lucy Tejada
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
          Tu solución todo en uno para gestionar cursos, empoderar a educadores e inspirar a estudiantes.
        </p>
        <p className="mt-2 text-md text-muted-foreground">
          Selecciona tu rol para continuar.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 w-full max-w-4xl">
        {roles.map((role) => (
          <Link href={role.href} key={role.name} className="group">
            <Card className="h-full transform transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
                  {role.icon}
                </div>
                <CardTitle className="text-2xl font-headline">{role.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  {role.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
       <footer className="mt-16 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Lucy Tejada. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
