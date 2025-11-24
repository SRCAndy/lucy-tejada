"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  Calendar,
  PenSquare,
  PanelLeft,
  Settings,
  Home,
  Presentation,
  ClipboardList,
  CalendarDays,
  User,
  BookCopy,
  ClipboardCheck,
  CalendarClock
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar"
import { CulturalCenterIcon } from "@/components/icons";
import { UserNav } from "@/components/user-nav";

const navItems = [
  { href: "/student/home", icon: Home, label: "Inicio" },
  { href: "/student/enroll", icon: ClipboardList, label: "Inscripción de Cursos" },
  { href: "/student/profile", icon: User, label: "Mi Perfil" },
  { href: "/student/courses", icon: BookCopy, label: "Mis Cursos" },
  { href: "/student/evaluations", icon: ClipboardCheck, label: "Evaluaciones" },
  { href: "/student/schedule", icon: CalendarClock, label: "Mi Horario" },
];

const bottomNavItems = [
    { href: "/student/settings", icon: Settings, label: "Configuración" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 justify-center">
            <CulturalCenterIcon className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold font-headline">Lucy Tejada</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith(item.href)}
                        >
                            <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                {bottomNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                        >
                            <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex-1" />
          <UserNav profileUrl="/student/profile" settingsUrl="/student/settings" />
        </header>
        <main className="p-4 sm:px-6 sm:py-0 space-y-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
