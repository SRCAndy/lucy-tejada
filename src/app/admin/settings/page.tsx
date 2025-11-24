
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { Bell, Palette, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SettingsPage() {
    const [theme, setTheme] = useState("system");

    return (
        <div className="space-y-8">
            <PageHeader
                title="Configuración"
                description="Gestiona las preferencias de tu cuenta y la configuración de la aplicación."
            />
            <Card>
                <CardHeader className="flex flex-row items-start gap-4">
                    <Bell className="w-6 h-6 text-primary mt-1"/>
                    <div>
                        <CardTitle>Notificaciones</CardTitle>
                        <CardDescription>
                            Elige cómo quieres recibir las notificaciones.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <Label htmlFor="email-notifications" className="font-normal">Notificaciones por Correo Electrónico</Label>
                        <Switch id="email-notifications" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <Label htmlFor="push-notifications" className="font-normal">Notificaciones Push</Label>
                        <Switch id="push-notifications" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-start gap-4">
                    <Palette className="w-6 h-6 text-primary mt-1"/>
                    <div>
                        <CardTitle>Apariencia</CardTitle>
                        <CardDescription>
                            Personaliza la apariencia de la aplicación.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            onClick={() => setTheme('light')}
                        >
                            Claro
                        </Button>
                        <Button
                             variant={theme === 'dark' ? 'default' : 'outline'}
                             onClick={() => setTheme('dark')}
                        >
                            Oscuro
                        </Button>
                        <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            onClick={() => setTheme('system')}
                        >
                            Sistema
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-start gap-4">
                    <Lock className="w-6 h-6 text-primary mt-1"/>
                    <div>
                        <CardTitle>Seguridad</CardTitle>
                        <CardDescription>
                            Cambia tu contraseña.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4 max-w-lg">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Contraseña Actual</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <Button type="submit">Cambiar Contraseña</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
