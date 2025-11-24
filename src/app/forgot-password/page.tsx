import Link from "next/link"
import { Mail } from "lucide-react"

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

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <CulturalCenterIcon className="h-6 w-6 text-primary" />
            <span className="font-semibold">Centro cultural lucy tejada</span>
          </div>
          <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico y le enviaremos un enlace para restablecerla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="su.correo@ejemplo.com"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90">
              Enviar Enlace de Recuperación
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Volver a Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
