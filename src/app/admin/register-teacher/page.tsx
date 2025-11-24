
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CulturalCenterIcon } from "@/components/icons";
import { 
    Hash, 
    User, 
    CalendarIcon, 
    Users, 
    Home, 
    MapPin, 
    Phone, 
    Mail,
    Building,
    Briefcase,
    Library
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";

export default function RegisterTeacherPage() {
    const [birthDate, setBirthDate] = useState<Date>()
    const [entryDate, setEntryDate] = useState<Date>()

    return (
        <div className="flex justify-center items-center py-12 px-4">
            <Card className="w-full max-w-4xl">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CulturalCenterIcon className="h-8 w-8 text-primary" />
                            <span className="text-xl font-semibold">Centro cultural lucy tejada</span>
                        </div>
                        <h1 className="text-2xl font-bold">Registro de Docente</h1>
                        <p className="text-muted-foreground">Complete los datos del docente para registrarlo en el sistema.</p>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="doc-number">Número de documento</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="doc-number" placeholder="123456789" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="first-name">Nombres</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="first-name" placeholder="John" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Apellidos</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="last-name" placeholder="Doe" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birth-date">Fecha de nacimiento</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal pl-10",
                                        !birthDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    {birthDate ? format(birthDate, "PPP") : <span>Seleccione una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={birthDate}
                                    onSelect={setBirthDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Género</Label>
                             <Select>
                                <SelectTrigger className="pl-10">
                                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <SelectValue placeholder="Seleccione un género" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Femenino</SelectItem>
                                    <SelectItem value="male">Masculino</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección de residencia</Label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="address" placeholder="Calle 123 #45-67" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="city" defaultValue="Pereira" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Departamento o provincia</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="department" defaultValue="Risaralda" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono celular</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="phone" placeholder="3001234567" className="pl-10" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="institutional-email">Correo institucional</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="institutional-email" type="email" placeholder="docente@institucion.edu.co" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="personal-email">Correo personal</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="personal-email" type="email" placeholder="personal@ejemplo.com" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employment-type">Tipo de vinculación</Label>
                             <Select>
                                <SelectTrigger className="pl-10">
                                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <SelectValue placeholder="Seleccione un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Tiempo Completo</SelectItem>
                                    <SelectItem value="part-time">Medio Tiempo</SelectItem>
                                    <SelectItem value="hourly">Cátedra</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position">Cargo o puesto actual</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="position" placeholder="Docente de Artes" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="entry-date">Fecha de ingreso</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal pl-10",
                                        !entryDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    {entryDate ? format(entryDate, "PPP") : <span>Seleccione una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={entryDate}
                                    onSelect={setEntryDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="faculty">Facultad o dependencia</Label>
                            <div className="relative">
                                <Library className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="faculty" placeholder="Facultad de Bellas Artes" className="pl-10" />
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-4 pt-8">
                            <Button type="button" variant="outline" className="w-full md:w-auto">Cancelar</Button>
                            <Button type="submit" className="w-full md:w-auto">Registrar Docente</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
