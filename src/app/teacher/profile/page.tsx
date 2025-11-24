'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pen, Mail, Phone, Briefcase, Building, Calendar, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthToken, getSessionFromStorage } from "@/lib/auth";

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  employment_type?: string;
  document_number?: string;
  phone?: string;
  department?: string;
  entry_date?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employment_type: '',
    phone: '',
    department: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = getAuthToken();
        const session = getSessionFromStorage();

        if (!token || !session?.userId) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/teacher/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          setError('Error al cargar el perfil');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          employment_type: data.employment_type || '',
          phone: data.phone || '',
          department: data.department || '',
        });
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token = getAuthToken();

    try {
      const response = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setEditing(false);
        setSuccess('Perfil actualizado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al actualizar el perfil');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };
  return (
        <div className="space-y-8">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Mi Perfil de Profesor</h1>
                <p className="text-muted-foreground">Vea y actualice su información personal y profesional.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setEditing(!editing)}
            >
              <Pen className="h-4 w-4" />
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveChanges}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10"
                      disabled={!editing || saving}
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
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10"
                      disabled={!editing || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="pl-10"
                      disabled={!editing || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="department" 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="pl-10"
                      disabled={!editing || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Número de Documento</Label>
                  <div className="relative">
                    <Input 
                      id="document" 
                      value={profile.document_number || ''}
                      className="pl-10"
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment">Tipo de Empleo</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="employment" 
                      value={formData.employment_type}
                      onChange={(e) => setFormData({...formData, employment_type: e.target.value})}
                      className="pl-10"
                      disabled={!editing || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry-date">Fecha de Ingreso</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="entry-date" 
                      value={profile.entry_date ? profile.entry_date.split('T')[0] : ''}
                      className="pl-10"
                      disabled={true}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="md:col-span-2 flex justify-start gap-2 pt-4">
                    <Button 
                      type="submit" 
                      className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
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
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      );
}