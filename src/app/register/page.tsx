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

export default function RegisterPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!id || !name || !email || !password || !confirmPassword || !selectedRole) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, email, password, role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Registro exitoso. Redirigiendo al login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Error al registrarse');
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
          <CardTitle className="text-2xl font-bold">Crear una cuenta</CardTitle>
          <CardDescription>
            Complete el formulario para registrarse en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="id">Número de Identificación</Label>
              <Input
                id="id"
                type="text"
                placeholder="Tu número de cédula o ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
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
              <Label htmlFor="password">Contraseña</Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="confirm-password" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mostrar error */}
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Mostrar éxito */}
            {success && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                {success}
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
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center font-semibold mb-2">Selecciona tu rol:</p>
            <Button 
              variant={selectedRole === 'admin' ? 'default' : 'outline'} 
              className="w-full"
              onClick={() => setSelectedRole('admin')}
              disabled={loading}
            >
              <Shield className="mr-2 h-4 w-4" />
              {selectedRole === 'admin' ? '✓ Admin' : 'Registrarse como Admin'}
            </Button>
            <Button 
              variant={selectedRole === 'teacher' ? 'default' : 'outline'} 
              className="w-full"
              onClick={() => setSelectedRole('teacher')}
              disabled={loading}
            >
              <BookUser className="mr-2 h-4 w-4" />
              {selectedRole === 'teacher' ? '✓ Profesor' : 'Registrarse como Profesor'}
            </Button>
            <Button 
              variant={selectedRole === 'student' ? 'default' : 'outline'} 
              className="w-full"
              onClick={() => setSelectedRole('student')}
              disabled={loading}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              {selectedRole === 'student' ? '✓ Estudiante' : 'Registrarse como Estudiante'}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            ¿Ya tiene una cuenta?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
