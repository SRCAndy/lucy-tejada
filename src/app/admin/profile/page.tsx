import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pen, Mail, Home, MapPin, Hash, User as UserIcon, Book, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfilePage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src="https://picsum.photos/seed/admin-avatar/100/100" alt="Admin" data-ai-hint="person avatar" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">Mi Perfil de Administrador</h1>
                        <p className="text-muted-foreground">Vea y actualice su información personal.</p>
                    </div>
                </div>
                <Button variant="outline" size="icon">
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
                                <Input id="name" defaultValue="Usuario Administrador" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="email" type="email" defaultValue="admin@example.com" className="pl-10" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="id-number">ID</Label>
                             <div className="relative">
                                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="id-number" defaultValue="0000000001" className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Departamento</Label>
                             <div className="relative">
                                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="department" defaultValue="Administración" className="pl-10" />
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-start gap-2 pt-4">
                            <Button type="submit" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">Guardar Cambios</Button>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}