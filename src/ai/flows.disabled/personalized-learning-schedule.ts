'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized learning schedule for students.
 *
 * The flow takes a list of enrolled courses and student availability as input, and uses generative AI to create an optimal weekly learning schedule.
 *
 * @module personalized-learning-schedule
 * @interface PersonalizedLearningScheduleInput - The input type for the personalizedLearningSchedule function.
 * @interface PersonalizedLearningScheduleOutput - The output type for the personalizedLearningSchedule function.
 * @function personalizedLearningSchedule - A function that generates a personalized learning schedule.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const PersonalizedLearningScheduleInputSchema = z.object({
  courses: z.array(
    z.object({
      name: z.string().describe('El nombre del curso.'),
      creditHours: z.number().describe('El número de horas de crédito del curso.'),
      daysOfWeek: z.array(z.string()).describe('Los días de la semana en que se ofrece el curso (por ejemplo, ["Lunes", "Miércoles"]).'),
      startTime: z.string().describe('La hora de inicio del curso (por ejemplo, "9:00 AM").'),
      endTime: z.string().describe('La hora de finalización del curso (por ejemplo, "9:50 AM").'),
    })
  ).describe('Una lista de cursos matriculados con detalles como nombre, horas de crédito, días de la semana y horas de inicio/fin.'),
  availability: z.array(
    z.object({
      dayOfWeek: z.string().describe('El día de la semana.'),
      startTime: z.string().describe('La hora de inicio del horario disponible (por ejemplo, "2:00 PM").'),
      endTime: z.string().describe('La hora de finalización del horario disponible (por ejemplo, "5:00 PM").'),
    })
  ).describe('La disponibilidad del estudiante, especificando días y franjas horarias en las que está libre para estudiar.'),
});

export type PersonalizedLearningScheduleInput = z.infer<typeof PersonalizedLearningScheduleInputSchema>;

// Define the output schema
const PersonalizedLearningScheduleOutputSchema = z.object({
  schedule: z.string().describe('Un horario de aprendizaje semanal detallado, optimizado para los cursos y la disponibilidad del estudiante.'),
});

export type PersonalizedLearningScheduleOutput = z.infer<typeof PersonalizedLearningScheduleOutputSchema>;

// Define the tool to generate the schedule
const generateSchedule = ai.defineTool({
  name: 'generateSchedule',
  description: 'Genera un horario de aprendizaje semanal personalizado basado en los cursos y la disponibilidad proporcionados.',
  inputSchema: PersonalizedLearningScheduleInputSchema,
  outputSchema: PersonalizedLearningScheduleOutputSchema,
},
async (input) => {
  // This function will use the AI model to generate the schedule.
  // For now, it returns a placeholder schedule.

  const prompt = ai.definePrompt({
    name: 'schedulePrompt',
    prompt: `Eres un generador de horarios de IA. Generarás un horario de aprendizaje semanal personalizado basado en los cursos y la disponibilidad proporcionados.
        Cursos: {{{JSON.stringify(courses, null, 2)}}}
        Disponibilidad: {{{JSON.stringify(availability, null, 2)}}}
        Horario: `,
  });

  const { output } = await prompt(input);

  return {
    schedule: output?.schedule ?? 'Horario de marcador de posición',
  };
});

// Define the flow
const personalizedLearningScheduleFlow = ai.defineFlow({
    name: 'personalizedLearningScheduleFlow',
    inputSchema: PersonalizedLearningScheduleInputSchema,
    outputSchema: PersonalizedLearningScheduleOutputSchema,
  },
  async input => {
    const { schedule } = await generateSchedule(input);
    return { schedule };
  }
);

// Exported function to call the flow
export async function personalizedLearningSchedule(input: PersonalizedLearningScheduleInput): Promise<PersonalizedLearningScheduleOutput> {
  return personalizedLearningScheduleFlow(input);
}
