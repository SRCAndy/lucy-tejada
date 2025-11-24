
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { teachers } from "@/lib/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookUser, Hash, Mail, Phone, Building, Briefcase, CalendarIcon, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function TeachersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Consulta de Docentes"
        description="Visualiza, edita o elimina la información de los docentes registrados."
      >
        <div className="p-2 bg-primary/10 rounded-md">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm border border-primary text-primary">
                <span className="text-xs font-bold">A</span>
            </div>
        </div>
      </PageHeader>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        {teachers.map((teacher) => (
          <AccordionItem value={teacher.id} key={teacher.id} className="border-b-0">
             <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={teacher.avatar} data-ai-hint="person avatar" alt={teacher.name} />
                        <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                        <p className="font-semibold">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.position}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{teacher.employmentType}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                    <Separator className="mb-6" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-sm">
                        <div className="flex items-start gap-3">
                            <Hash className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-muted-foreground">Nº Documento</p>
                                <p className="text-foreground">{teacher.documentNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-muted-foreground">Correo Institucional</p>
                                <p className="text-foreground">{teacher.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-muted-foreground">Teléfono Celular</p>
                                <p className="text-foreground">{teacher.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-muted-foreground">Dependencia</p>
                                <p className="text-foreground">{teacher.department}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-muted-foreground">Cargo</p>
                                <p className="text-foreground">{teacher.position}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-muted-foreground">Fecha de Ingreso</p>
                                <p className="text-foreground">{teacher.entryDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
                        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Editar</Button>
                        <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
                    </div>
                </AccordionContent>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}