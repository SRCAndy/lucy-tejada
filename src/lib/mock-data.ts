
export type Student = {
  id: string;
  name: string;
  email: string;
  enrolled: string;
  avatar: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  courses: number;
  avatar: string;
  position: string;
  employmentType: 'planta' | 'cátedra';
  documentNumber: string;
  phone: string;
  department: string;
  entryDate: string;
};

export type Course = {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  enrolledStudents: number;
  capacity: number;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  announcements?: CourseAnnouncement[];
};

export type CourseAnnouncement = {
  title: string;
  content: string;
  isNew?: boolean;
}

export type Evaluation = {
    courseId: string;
    courseName: string;
    teacherName: string;
    assessments: Assessment[];
};

export type Assessment = {
    id: string;
    title: string;
    grade: number;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
  category: 'Evento' | 'Académico' | 'General';
};


export const students: Student[] = [
  { id: "S001", name: "Ana María López", email: "ana.lopez@ejemplo.com", enrolled: "2023-09-01", avatar: "https://picsum.photos/seed/S001/40/40" },
  { id: "S002", name: "Carlos González", email: "carlos.g@ejemplo.com", enrolled: "2023-09-01", avatar: "https://picsum.photos/seed/S002/40/40" },
  { id: "S003", name: "Luisa Fernández", email: "luisa.f@ejemplo.com", enrolled: "2023-09-02", avatar: "https://picsum.photos/seed/S003/40/40" },
  { id: "S004", name: "Javier Rodríguez", email: "javier.r@ejemplo.com", enrolled: "2023-09-03", avatar: "https://picsum.photos/seed/S004/40/40" },
  { id: "S005", name: "Sofía Martínez", email: "sofia.m@ejemplo.com", enrolled: "2023-09-03", avatar: "https://picsum.photos/seed/S005/40/40" },
];

export const teachers: Teacher[] = [
  { 
    id: "T04", 
    name: "Carlos Rengifo", 
    email: "carlos.rengifo@institucion.edu.co", 
    courses: 1, 
    avatar: "https://picsum.photos/seed/T04/100/100",
    position: "Docente de Artes Plásticas",
    employmentType: "planta",
    documentNumber: "12345678",
    phone: "3001112233",
    department: "Facultad de Bellas Artes",
    entryDate: "31 de enero de 2015"
  },
  { 
    id: "T05", 
    name: "Sofía Vergara", 
    email: "sofia.v@example.com", 
    courses: 1, 
    avatar: "https://picsum.photos/seed/T05/100/100",
    position: "Docente de Danza Contemporánea",
    employmentType: "cátedra",
    documentNumber: "87654321",
    phone: "3003334455",
    department: "Facultad de Artes Escénicas",
    entryDate: "15 de julio de 2018"
  },
  { 
    id: "T01", 
    name: "Dr. Alejandro Pérez", 
    email: "alejandro.p@example.com", 
    courses: 2, 
    avatar: "https://picsum.photos/seed/T01/100/100",
    position: "Docente de Ciencia de Datos",
    employmentType: "planta",
    documentNumber: "11223344",
    phone: "3109876543",
    department: "Facultad de Ingeniería",
    entryDate: "01 de febrero de 2012"
  },
  { 
    id: "T02", 
    name: "Dra. Isabel Gómez", 
    email: "isabel.g@example.com", 
    courses: 1, 
    avatar: "https://picsum.photos/seed/T02/100/100",
    position: "Docente de Historia del Arte",
    employmentType: "cátedra",
    documentNumber: "44332211",
    phone: "3211234567",
    department: "Facultad de Bellas Artes",
    entryDate: "20 de agosto de 2020"
  },
];

