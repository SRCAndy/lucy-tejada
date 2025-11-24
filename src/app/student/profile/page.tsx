'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pen, Mail, Home, MapPin, Hash, User as UserIcon, Users, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthToken, getSessionFromStorage } from "@/lib/auth";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  id_number: string;
  gender: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>({
    id: '',
    name: '',
    email: '',
    address: '',
    city: '',
    id_number: '',
    gender: 'male',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Cargar perfil del estudiante
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = getAuthToken();
        const session = getSessionFromStorage();

        if (!session || !token) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/student/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();

        if (response.ok) {
          setProfile(data);
        } else {
          setError(data.error || 'No se pudo cargar el perfil');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Perfil actualizado correctamente');
        setProfile(data.student);
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="https://picsum.photos/seed/student-avatar/100/100" alt={profile.name} />
            <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Mi Perfil de Estudiante</h1>
            <p className="text-muted-foreground">Vea y actualice su información personal.</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pen className="h-4 w-4" />
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="name" 
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="address" 
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad de Origen</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="city" 
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id-number">ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="id-number" 
                  value={profile.id_number}
                  onChange={(e) => handleInputChange('id_number', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select value={profile.gender} onValueChange={(value) => handleInputChange('gender', value)} disabled={!isEditing}>
                <SelectTrigger className="pl-10">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="md:col-span-2 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="md:col-span-2 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="md:col-span-2 flex justify-start gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button 
                    type="button"
                    className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button 
                  type="button"
                  className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                  onClick={() => setIsEditing(true)}
                >
                  <Pen className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}