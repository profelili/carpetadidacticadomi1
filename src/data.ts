import { Student, ActivityPlan, ResourceMaterial } from './types';

export const INITIAL_STUDENTS: Student[] = [
  // Domiciliarios (Domi1 and Domi2)
  {
    id: 'dom-1',
    nombre: 'Mateo R.',
    apellido: '(Domi1)',
    edad: 9,
    dni: '52.144.302',
    fechaNac: '2016-11-20',
    escuela: 'E.P. N° 12',
    diagnostico: 'Trastorno Generalizado del Desarrollo (TGD)',
    contexto: 'Domicilio',
    fechaProxVisita: 'Lunes',
    horaProxVisita: '09:00 hs',
    estado: 'Activo',
    avatarInitials: 'D1',
    ultimaClase: '29/05/2026',
    observaciones: {
      titulo1: 'Seguimiento TGD',
      desc1: 'Trabajo individual con material concreto adaptado. Muestra excelente respuesta a consignas cortas con soporte visual.',
      titulo2: 'Carpeta Didáctica',
      desc2: 'Registro oficial asentado en folios del área domiciliaria Domi1.',
      ultimaActualizacion: 'Ayer'
    }
  },
  {
    id: 'dom-2',
    nombre: 'Lautaro M.',
    apellido: '(Domi2)',
    edad: 11,
    dni: '49.502.143',
    fechaNac: '2014-04-12',
    escuela: 'E.P. N° 45',
    diagnostico: 'Cirugía Post-operatorio en recuperación domiciliaria',
    contexto: 'Domicilio',
    fechaProxVisita: 'Martes',
    horaProxVisita: '11:00 hs',
    estado: 'Activo',
    avatarInitials: 'D2',
    ultimaClase: '29/05/2026',
    observaciones: {
      titulo1: 'Fisio-motricidad',
      desc1: 'Se coordinará el uso de soportes ergonómicos para la escritura. Fatiga muscular controlada en bloques de 20 min.',
      titulo2: 'Carpeta Didáctica',
      desc2: 'Registro oficial unificado bajo supervisión del gabinete domiciliario.',
      ultimaActualizacion: 'Hace 2 días'
    }
  },
  
  // Hospitalarios (Hospital Fernández)
  {
    id: 'hosp-1',
    nombre: 'Emanuel Vega Peña',
    apellido: '(H. Fernández)',
    edad: 10,
    dni: '50.142.884',
    fechaNac: '2016-01-15',
    escuela: 'E.P. N° 12',
    diagnostico: 'Grado 4° - Internación de mediano plazo en Hospital Fernández',
    contexto: 'Hospital',
    salaDetail: 'Hospital Fernández - Cama 302',
    avatarInitials: 'EV',
    estado: 'Activo',
    ultimaClase: '28/05/2026',
    observaciones: {
      titulo1: 'Matemática Dinámica',
      desc1: 'Completó toda la tabla pitagórica y la representó en el Círculo Waldorf sin dificultad el día Miércoles.',
      titulo2: 'Compromiso Pedagógico',
      desc2: 'Presenta alto interés por descubrir regularidades geométricas e hilados de color.',
      ultimaActualizacion: 'Miércoles 27/05'
    }
  },
  {
    id: 'hosp-2',
    nombre: 'Santino',
    apellido: '(H. Fernández)',
    edad: 9,
    dni: '51.442.901',
    fechaNac: '2017-09-14',
    escuela: 'E.P. N° 12',
    diagnostico: 'Grado 3° - Reposo clínico prolongado en Hospital Fernández',
    contexto: 'Hospital',
    salaDetail: 'Hospital Fernández - Cama 305',
    avatarInitials: 'S',
    estado: 'Activo',
    ultimaClase: '28/05/2026',
    observaciones: {
      titulo1: 'Seguimiento Clínico',
      desc1: 'Miércoles sin clase por estudio odontológico obligatorio. Recuperó contenidos el día Jueves.',
      titulo2: 'Efemérides de Mayo',
      desc2: 'Fuerte compromiso en el armado del rompecabezas histórico y la caracterización de la vida social de 1810.',
      ultimaActualizacion: 'Jueves 28/05'
    }
  },
  {
    id: 'hosp-3',
    nombre: 'Martina Juarez',
    apellido: '(H. Fernández)',
    edad: 11,
    dni: '48.992.012',
    fechaNac: '2015-08-30',
    escuela: 'Colegio San Martín',
    diagnostico: 'Grado 5° - Recuperación post-traumatológica en Hospital Fernández',
    contexto: 'Hospital',
    salaDetail: 'Hospital Fernández - Cama 310',
    avatarInitials: 'MJ',
    estado: 'Activo',
    ultimaClase: '28/05/2026',
    observaciones: {
      titulo1: 'Salud Integral',
      desc1: 'Miércoles sin clase por estudio odontológico programado. Retomó el Jueves con juego de efemérides.',
      titulo2: 'Área Social',
      desc2: 'Reconoce costumbres, diferencias de clases sociales y vestimentas de la época colonial mediante un rompecabezas adaptado.',
      ultimaActualizacion: 'Jueves 28/05'
    }
  },

  // Hogar Juanito
  {
    id: 'hog-1',
    nombre: 'Giovani Baden',
    apellido: '(Hogar Juanito)',
    edad: 13,
    dni: '46.102.344',
    fechaNac: '2013-03-24',
    escuela: 'E.P. N° 12 (Anexo Hogar)',
    diagnostico: 'Inclusión e iniciación tecnológica en el Hogar Juanito',
    contexto: 'Hogar',
    avatarInitials: 'GB',
    estado: 'Activo',
    ultimaClase: '29/05/2026',
    observaciones: {
      titulo1: 'Taller Termofusión',
      desc1: 'Comprendió perfectamente el protocolo de seguridad para la termofusión de bolsas plásticas planas.',
      titulo2: 'Materiales Sólidos',
      desc2: 'Identifica correctamente los tipos de plásticos reciclables: PEAD, PEBD y distingue el residuo peligroso (PVC).',
      ultimaActualizacion: 'Viernes 29/05'
    }
  },
  {
    id: 'hog-2',
    nombre: 'Mario Sarmiento',
    apellido: '(Hogar Juanito)',
    edad: 12,
    dni: '47.552.001',
    fechaNac: '2014-06-11',
    escuela: 'E.P. N° 12 (Anexo Hogar)',
    diagnostico: 'Prácticas experimentales / Reciclaje en el Hogar Juanito',
    contexto: 'Hogar',
    avatarInitials: 'MS',
    estado: 'Activo',
    ultimaClase: '29/05/2026',
    observaciones: {
      titulo1: 'Uso de Prensa Térmica',
      desc1: 'Sigue minuciosamente los pasos del manual de seguridad de la máquina térmica.',
      titulo2: 'Clasificación de Plásticos',
      desc2: 'Reconoce nomenclatura PEAD o PEBD en botellas y sachets de leche aptos para termo-unión.',
      ultimaActualizacion: 'Viernes 29/05'
    }
  }
];