export const courses: Course[] = [
  { 
    id: "C101", 
    name: "Introducción a la Ciencia de Datos", 
    code: "CS101", 
    teacher: "Dr. Alejandro Pérez", 
    credits: 3, 
    enrolledStudents: 45, 
    capacity: 50,
    daysOfWeek: ["Lunes", "Miércoles"],
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    announcements: [
        {
            title: "Materiales para la próxima clase",
            content: "Recuerden traer sus espátulas y un lienzo de 50x70cm para la sesión de este martes.",
            isNew: true
        },
        {
            title: "Cambio de fecha entrega de bocetos",
            content: "La entrega de los bocetos se aplaza para el viernes 15 de Noviembre."
        }
    ]
  },
  { 
    id: "C102", 
    name: "Matemáticas Avanzadas", 
    code: "MATH202", 
    teacher: "Dr. Ricardo Torres", 
    credits: 4, 
    enrolledStudents: 30, 
    capacity: 35,
    daysOfWeek: ["Martes", "Jueves"],
    startTime: "01:00 PM",
    endTime: "02:30 PM"
  },
  { 
    id: "C103", 
    name: "Historia del Arte", 
    code: "ART101", 
    teacher: "Dra. Isabel Gómez", 
    credits: 3, 
    enrolledStudents: 60, 
    capacity: 60,
    daysOfWeek: ["Viernes"],
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    announcements: [
        {
            title: "Recordatorio: Visita al museo",
            content: "No olviden que nuestra visita al Museo de Arte Moderno es este viernes. Punto de encuentro en la entrada principal a las 9:00 AM.",
            isNew: true
        }
    ]
  },
  { 
    id: "C104", 
    name: "Estructuras de Datos", 
    code: "CS201", 
    teacher: "Dr. Alejandro Pérez", 
    credits: 3, 
    enrolledStudents: 25, 
    capacity: 40,
    daysOfWeek: ["Lunes", "Miércoles"],
    startTime: "02:00 PM",
    endTime: "03:30 PM"
  },
  {
    id: "C105",
    name: "Pintura al Óleo",
    code: "ART202",
    teacher: "Carlos Rengifo",
    credits: 3,
    enrolledStudents: 15,
    capacity: 20,
    daysOfWeek: ["Martes"],
    startTime: "09:00 AM",
    endTime: "12:00 PM",
  },
  {
    id: "C106",
    name: "Danza Contemporánea",
    code: "DAN301",
    teacher: "Sofía Vergara",
    credits: 2,
    enrolledStudents: 20,
    capacity: 25,
    daysOfWeek: ["Miércoles"],
    startTime: "04:00 PM",
    endTime: "06:00 PM",
  },
  {
    id: "C107",
    name: "Teatro Experimental",
    code: "TEA400",
    teacher: "Javier Bardem",
    credits: 3,
    enrolledStudents: 18,
    capacity: 20,
    daysOfWeek: ["Jueves"],
    startTime: "06:00 PM",
    endTime: "09:00 PM",
  }
];

export const studentEnrolledCourses = [courses[0], courses[2]];
export const teacherAssignedCourses = [courses[0], courses[3]];

export const availabilityOptions = [
    { value: "Monday", label: "Lunes" },
    { value: "Tuesday", label: "Martes" },
    { value: "Wednesday", label: "Miércoles" },
    { value: "Thursday", label: "Jueves" },
    { value: "Friday", label: "Viernes" },
    { value: "Saturday", label: "Sábado" },
    { value: "Sunday", label: "Domingo" },
];

export const evaluations: Evaluation[] = [
    {
        courseId: "C105",
        courseName: "Pintura al Óleo",
        teacherName: "Carlos Rengifo",
        assessments: [
            { id: "A001", title: "Tarea 1: Bocetos iniciales", grade: 4.8 },
            { id: "A002", title: "Parcial 1: Composición y color", grade: 4.5 },
            { id: "A003", title: "Proyecto final: Serie de paisajes", grade: 4.9 },
        ]
    },
    {
        courseId: "C106",
        courseName: "Danza Contemporánea",
        teacherName: "Sofía Vergara",
        assessments: [
             { id: "A004", title: "Presentación 1", grade: 4.2 },
             { id: "A005", title: "Coreografía final", grade: 4.7 },
        ]
    },
    {
        courseId: "C107",
        courseName: "Teatro Experimental",
        teacherName: "Javier Bardem",
        assessments: [
            { id: "A006", title: "Improvisación", grade: 4.6 },
            { id: "A007", title: "Monólogo", grade: 4.8 },
        ]
    }
];

export const institutionalAnnouncements: Announcement[] = [
  {
    id: "AN001",
    title: "Gran Concierto de Fin de Año",
    content: "No te pierdas el tradicional concierto de fin de año con la orquesta sinfónica de la institución. ¡Una noche llena de música y talento!",
    date: "05 de diciembre de 2024",
    author: "Rectoría",
    imageUrl: "https://picsum.photos/seed/AN001/600/400",
    category: "Evento",
  },
  {
    id: "AN002",
    title: "Inscripciones Abiertas para el Próximo Semestre",
    content: "El periodo de inscripción para el primer semestre de 2025 ya está abierto. Consulta el portal de estudiantes para más detalles.",
    date: "01 de diciembre de 2024",
    author: "Secretaría Académica",
    imageUrl: "https://picsum.photos/seed/AN002/600/400",
    category: "Académico",
  },
  {
    id: "AN003",
    title: "Mantenimiento de la Plataforma",
    content: "La plataforma estará en mantenimiento el próximo sábado de 2:00 AM a 4:00 AM. Agradecemos su comprensión.",
    date: "28 de noviembre de 2024",
    author: "Departamento de TI",
    imageUrl: "https://picsum.photos/seed/AN003/600/400",
    category: "General",
  },
];
