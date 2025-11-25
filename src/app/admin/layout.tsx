"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Presentation,
  CalendarDays,
  User,
  Settings,
} from "lucide-react"

import { CulturalCenterIcon } from "@/components/icons";
import { UserNav } from "@/components/user-nav";

const navItems = [
  { href: "/admin/dashboard", icon: Home, label: "Inicio" },
  { href: "/admin/management", icon: Presentation, label: "Gestión" },
  { href: "/admin/events", icon: CalendarDays, label: "Eventos" },
  { href: "/admin/profile", icon: User, label: "Perfil" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <CulturalCenterIcon className="w-8 h-8 text-yellow-500" />
            <span className="text-xl font-bold font-headline text-white">Lucy Tejada</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-yellow-500 text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-white hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Configuración</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-16 bg-background border-b border-border px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Lucy Tejada</h1>
          <UserNav profileUrl="/admin/profile" settingsUrl="/admin/settings" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
