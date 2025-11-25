"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, PlusCircle, Trash2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { studentEnrolledCourses, availabilityOptions } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

const availabilitySchema = z.object({
  dayOfWeek: z.string().min(1, "Por favor seleccione un día."),
  startTime: z.string().min(1, "Por favor ingrese una hora de inicio."),
  endTime: z.string().min(1, "Por favor ingrese una hora de fin."),
});

const formSchema = z.object({
  availability: z.array(availabilitySchema).min(1, "Por favor agregue al menos un espacio de disponibilidad."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ScheduleForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availability: [{ dayOfWeek: "", startTime: "", endTime: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availability",
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setSchedule(null);

    // TODO: Integrar con AI cuando esté disponible
    toast({
      title: "Información",
      description: "La generación de horario con IA estará disponible próximamente.",
      variant: "default",
    });
    setIsLoading(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tu Disponibilidad</CardTitle>
              <CardDescription>
                Dinos cuándo estás libre para estudiar. Agrega tantos espacios de tiempo como necesites.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg relative">
                  <FormField
                    control={form.control}
                    name={`availability.${index}.dayOfWeek`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Día</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un día" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availabilityOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`availability.${index}.startTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desde</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`availability.${index}.endTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hasta</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   {fields.length > 1 && (
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 h-7 w-7 bg-background hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   )}
                </div>
              ))}
               <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ dayOfWeek: "", startTime: "", endTime: "" })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Espacio
                </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generar Horario
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      <div className="lg:sticky top-20">
        <Card className="min-h-[30rem]">
          <CardHeader>
            <CardTitle>Tu Horario Generado por IA</CardTitle>
            <CardDescription>
                Este es el plan de estudio creado solo para ti.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Generando tu horario...</p>
              </div>
            )}
            {schedule && (
                <div className="p-4 bg-muted/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{schedule}</pre>
                </div>
            )}
            {!isLoading && !schedule && (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground text-center">
                 <Wand2 className="h-10 w-10 mb-4"/>
                <p>Tu horario generado aparecerá aquí.</p>
                <p className="text-xs">Completa tu disponibilidad y haz clic en "Generar".</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
