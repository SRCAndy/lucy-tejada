'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import { Mail, Lock, Shield, BookUser, GraduationCap, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CulturalCenterIcon } from "@/components/icons"
import { Separator } from "@/components/ui/separator"

type Role = 'admin' | 'teacher' | 'student';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !selectedRole) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('student_id', data.user.id);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_role', selectedRole);
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_email', data.user.email);
        
        // Redireccionar según rol
        const redirectMap = {
          admin: '/admin/dashboard',
          teacher: '/teacher/courses',
          student: '/student/courses',
        };
        router.push(redirectMap[selectedRole]);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <CulturalCenterIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold">Centro cultural lucy tejada</span>
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder a su cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="su.correo@ejemplo.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary/80 hover:text-primary"
                >
                  ¿Olvidó su contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mostrar error si existe */}
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
              disabled={loading || !selectedRole}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
           
           <Separator className="my-6" />
           
           <div className="space-y-3">
              <Button 
                variant={selectedRole === 'admin' ? 'default' : 'outline'} 
                className="w-full"
                onClick={() => setSelectedRole('admin')}
                disabled={loading}
              >
                <Shield className="mr-2 h-4 w-4" />
                {selectedRole === 'admin' ? '✓ Admin' : 'Entrar como Admin'}
              </Button>
              <Button 
                variant={selectedRole === 'teacher' ? 'default' : 'outline'} 
                className="w-full"
                onClick={() => setSelectedRole('teacher')}
                disabled={loading}
              >
                <BookUser className="mr-2 h-4 w-4" />
                {selectedRole === 'teacher' ? '✓ Profesor' : 'Entrar como Profesor'}
              </Button>
              <Button 
                variant={selectedRole === 'student' ? 'default' : 'outline'} 
                className="w-full"
                onClick={() => setSelectedRole('student')}
                disabled={loading}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                {selectedRole === 'student' ? '✓ Estudiante' : 'Entrar como Estudiante'}
              </Button>
            </div>
            
          <div className="mt-4 text-center text-sm">
            ¿No tiene una cuenta?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Regístrese aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