export const INITIAL_ACTIVITIES: ActivityPlan[] = [
  // Emanuel Vega Peña (hosp-1)
  {
    id: 'act-1',
    studentId: 'hosp-1',
    materia: 'Matemática',
    tema: 'Multiplicación con Métodos Dinámicos',
    descripcion: 'Ejercicios de asimilación multiplicativa: Completar la Tabla Pitagórica conceptual y representar la geometría numérica usando el Círculo de Multiplicación Waldorf.',
    prioridad: 'Alta',
    estado: 'INTEGRADOR',
    tags: ['Tabla Pitagórica', 'Círculo Waldorf', 'Método Dinámico'],
    recursoClave: 'Círculo Waldorf de madera y Tabla Pitagórica Plastificada'
  },
  {
    id: 'act-2',
    studentId: 'hosp-1',
    materia: 'Ciencias Sociales',
    tema: 'Efemérides: Revolución de 1810',
    descripcion: 'Paso por el Cabildo y la Plaza de la Victoria. Análisis de la vida social colonial mediante Rompecabezas histórico y Crucigrama interactivo.',
    prioridad: 'Media',
    estado: 'EN PROGRESO',
    tags: ['Revolución de 1810', 'Vida Social', 'Crucigrama'],
    recursoClave: 'Crucigrama didáctico interactivo impreso'
  },

  // Santino (hosp-2)
  {
    id: 'act-3',
    studentId: 'hosp-2',
    materia: 'Ciencias Sociales',
    tema: 'Efemérides: Revolución de 1810',
    descripcion: 'Armado interactivo de rompecabezas sobre los vendedores ambulantes y la gente de la Revolución de Mayo. Charla guiada sobre vestimentas y costumbres coloniales.',
    prioridad: 'Media',
    estado: 'EN PROGRESO',
    tags: ['Vida Social 1810', 'Rompecabezas', 'Efemérides'],
    recursoClave: 'Rompecabezas de las efemérides de Mayo'
  },

  // Martina Juarez (hosp-3)
  {
    id: 'act-4',
    studentId: 'hosp-3',
    materia: 'Ciencias Sociales',
    tema: 'Efemérides: Revolución de 1810',
    descripcion: 'Efemérides de la semana de mayo: Armado colaborativo de rompecabezas histórico. Análisis comparativo de la Vida Social de la época colonial vs. la vida actual.',
    prioridad: 'Media',
    estado: 'EN PROGRESO',
    tags: ['Revolución de Mayo', 'Vida Colonial', 'Rompecabezas'],
    recursoClave: 'Lámina de efemérides desmontable'
  },

  // Giovani Baden (hog-1)
  {
    id: 'act-5',
    studentId: 'hog-1',
    materia: 'Ciencias Naturales / Tecnología',
    tema: 'Termofusión con bolsas plásticas',
    descripcion: 'Proyecto Escuelas Verdes: Reutilización de bolsas de polietileno de baja densidad (PEBD). Explicación y puesta en práctica del protocolo de seguridad industrial ante la prensa térmica.',
    prioridad: 'Alta',
    estado: 'INTEGRADOR',
    tags: ['Termofusión', 'Protocolo de Seguridad', 'PEAD o PEBD', 'Eco-Textil'],
    recursoClave: 'Soporte de prensa con papel manteca y bolsas de colores'
  },

  // Mario Sarmiento (hog-2)
  {
    id: 'act-6',
    studentId: 'hog-2',
    materia: 'Ciencias Naturales / Tecnología',
    tema: 'Termofusión con bolsas plásticas',
    descripcion: 'Métodos de identificación de polímeros termo-fusionables (PEAD, PEBD) y no fusibles (PVC). Protocolo de seguridad y uso controlado de calor para crear láminas textiles sintéticas.',
    prioridad: 'Alta',
    estado: 'INTEGRADOR',
    tags: ['Clasificación', 'Residuos', 'Escuelas Verdes', 'Termofusión'],
    recursoClave: 'Manual ilustrado de identificación de plásticos'
  }
];

export const DEFAULT_RESOURCES: ResourceMaterial[] = [
  {
    id: 'res-1',
    titulo: 'Tabla Pitagórica Dinámica',
    descripcion: 'Tabla de doble entrada conceptual adaptada con códigos de colores cálidos para facilitar el aprendizaje de las tablas.',
    materia: 'Matemática'
  },
  {
    id: 'res-2',
    titulo: 'Círculo de Multiplicación Waldorf',
    descripcion: 'Plantilla redonda de madera con pines numerados del 0 al 9 para entrelazar lanas de colores formando espirales geométricas.',
    materia: 'Matemática'
  },
  {
    id: 'res-3',
    titulo: 'Efemérides: Set de la Revolución de 1810',
    descripcion: 'Colección de escenas históricas vectoriales desglosadas en rompecabezas imprimibles y crucigramas adaptados.',
    materia: 'C. Sociales'
  },
  {
    id: 'res-4',
    titulo: 'Manual de Seguridad de Termofusión',
    descripcion: 'Póster infográfico explicativo portátil para guiar la identificación de materiales seguros (PEAD/PEBD) y evitar el PVC en la prensa.',
    materia: 'Seguridad'
  }
];
