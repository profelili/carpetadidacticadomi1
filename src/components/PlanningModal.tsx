import React, { useState, useRef } from 'react';
import { Student, ActivityPlan, AttachedFile, ResourceMaterial } from '../types';
import { DEFAULT_RESOURCES } from '../data';

interface PlanningModalProps {
  onClose: () => void;
  students: Student[];
  onAddActivity: (newAct: Omit<ActivityPlan, 'id'>) => void;
  activityToEdit?: ActivityPlan;
  onUpdateActivity?: (updatedAct: ActivityPlan) => void;
  defaultStudentId?: string;
  onPreviewResource?: (res: ResourceMaterial) => void;
  customExternalResources: ResourceMaterial[];
  onAddCustomExternalResource: (title: string, url: string, description?: string, imageUrl?: string) => void;
  onDeleteCustomExternalResource: (id: string) => void;
}

export const PlanningModal: React.FC<PlanningModalProps> = ({
  onClose,
  students,
  onAddActivity,
  activityToEdit,
  onUpdateActivity,
  defaultStudentId,
  onPreviewResource,
  customExternalResources,
  onAddCustomExternalResource,
  onDeleteCustomExternalResource,
}) => {
  const [studentId, setStudentId] = useState<string>(activityToEdit?.studentId || defaultStudentId || students[0]?.id || '');
  const [materia, setMateria] = useState<string>(activityToEdit?.materia || 'Matemática');
  const [tema, setTema] = useState<string>(activityToEdit?.tema || '');
  const [descripcion, setDescripcion] = useState<string>(activityToEdit?.descripcion || '');
  const [prioridad, setPrioridad] = useState<'Alta' | 'Media' | 'Baja'>(activityToEdit?.prioridad || 'Media');
  const [estado, setEstado] = useState<'EN PROGRESO' | 'PENDIENTE' | 'INTEGRADOR'>(activityToEdit?.estado || 'EN PROGRESO');
  const [recursoClave, setRecursoClave] = useState<string>(activityToEdit?.recursoClave || '');
  const [resourceTab, setResourceTab] = useState<'interactivos' | 'externos'>('interactivos');
  const [newExtTitle, setNewExtTitle] = useState('');
  const [newExtUrl, setNewExtUrl] = useState('');
  const [newExtDesc, setNewExtDesc] = useState('');
  const [newExtImgUrl, setNewExtImgUrl] = useState('');
  const lastOpenedUrl = useRef<string>('');

  const handleRecursoClaveChange = (val: string) => {
    setRecursoClave(val);
    const urlRegex = /((?:https?:\/\/|www\.)[^\s()<>]+|(?:gemini|drive)\.google\.com\/[^\s()<>]+)/i;
    const match = val.match(urlRegex);
    if (match) {
      let url = match[0];
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      if (url !== lastOpenedUrl.current) {
        lastOpenedUrl.current = url;
        // Auto open link with a small delay
        setTimeout(() => {
          try {
            window.open(url, '_blank', 'noopener,noreferrer');
          } catch (e) {
            console.warn("Popup blocker caught auto-redirect.", e);
          }
        }, 800);
      }
    }
  };

  const [tagsInput, setTagsInput] = useState<string>(activityToEdit?.tags.join(', ') || '');
  const [enlaceUrl, setEnlaceUrl] = useState<string>(activityToEdit?.enlaceUrl || '');
  const [enlaceTitulo, setEnlaceTitulo] = useState<string>(activityToEdit?.enlaceTitulo || '');

  // Active testing resource state for opening within the same modal
  const [activeResourceForTesting, setActiveResourceForTesting] = useState<ResourceMaterial | null>(null);

  // --- STATE FOR EMBEDDED PATH INTERACTIONS ---
  // Resource 1: Tabla Pitagórica Dinámica
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceChecking, setPracticeChecking] = useState(false);

  const isCellBlanked = (r: number, c: number): boolean => {
    const sum = r + c;
    return (sum % 3 === 0 && r > 1 && c > 1) || (r === c && r > 2);
  };

  const handleAnswerChange = (r: number, c: number, val: string) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [`${r}-${c}`]: val,
    }));
  };

  const resetPractice = () => {
    setPracticeAnswers({});
    setPracticeChecking(false);
  };

  // Resource 2: Círculo Waldorf
  const [multiplier, setMultiplier] = useState<number>(3);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [yarnColor, setYarnColor] = useState<string>('#3b82f6');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const waldorfSteps = Array.from({ length: 11 }, (_, i) => ({
    label: `${multiplier} x ${i}`,
    product: multiplier * i,
    lastDigit: (multiplier * i) % 10,
  }));

  const getCoordinatesForPin = (pin: number) => {
    const angle = (pin * 36 - 90) * (Math.PI / 180);
    const r = 85; 
    const cx = 110;
    const cy = 110;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  React.useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIndex(prev => (prev < 10 ? prev + 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  React.useEffect(() => {
    const colors = [
      '#ef4444', 
      '#f97316', 
      '#3b82f6', 
      '#84cc16', 
      '#10b981', 
      '#8b5cf6', 
      '#ec4899', 
      '#06b6d4', 
      '#eab308'  
    ];
    setYarnColor(colors[multiplier % colors.length]);
  }, [multiplier]);

  // Resource 3: Efemérides de 1810
  const [selectedCharacter, setSelectedCharacter] = useState<number>(0);
  const [customQuestion, setCustomQuestion] = useState<string>(
    '¿Cómo crees que el Aguatero transportaba el agua limpia desde el Río de la Plata?'
  );

  const personajes = [
    {
      name: 'El Aguatero',
      pregon: '¡Agua fresca de la corriente, para calmar su sed ardiente! ¡Agua del río bien fresquita, para lavarse la carita!',
      desc: 'En 1810 no había tuberías ni canillas en Buenos Aires. El Aguatero recolectaba el agua del Río de la Plata en un gran barril sobre una carreta tirada por bueyes, y la vendía casa por casa.',
      adaptedPrompt: '¿Cómo crees que el Aguatero transportaba el agua limpia desde el Río de la Plata?',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCq4p5kl68tntZi6xybOecqUr3bIRvHKGsxWZ2uXff01rLIz_zrtNc3WCAgQobaAlmBzTMjo1kNx5p7WiWweR28XhQ5OYXy2Ja1jj5Q2eeh0TyvJTNCKEjPpNlBQFxTZU6WGJYUd0Qk6fyqInWCyDU_wHxbre9P1cxQXsTYXgH0L04D3mmz1f4pQT8ekuiyz5ka6zP2yZuYZJoV0RPbLDYfFoHnMfCi4tIrSBnrCWbIZtVb8AiuhmpuXUtcBTXZqksQhg84cZGUG0'
    },
    {
      name: 'El Sereno',
      pregon: '¡Las doce han dado y sereno! ¡La noche está de lo más bella, alumbrada por cada estrella! ¡No temáis que os vigilo yo!',
      desc: 'El Sereno caminaba por las oscuras calles de tierra de la ciudad colonial, encendiendo las farolas de vela a las 6 pm y cantando la hora y el clima cada hora durante toda la noche.',
      adaptedPrompt: 'Diferencia las farolas coloniales del Sereno con el alumbrado público con focos led modernos. ¿Cómo cambió?',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEZszR4dZHe717eYm2fJ_Scl6gC-8uBOfXyF0Z-v03V7rLY9U1G0H31Nszm8_n_cQpBLgM_0_Bv7aE6f7vFpx6_dldXvU6A0g_B7-S7M94a'
    },
    {
      name: 'La Lavandera',
      pregon: '¡A la ropa limpia le doy color! ¡Lavo la sabana de mi señor! ¡Al río me voy tempranito, a dejar el paño blanquito!',
      desc: 'Las lavanderas eran esclavas o mujeres libres que caminaban largas distancias hasta la costa del río con grandes cestas de ropa sobre sus cabezas. Lavaban arrodilladas sobre las rocas.',
      adaptedPrompt: '¿Por qué la ropa se lavaba en el río en lugar de en las casas coloniales? Describe el jabón de cenizas.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwR7481LXeN6U9P9hQ5FpY9uY6w-9qgNn8aL4Xz5Z_7rLY4Y6z5n6uW4gA0_B9XvXp'
    }
  ];

  // Resource 4: Manuel de Termofusión
  const [selectedPlastic, setSelectedPlastic] = useState<string>('PEBD');
  const [fusePracticeStatus, setFusePracticeStatus] = useState<Record<string, boolean>>({
    goggles: false,
    gloves: false,
    paper: true,
    ventilation: false,
    nonPVC: false,
  });

  const PlasticsGuides: Record<string, {
    name: string;
    num: number;
    description: string;
    safe: boolean;
    temp: string;
    toxicity: 'Baja' | 'Media' | 'MUY ALTA';
    reason: string;
  }> = {
    PET: {
      name: 'PET (Polietileno Tereftalato)',
      num: 1,
      description: 'Botellas de gaseosa y agua desechables.',
      safe: false,
      temp: '260 °C (Demasiado alta)',
      toxicity: 'Media',
      reason: 'No se deforma adecuadamente en la termo-prensa escolar convencional, requiere calor excesivo que puede arruinar las planchas.'
    },
    PEAD: {
      name: 'PEAD / HDPE (Polietileno de Alta Densidad)',
      num: 2,
      description: 'Envases rígidos de champú, bidones de detergente, tapas.',
      safe: true,
      temp: '130 - 150 °C',
      toxicity: 'Baja',
      reason: 'Muy apto. Al triturarlo, se deforma en bellas texturas marmoladas de alta durabilidad.'
    },
    PVC: {
      name: 'PVC (Policloruro de Vinilo)',
      num: 3,
      description: 'Tubos de plomería, mangueras, ciertos juguetes plásticos.',
      safe: false,
      temp: 'Prohibido fundir',
      toxicity: 'MUY ALTA',
      reason: '¡PELIGRO EXTREMO! Al derretirse emite gas cloro y compuestos cancerígenos que dañan el sistema respiratorio de los niños. NO fundir jamás.'
    },
    PEBD: {
      name: 'PEBD / LDPE (Polietileno de Baja Densidad)',
      num: 4,
      description: 'Bolsas de supermercado tradicionales, sachets de leche vacíos y limpios.',
      safe: true,
      temp: '110 - 120 °C',
      toxicity: 'Baja',
      reason: '¡El mejor material! Fusiona en solo segundos a baja temperatura formando una tela plástica impermeable que los alumnos pueden cortar y coser.'
    },
    PP: {
      name: 'PP (Polipropileno)',
      num: 5,
      description: 'Tapas de botellas, envases de yogur, vasos plásticos.',
      safe: true,
      temp: '165 °C',
      toxicity: 'Baja',
      reason: 'Apto con cuidado. Requiere mayor tiempo de prensado y enfriado completo para evitar contracciones moleculares.'
    },
    PS: {
      name: 'PS (Poliestireno)',
      num: 6,
      description: 'Bandejas de telgopor, cubiertos descartables.',
      safe: false,
      temp: 'Evitar fundir',
      toxicity: 'Media',
      reason: 'Se contrae excesivamente e inhala un fuerte humo negro desagradable. Rejillas de ventilación adicionales requeridas.'
    },
  };

  const isSafetyPass = Object.values(fusePracticeStatus).every(Boolean);

  // Resource 5: Mundial Digital 2026
  const [mundialTab, setMundialTab] = useState<'home' | 'explora' | 'juga' | 'investiga'>('home');
  const [selectedCountry, setSelectedCountry] = useState<string>('Argentina');
  const [triviaIndex, setTriviaIndex] = useState<number>(0);
  const [triviaScore, setTriviaScore] = useState<number>(0);
  const [triviaSelectedAnswer, setTriviaSelectedAnswer] = useState<number | null>(null);
  const [triviaCompleted, setTriviaCompleted] = useState<boolean>(false);

  const p_digitales: Record<string, {
    flag: string;
    culture: string;
    fact: string;
    color: string;
  }> = {
    Argentina: {
      flag: '🇦🇷',
      culture: 'Fuerte desarrollo de proyectos de robótica escolar lúdica y videojuegos educativos independientes. Las escuelas estatales usan herramientas de programación visual vinculadas con el cuidado ambiental y la revalorización de residuos (Escuelas Verdes).',
      fact: '¡Los docentes de educación tecnológica articulan talleres donde programan circuitos didácticos para medir la humedad de plantas recicladas!',
      color: 'from-sky-100 to-sky-200 dark:from-sky-950/20 dark:to-sky-900/10 border-sky-200 dark:border-sky-800'
    },
    'Japón': {
      flag: '🇯🇵',
      culture: 'Enfoque temprano en la robótica asistencial escolar y la inteligencia artificial para automatizar flujos diarios. Fuerte adopción del pensamiento de diseño tecnológico para gamificar el cuidado del aula y el juego cooperativo.',
      fact: 'Los alumnos programan pequeños mini-robots recolectores autónomos para clasificar de manera interactiva insumos de papelería al finalizar la clase.',
      color: 'from-red-50 to-red-100 dark:from-red-950/10 dark:to-red-900/10 border-red-200 dark:border-red-900/30'
    },
    'Nigeria': {
      flag: '🇳🇬',
      culture: 'Foco en la movilidad digital y el desarrollo ágil (mobile learning). A través de microcontroladores de bajo consumo e interfaces móviles simplificadas, los estudiantes crean herramientas de soporte directo para su comunidad agraria y sistemas de alertas escolares.',
      fact: 'Uso generalizado de microcursos offline integrados por mensajería SMS automatizada para educar de forma robusta e inteligente.',
      color: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800'
    },
    'Brasil': {
      flag: '🇧🇷',
      culture: 'Cultura "hacerlo tú mismo" (Cultura Maker) y uso masivo de software de diseño libre y laboratorios FabLabs escolares. Integración de música interactiva, micro-sensores y arte digital expresivo para plasmar la biodiversidad local.',
      fact: '¡Crean orquestas musicales interactivas conectando bananas, hojas de plantas y agua a placas controladoras programadas con computadoras!',
      color: 'from-yellow-105 to-green-105 dark:from-yellow-950/10 dark:to-green-950/10 border-yellow-200/50 dark:border-green-800/30'
    },
    'Alemania': {
      flag: '🇩🇪',
      culture: 'Sistemas rigurosos orientados al aprendizaje del Internet de las Cosas (IoT), automatización solar fotovoltaica escolar y protección de la privacidad cibernética (Criptografía educativa elemental desde edad escolar).',
      fact: 'Simulan maquetas a escala de casas domóticas eco-eficientes regulando el gasto eléctrico de ventiladores basándose en la temperatura ambiente real.',
      color: 'from-amber-100 to-rose-100 dark:from-amber-950/10 dark:to-rose-950/10 border-neutral-200 dark:border-neutral-800'
    }
  };

  const triviaQuestions = [
    {
      q: '¿Qué tecnología de bajo coste usan en Brasil para armar pianos frutales y música interactiva mediante computadoras en ferias de tecnología escolar?',
      opts: ['Tornillos tradicionales con cables de alimentación pesados', 'Placas electrónicas controladoras de contacto táctil (Maker plates)', 'Maquinaria de soldador industrial con gas'],
      correct: 1,
      why: 'Las placas controladoras USB permiten transformar cualquier elemento conductor (frutas, plantas, masilla escolar) en teclas interactivas seguras.'
    },
    {
      q: 'En las escuelas técnicas de Alemania, ¿en qué concepto enfocado en el ahorro energético lúdico suelen focalizarse los kits escolares?',
      opts: ['Casas y maquetas eco-eficientes automatizadas para regular recursos (Internet de las Cosas)', 'Uso de carbón fósil para el calentamiento directo de prensas escolares', 'Pantallas de televisores gigantes sin control de encendido'],
      correct: 0,
      why: 'Los maquetados de casas conectadas por sensores solares educan a los alumnos en modelado tecnológico para la sostenibilidad.'
    },
    {
      q: '¿Cuál es una característica distintiva del mobile-learning masivo de bajo consumo implementado en Nigeria?',
      opts: ['Auriculares de realidad virtual exclusivos para cada hogar sin internet', 'Uso inteligente de plataformas offline y microcursos interactivos por mensaje SMS', 'Obligar a usar consolas de alta fidelidad que demandan cables de fibra óptica permanentes'],
      correct: 1,
      why: 'El SMS y las web-apps ligeras permiten mantener la conectividad pedagógica y superar de manera creativa la brecha de infraestructura.'
    }
  ];

  // Drag and drop usability pattern
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>(activityToEdit?.attachedFiles || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsAttachedFile = (file: File): Promise<AttachedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result as string,
        });
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList) => {
    const promises = Array.from(files).map(f => readFileAsAttachedFile(f));
    try {
      const results = await Promise.all(promises);
      
      // Warn user if size is large for localStorage
      const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 8 * 1024 * 1024) {
        alert('Aviso: Has seleccionado archivos pesados. Superar el límite del navegador (+15MB total de almacenamiento local) podría limitar la persistencia local. Recomendamos usar un enlace de Google Drive o similar para videos muy largos.');
      }
      
      setAttachedFiles(prev => [...prev, ...results]);
    } catch (err) {
      alert('Hubo un inconveniente al cargar uno de los archivos.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !materia || !tema || !descripcion) {
      alert('Por favor completa todos los campos requeridos (*).');
      return;
    }

    // Split tags
    const tags = tagsInput
      ? tagsInput.split(',').map(t => t.trim().replace('#', '')).filter(Boolean)
      : ['Pedagogía'];

    if (activityToEdit && onUpdateActivity) {
      onUpdateActivity({
        ...activityToEdit,
        studentId,
        materia,
        tema,
        descripcion,
        prioridad,
        estado,
        recursoClave,
        tags,
        enlaceUrl: enlaceUrl.trim() || undefined,
        enlaceTitulo: enlaceTitulo.trim() || undefined,
        attachedFiles,
      });
      alert('Planificación escolar modificada con éxito.');
    } else {
      onAddActivity({
        studentId,
        materia,
        tema,
        descripcion,
        prioridad,
        estado,
        recursoClave,
        tags,
        enlaceUrl: enlaceUrl.trim() || undefined,
        enlaceTitulo: enlaceTitulo.trim() || undefined,
        attachedFiles,
      });
      alert('Planificación escolar guardada con éxito.');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Box */}
      <div className={`relative bg-white dark:bg-inverse-surface rounded-3xl p-6 md:p-8 shadow-2xl w-full z-10 max-h-[95vh] overflow-y-auto space-y-6 transition-all duration-300 ${activeResourceForTesting ? 'max-w-6xl' : 'max-w-2xl'}`}>

        <div className="flex items-center justify-between border-b pb-4 border-outline-variant/30">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-primary-container text-white rounded-xl">
              <span className="material-symbols-outlined text-[24px]">edit_calendar</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-lg text-on-surface font-bold leading-tight">
                {activityToEdit ? 'Modificar Planificación' : 'Nueva Planificación Semanal'}
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">Asignar actividades y recursos adaptados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface hover:bg-surface-container rounded-full p-1.5 transition-colors"
          >
            close
          </button>
        </div>

        <div className={activeResourceForTesting ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : ""}>
          {/* Left Column: Form */}
          <div className={activeResourceForTesting ? "lg:col-span-5 lg:border-r border-outline-variant/30 lg:pr-5 max-h-[75vh] overflow-y-auto space-y-4" : ""}>
            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student selection */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Alumno Destinatario *</label>
              <select
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3 focus:ring-1 focus:ring-primary outline-none transition-colors"
                required
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.apellido}, {s.nombre} ({s.contexto})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject option */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Asignatura / Materia *</label>
              <select
                value={materia}
                onChange={e => setMateria(e.target.value)}
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3 focus:ring-1 focus:ring-primary outline-none"
                required
              >
                <option value="Matemática">Matemática</option>
                <option value="Prácticas del Lenguaje">Prácticas del Lenguaje</option>
                <option value="Ciencias Naturales">Ciencias Naturales</option>
                <option value="Ciencias Sociales">Ciencias Sociales</option>
                <option value="Escuelas Verdes">Escuelas Verdes</option>
                <option value="Expresión Artística">Expresión Artística (Plástica/Música)</option>
                <option value="CUENTOS">CUENTOS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Prioridad de Abordaje</label>
              <select
                value={prioridad}
                onChange={e => setPrioridad(e.target.value as 'Alta' | 'Media' | 'Baja')}
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Estado Actividad</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as 'EN PROGRESO' | 'PENDIENTE' | 'INTEGRADOR')}
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2"
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="EN PROGRESO">EN PROGRESO</option>
                <option value="INTEGRADOR">PLAN INTEGRAL</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Recurso Clave Destacado</label>
              <input
                type="text"
                value={recursoClave}
                onChange={e => handleRecursoClaveChange(e.target.value)}
                placeholder="Ej: Fichas adaptadas con lanas o https://..."
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3 focus:ring-1 focus:ring-primary outline-none"
              />

              {/* Enhanced Catalog of pedagogical resources */}
              <div className="mt-2 bg-neutral-50 dark:bg-zinc-800/50 border border-outline-variant/40 rounded-2xl p-3 space-y-3">
                <div className="flex justify-between items-center border-b pb-2 border-outline-variant/30">
                  <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">local_library</span>
                    Catálogo de Recursos Escolares
                  </span>
                  
                  {/* Tab Selector */}
                  <div className="flex bg-zinc-200/55 dark:bg-zinc-700/60 border border-outline-variant/20 rounded-lg p-0.5 self-center">
                    <button
                      type="button"
                      onClick={() => setResourceTab('interactivos')}
                      className={`px-2 py-0.5 text-[9px] rounded font-extrabold transition-all cursor-pointer select-none ${
                        resourceTab === 'interactivos' 
                          ? 'bg-primary text-white shadow-xs' 
                          : 'text-neutral-500 hover:bg-neutral-200/50'
                      }`}
                    >
                      🎮 Interactivos
                    </button>
                    <button
                      type="button"
                      onClick={() => setResourceTab('externos')}
                      className={`px-2 py-0.5 text-[9px] rounded font-extrabold transition-all cursor-pointer select-none ${
                        resourceTab === 'externos' 
                          ? 'bg-primary text-white shadow-xs' 
                          : 'text-neutral-500 hover:bg-neutral-200/50'
                      }`}
                    >
                      🌐 Externos ({DEFAULT_RESOURCES.slice(4).length + customExternalResources.length})
                    </button>
                  </div>
                </div>

                {resourceTab === 'interactivos' ? (
                  <div className="flex flex-wrap gap-1">
                    {DEFAULT_RESOURCES.slice(0, 5).map(res => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => {
                          setRecursoClave(res.titulo);
                        }}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer border ${
                          recursoClave.toLowerCase() === res.titulo.toLowerCase()
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-primary/5 hover:bg-primary/10 text-primary border-primary/15'
                        }`}
                      >
                        {res.titulo.replace(' Dinámica', '').replace(' de Multiplicación', '')}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {/* Predefined External Link Resources */}
                      {DEFAULT_RESOURCES.slice(4).map(res => (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => {
                            setRecursoClave(res.titulo);
                            if (res.url) {
                              setEnlaceUrl(res.url);
                              setEnlaceTitulo(res.titulo);
                            }
                          }}
                          className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer border flex items-center gap-1 ${
                            recursoClave.toLowerCase() === res.titulo.toLowerCase()
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-emerald-55/40 hover:bg-emerald-100/50 text-emerald-800 border-emerald-300/15'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[10px]">share</span>
                          <span>{res.titulo.length > 25 ? res.titulo.slice(0, 25) + '...' : res.titulo}</span>
                        </button>
                      ))}

                      {/* Custom External Resources */}
                      {customExternalResources.map(res => (
                        <div
                          key={res.id}
                          onClick={() => {
                            setRecursoClave(res.titulo);
                            if (res.url) {
                              setEnlaceUrl(res.url);
                              setEnlaceTitulo(res.titulo);
                            }
                          }}
                          className={`text-[9px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer border flex items-center gap-1.5 select-none relative ${
                            recursoClave.toLowerCase() === res.titulo.toLowerCase()
                              ? 'bg-purple-600 text-white border-purple-750 shadow-xs'
                              : 'bg-purple-55/40 hover:bg-purple-100/55 text-purple-850 border-purple-300/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[10px]">cloud_sync</span>
                          <span>{res.titulo.length > 23 ? res.titulo.slice(0, 23) + '...' : res.titulo}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomExternalResource(res.id);
                            }}
                            className="w-3.5 h-3.5 rounded-full hover:bg-black/10 flex items-center justify-center text-red-500 hover:text-red-700 active:scale-90"
                            title="Eliminar recurso personalizado"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Form to Add New External Resource */}
                    <div className="bg-white dark:bg-zinc-900/60 rounded-xl p-2.5 border border-outline-variant/30 text-left space-y-2">
                      <p className="text-[10px] font-extrabold text-on-surface-variant flex items-center gap-1 leading-none">
                        <span className="material-symbols-outlined text-xs text-primary">add_circle</span>
                        Nuevo Recurso Externo / Vídeo / Carpeta Drive
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[7.5px] font-extrabold text-zinc-500 uppercase">Nombre / Título (*)</span>
                          <input
                            type="text"
                            placeholder="Ej: Vídeo Tutorial Alfabetización"
                            value={newExtTitle}
                            onChange={e => setNewExtTitle(e.target.value)}
                            className="rounded-lg border border-outline-variant bg-surface text-[9px] py-1 px-2 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[7.5px] font-extrabold text-zinc-500 uppercase">Enlace Web URL (*)</span>
                          <input
                            type="text"
                            placeholder="Ej: https://youtube.com/... o drive.google.com/..."
                            value={newExtUrl}
                            onChange={e => setNewExtUrl(e.target.value)}
                            className="rounded-lg border border-outline-variant bg-surface text-[9px] py-1 px-2 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[7.5px] font-extrabold text-zinc-500 uppercase">Enlace de Imagen (Opcional)</span>
                          <input
                            type="text"
                            placeholder="Ej: https://imagen.bue.edu.ar/..."
                            value={newExtImgUrl}
                            onChange={e => setNewExtImgUrl(e.target.value)}
                            className="rounded-lg border border-outline-variant bg-surface text-[9px] py-1 px-2 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[7.5px] font-extrabold text-zinc-500 uppercase">Subir Foto o Archivo local</span>
                          <label className="rounded-lg border border-dashed border-outline-variant hover:border-primary bg-surface text-[9px] py-1 px-2 text-center text-on-surface-variant cursor-pointer transition-colors hover:text-primary flex items-center justify-center gap-1 h-[24px]">
                            <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                            <span className="truncate">{newExtImgUrl ? '¡Imagen Cargada!' : 'Seleccionar foto...'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setNewExtImgUrl(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-1.5 items-end justify-between">
                        <div className="flex flex-col gap-0.5 flex-1">
                          <span className="text-[7.5px] font-extrabold text-zinc-500 uppercase">Descripción o notas rápidas</span>
                          <input
                            type="text"
                            placeholder="Ej: Video educativo complementario con manualidades imprimibles."
                            value={newExtDesc}
                            onChange={e => setNewExtDesc(e.target.value)}
                            className="rounded-lg border border-outline-variant bg-surface text-[9px] py-1 px-2 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newExtTitle || !newExtUrl) return;
                            onAddCustomExternalResource(newExtTitle, newExtUrl, newExtDesc, newExtImgUrl);
                            setNewExtTitle('');
                            setNewExtUrl('');
                            setNewExtDesc('');
                            setNewExtImgUrl('');
                          }}
                          disabled={!newExtTitle || !newExtUrl}
                          className="bg-primary hover:bg-primary/90 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-0.5 shrink-0"
                        >
                          <span className="material-symbols-outlined text-[10px]">save</span>
                          <span>Guardar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart resource launcher detector */}
              {(() => {
                const txt = recursoClave.trim().toLowerCase();
                if (!txt) return null;

                // Find matching resource by title or URL
                const matchedRes = [
                  ...DEFAULT_RESOURCES,
                  ...customExternalResources
                ].find(r => 
                  txt.includes(r.titulo.toLowerCase()) || 
                  r.titulo.toLowerCase().includes(txt) ||
                  (r.url && txt.includes(r.url.toLowerCase()))
                );

                if (matchedRes) {
                  const isInteractiveSim = ['res-1', 'res-2', 'res-3', 'res-4', 'res-5'].includes(matchedRes.id);
                  
                  if (isInteractiveSim) {
                    return (
                      <div className="mt-2 flex items-center justify-between bg-primary/5 p-2 rounded-xl border border-primary/20 animate-fade-in shadow-xs">
                        <span className="flex items-center gap-1.5 text-[10px] text-primary font-bold">
                          <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                          <span>Interactiva: {matchedRes.titulo}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveResourceForTesting(matchedRes)}
                          className="px-2.5 py-1 bg-primary hover:bg-primary/95 text-white text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
                        >
                          <span className="material-symbols-outlined text-[13px]">play_circle</span>
                          <span>Abrir interactivo</span>
                        </button>
                      </div>
                    );
                  } else if (matchedRes.url) {
                    return (
                      <div className="mt-2 flex flex-col bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/20 animate-fade-in shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                            <span className="material-symbols-outlined text-[15px]">public</span>
                            <span>Recurso Externo: {matchedRes.titulo}</span>
                          </span>
                          <a
                            href={matchedRes.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 shrink-0"
                          >
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                            <span>Abrir Recurso</span>
                          </a>
                        </div>
                        {matchedRes.descripcion && (
                          <p className="text-[9px] text-zinc-500 italic mt-1 leading-normal">
                            {matchedRes.descripcion}
                          </p>
                        )}
                      </div>
                    );
                  }
                }
                return null;
              })()}

              {/* Fallback generic External URLs / Google Drive Detector */}
              {(() => {
                const urlRegex = /((?:https?:\/\/|www\.)[^\s()<>]+|(?:gemini|drive)\.google\.com\/[^\s()<>]+)/i;
                const urlMatch = recursoClave.match(urlRegex);
                if (urlMatch) {
                  let detectedUrl = urlMatch[0];
                  if (!/^https?:\/\//i.test(detectedUrl)) {
                    detectedUrl = 'https://' + detectedUrl;
                  }
                  
                  // Avoid showing duplicate card if already captured by matchedRes
                  const txt = recursoClave.toLowerCase();
                  const alreadyMatched = [...DEFAULT_RESOURCES, ...customExternalResources].some(
                    r => r.url && txt.includes(r.url.toLowerCase())
                  );
                  if (alreadyMatched) return null;

                  return (
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 animate-fade-in shadow-xs">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] animate-pulse">link</span>
                        <span>Enlace detectado. ¡Se abrirá automáticamente!</span>
                      </span>
                      <a
                        href={detectedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-emerald-700 dark:hover:text-emerald-300 font-bold sm:ml-auto flex items-center gap-0.5 shrink-0"
                      >
                        [Abrir recurso didáctico de nuevo]
                        <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                      </a>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Tema / Título Pedagógico *</label>
            <input
              type="text"
              value={tema}
              onChange={e => setTema(e.target.value)}
              placeholder="Ej: Reconocimiento de fonemas o algoritmo pitagórico lúdico"
              className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3 focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Descripción / Secuencia de Actividades *</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Describe detalladamente los pasos pedagógicos para el abordaje curricular domiciliario u hospitalario..."
              rows={3}
              className="rounded-xl border border-outline-variant bg-surface text-xs py-2.5 px-3 focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant">Etiquetas / Tags (separados por coma)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Ej: Waldorf, Alfabetizacion, EscuelasVerdes"
              className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-green-600">add_to_drive</span>
                Enlace Web / Google Drive de la Actividad (Opcional)
              </label>
              <input
                type="url"
                value={enlaceUrl}
                onChange={e => setEnlaceUrl(e.target.value)}
                placeholder="Ej: https://drive.google.com/file/d/... o https://site.com"
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3 focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Nombre para mostrar del Enlace (Opcional)</label>
              <input
                type="text"
                value={enlaceTitulo}
                onChange={e => setEnlaceTitulo(e.target.value)}
                placeholder="Ej: Ficha de actividades de Google Drive"
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3 focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Google Drive Tip Banner */}
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <span className="material-symbols-outlined text-lg">lightbulb</span>
              <span className="text-xs font-bold uppercase tracking-wider">Tip de Almacenamiento Eficiente</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>¡La mejor opción para archivos pesados!</strong> En lugar de subir videos o imágenes directamente (que saturan la memoria local de tu navegador), te recomendamos guardarlos en tu <strong>Google Drive</strong> y pegar el enlace arriba.
            </p>
            <ul className="text-[11px] text-on-surface-variant space-y-1 list-disc list-inside pl-1">
              <li>Mantiene la aplicación súper fluida y rápida en cualquier computadora.</li>
              <li>Si enlazas una <strong>imagen</strong> o <strong>documento</strong> compartido en Drive, la planilla generará una <strong>vista previa automática</strong> en la ficha de planificación.</li>
              <li><em>Nota: Asegúrate de que el archivo en Google Drive tenga el acceso configurado como <strong>"Cualquier persona con el enlace"</strong> para que se cargue la previsualización.</em></li>
            </ul>
          </div>

          {/* Usability Pattern - File Upload drag/drop & select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Adjuntar Ficha de Trabajo / Plantilla de Actividad</label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant bg-surface hover:border-primary/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="material-symbols-outlined text-[32px] text-outline">
                cloud_upload
              </span>
              <p className="text-xs font-bold text-on-surface">
                Arrastra un video, documento, imagen o cualquier formato o <span className="text-primary hover:underline">haz clic para examinar</span>
              </p>
              <p className="text-[10px] text-outline">Formatos permitidos: Todos los formatos (MP4/Videos, PDF, Imagen, Word, Excel, etc.)</p>
            </div>

            {attachedFiles.length > 0 && (
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-2">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">task</span>
                  Archivos Adjuntos Guardados en la Planificación ({attachedFiles.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {attachedFiles.map((fn, idx) => {
                    let iconName = 'insert_drive_file';
                    if (fn.type.startsWith('image/')) iconName = 'image';
                    else if (fn.type.startsWith('video/')) iconName = 'videocam';
                    else if (fn.type === 'application/pdf' || fn.name.toLowerCase().endsWith('.pdf')) iconName = 'picture_as_pdf';
                    else if (fn.name.toLowerCase().endsWith('.doc') || fn.name.toLowerCase().endsWith('.docx')) iconName = 'article';
                    else if (fn.name.toLowerCase().endsWith('.xls') || fn.name.toLowerCase().endsWith('.xlsx')) iconName = 'table_chart';

                    return (
                      <div key={idx} className="flex items-center gap-1.5 bg-background border px-2.5 py-1.5 rounded-lg text-[10px] font-mono leading-tight shadow-sm">
                        <span className="material-symbols-outlined text-sm text-primary">{iconName}</span>
                        <span className="max-w-[150px] truncate font-medium text-on-surface">{fn.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachedFiles(attachedFiles.filter((_, i) => i !== idx));
                          }}
                          className="material-symbols-outlined text-[14px] text-error hover:scale-110 ml-1.5 cursor-pointer flex items-center justify-center bg-error/5 p-0.5 rounded-full"
                          title="Quitar archivo"
                        >
                          close
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 text-xs pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-surface-container-high rounded-full font-bold text-on-surface-variant"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 shadow-sm cursor-pointer"
            >
              {activityToEdit ? 'Guardar Cambios' : 'Guardar Planificación'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Interactive Player Side */}
      {activeResourceForTesting && (
        <div className="lg:col-span-7 lg:pl-3 max-h-[75vh] overflow-y-auto space-y-5 text-left border-t lg:border-t-0 lg:border-l border-outline-variant/30 pt-5 lg:pt-0">
          <div className="flex justify-between items-start border-b pb-3 border-outline-variant/30">
            <div>
              <h4 className="font-extrabold text-sm text-primary uppercase flex items-center gap-1.5 leading-none">
                <span className="material-symbols-outlined text-[17px]">smart_toy</span>
                <span>Simulador: {activeResourceForTesting.titulo}</span>
              </h4>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Interactúa libremente. El formulario de la izquierda conservará tu progreso intacto.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveResourceForTesting(null)}
              className="px-2 py-1 text-[10px] border border-zinc-300 rounded-lg bg-zinc-50 hover:bg-neutral-105 text-zinc-700 font-extrabold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-xs">assignment_return</span>
              <span>Cerrar Juguete</span>
            </button>
          </div>

          {/* Resource 1: Tabla Pitagórica */}
          {activeResourceForTesting.id === 'res-1' && (
            <div className="space-y-4 rounded-2xl border p-4 bg-neutral-55/40">
              <div className="flex justify-between items-center bg-white border p-3 rounded-xl gap-2">
                <div>
                  <h5 className="font-bold text-xs text-neutral-700 leading-tight">Visualizador de Tabla Pitagórica</h5>
                  <p className="text-[9px] text-neutral-500">Mueve el cursor o cambia al modo de respuestas en blanco.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPracticeMode(!practiceMode);
                    resetPractice();
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                    practiceMode 
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 border hover:bg-neutral-200'
                  }`}
                >
                  {practiceMode ? 'Modo Explorador' : 'Activar Práctica'}
                </button>
              </div>

              <div className="overflow-x-auto p-1.5 bg-white rounded-xl border">
                <table className="mx-auto border-separate border-spacing-0.5">
                  <tbody>
                    <tr>
                      <td className="w-7 h-7 rounded bg-zinc-100 text-neutral-800 text-center font-bold text-[9px] select-none">X</td>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(c => (
                        <td
                          key={c}
                          onMouseEnter={() => setSelectedCol(c)}
                          onMouseLeave={() => setSelectedCol(null)}
                          onClick={() => setSelectedCol(c)}
                          className={`w-7 h-7 rounded text-center font-bold text-[9px] cursor-pointer transition-colors select-none ${
                            selectedCol === c ? 'bg-primary text-white' : 'bg-primary-container/10 text-primary hover:bg-primary-container/20'
                          }`}
                        >
                          {c}
                        </td>
                      ))}
                    </tr>

                    {Array.from({ length: 10 }, (_, i) => i + 1).map(r => (
                      <tr key={r}>
                        <td
                          onMouseEnter={() => setSelectedRow(r)}
                          onMouseLeave={() => setSelectedRow(null)}
                          onClick={() => setSelectedRow(r)}
                          className={`w-7 h-7 rounded text-center font-bold text-[9px] cursor-pointer transition-colors select-none ${
                            selectedRow === r ? 'bg-primary text-white' : 'bg-primary-container/10 text-primary hover:bg-primary-container/20'
                          }`}
                        >
                          {r}
                        </td>

                        {Array.from({ length: 10 }, (_, i) => i + 1).map(c => {
                          const isHighlighted = selectedRow === r || selectedCol === c;
                          const isIntersection = selectedRow === r && selectedCol === c;
                          const isBlank = practiceMode && isCellBlanked(r, c);
                          const cellValue = r * c;

                          return (
                            <td
                              key={c}
                              onClick={() => {
                                setSelectedRow(r);
                                setSelectedCol(c);
                              }}
                              className={`w-7 h-7 rounded text-center text-[9px] font-medium transition-all relative select-none ${
                                isIntersection ? 'bg-secondary text-white font-bold scale-105 shadow' :
                                isHighlighted ? 'bg-amber-100 text-amber-900 border border-amber-300/10' :
                                'bg-white text-neutral-700 border border-neutral-200'
                              }`}
                            >
                              {isBlank ? (
                                <input
                                  type="text"
                                  maxLength={3}
                                  value={practiceAnswers[`${r}-${c}`] || ''}
                                  onChange={(e) => handleAnswerChange(r, c, e.target.value)}
                                  disabled={practiceChecking}
                                  className={`w-full h-full rounded text-center font-bold outline-none border transition-colors ${
                                    practiceChecking
                                      ? (parseInt(practiceAnswers[`${r}-${c}`]) === cellValue
                                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                                        : 'bg-red-100 border-red-500 text-red-800')
                                      : 'bg-purple-50 focus:bg-white text-purple-950 border-purple-200'
                                  }`}
                                />
                              ) : (
                                cellValue
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {practiceMode && (
                <div className="flex gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={resetPractice}
                    className="px-2.5 py-1 rounded bg-white border text-[10px] font-extrabold hover:bg-neutral-100 cursor-pointer"
                  >
                    Reiniciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeChecking(true)}
                    className="px-3 py-1 rounded bg-emerald-600 text-white text-[10px] font-extrabold hover:bg-emerald-700 shadow-sm cursor-pointer"
                  >
                    Corregir Respuestas
                  </button>
                </div>
              )}

              {selectedRow && selectedCol && (
                <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-1">
                  <p className="font-bold text-[10px] text-zinc-500">Operación Desglosada:</p>
                  <p className="text-sm font-bold text-primary">
                    {selectedRow} veces {selectedCol} = <span className="text-secondary">{selectedRow * selectedCol}</span>
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400">
                    {Array(selectedRow).fill(selectedCol).join(' + ')} = {selectedRow * selectedCol}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resource 2: Círculo Waldorf */}
          {activeResourceForTesting.id === 'res-2' && (
            <div className="space-y-4 rounded-2xl border p-4 bg-neutral-55/40">
              <div className="flex justify-between items-center bg-white border p-3 rounded-xl gap-2">
                <div>
                  <h5 className="font-bold text-xs text-[#795548] leading-tight">Hilado Geométrico Waldorf</h5>
                  <p className="text-[9px] text-neutral-500">Visualiza figuras uniendo dígitos finales.</p>
                </div>
                <select
                  value={multiplier}
                  onChange={(e) => {
                    setMultiplier(parseInt(e.target.value));
                    setStepIndex(0);
                    setIsPlaying(false);
                  }}
                  className="border text-[10px] py-1 px-1.5 rounded-lg bg-white outline-none font-bold"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 2).map(n => (
                    <option key={n} value={n}>Tabla del {n}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-xl p-4 border flex justify-center items-center relative w-full h-[220px]">
                <svg width="180" height="180" className="overflow-visible">
                  <circle cx="90" cy="90" r="80" fill="none" stroke="#d7ccc8" strokeWidth="4" />
                  <circle cx="90" cy="90" r="74" fill="none" stroke="#f1f1f1" strokeWidth="1" strokeDasharray="3" />

                  <path
                    d={(() => {
                      let p = '';
                      const getCoords = (pin: number) => {
                        const angle = (pin * 36 - 90) * (Math.PI / 180);
                        const r = 68; 
                        const cx = 90;
                        const cy = 90;
                        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
                      };
                      for (let i = 0; i <= stepIndex; i++) {
                        const lastDigit = (multiplier * i) % 10;
                        const coords = getCoords(lastDigit);
                        if (i === 0) p += `M ${coords.x} ${coords.y}`;
                        else p += ` L ${coords.x} ${coords.y}`;
                      }
                      return p;
                    })()}
                    fill="none"
                    stroke={yarnColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />

                  {Array.from({ length: 10 }).map((_, pIdx) => {
                    const angle = (pIdx * 36 - 90) * (Math.PI / 180);
                    const r = 68; 
                    const cx = 90;
                    const cy = 90;
                    const rx = cx + r * Math.cos(angle);
                    const ry = cy + r * Math.sin(angle);
                    const isCurrentActive = waldorfSteps[stepIndex]?.lastDigit === pIdx;

                    return (
                      <g key={pIdx}>
                        <circle
                          cx={rx}
                          cy={ry}
                          r={isCurrentActive ? '5' : '3'}
                          fill={isCurrentActive ? yarnColor : '#795548'}
                        />
                        <text
                          x={rx + (rx > 90 ? 9 : -9)}
                          y={ry + 3}
                          textAnchor="middle"
                          className={`text-[8.5px] font-extrabold ${isCurrentActive ? 'fill-primary font-black text-[10px]' : 'fill-zinc-500'}`}
                        >
                          {pIdx}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStepIndex(prev => (prev > 0 ? prev - 1 : 0));
                      setIsPlaying(false);
                    }}
                    className="w-6 h-6 rounded-full border bg-white text-zinc-600 flex items-center justify-center cursor-pointer hover:bg-neutral-100"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white cursor-pointer ${isPlaying ? 'bg-amber-600' : 'bg-primary'}`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStepIndex(prev => (prev < 10 ? prev + 1 : 0));
                      setIsPlaying(false);
                    }}
                    className="w-6 h-6 rounded-full border bg-white text-zinc-600 flex items-center justify-center cursor-pointer hover:bg-neutral-100"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border text-[9px] text-[#5d4037] font-mono h-24 overflow-y-auto">
                {waldorfSteps.map((step, idx) => (
                  <div key={idx} className={`flex justify-between px-1.5 py-0.5 rounded ${idx === stepIndex ? 'bg-amber-50 font-bold border border-amber-300/30' : ''}`}>
                    <span>{step.label} = {step.product}</span>
                    <span>Hebra al Clavo #{step.lastDigit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resource 3: Efemérides de 1810 */}
          {activeResourceForTesting.id === 'res-3' && (
            <div className="space-y-4 rounded-2xl border p-4 bg-neutral-55/40">
              <h5 className="font-bold text-xs uppercase text-zinc-500 leading-none">Personajes de Época Coloniales</h5>
              <div className="grid grid-cols-3 gap-1">
                {personajes.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCharacter(idx);
                      setCustomQuestion(p.adaptedPrompt);
                    }}
                    className={`p-1.5 border rounded-lg text-center text-[9px] font-bold transition-all cursor-pointer ${
                      selectedCharacter === idx
                        ? 'bg-primary/15 border-primary text-primary shadow-xs font-black'
                        : 'bg-white hover:bg-neutral-50 border-neutral-250'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-xl border p-4 space-y-3">
                <div className="flex gap-2.5 items-center">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-primary font-bold text-sm border border-sky-100">
                    {personajes[selectedCharacter].name[0]}
                  </div>
                  <div>
                    <h6 className="font-extrabold text-xs text-primary leading-tight">{personajes[selectedCharacter].name}</h6>
                    <span className="text-[8px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">Buenos Aires Colonial</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-900 italic font-medium p-3 rounded-lg text-center font-serif text-[11px] leading-relaxed">
                  “{personajes[selectedCharacter].pregon}”
                </div>

                <p className="text-[10.5px] text-neutral-600 leading-normal">
                  {personajes[selectedCharacter].desc}
                </p>
              </div>
            </div>
          )}

          {/* Resource 4: Manuel de Termofusión */}
          {activeResourceForTesting.id === 'res-4' && (
            <div className="space-y-4 rounded-2xl border p-4 bg-neutral-55/40">
              <h5 className="font-bold text-xs uppercase text-zinc-500 leading-none">Guía de Identificación de Polímeros</h5>
              <div className="grid grid-cols-3 gap-1">
                {Object.keys(PlasticsGuides).map((key) => {
                  const item = PlasticsGuides[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPlastic(key)}
                      className={`p-1.5 rounded-lg border text-center text-[9px] font-mono transition-all font-bold cursor-pointer ${
                        selectedPlastic === key
                          ? (item.safe
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow'
                            : 'bg-red-50 border-red-500 text-red-800 shadow')
                          : 'bg-white hover:bg-neutral-50'
                      }`}
                    >
                      #{item.num} {key}
                    </button>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl border p-3.5 space-y-2">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="font-bold text-xs">{PlasticsGuides[selectedPlastic]?.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${PlasticsGuides[selectedPlastic]?.safe ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/30' : 'bg-red-100 text-red-800 border border-red-300/30'}`}>
                    {PlasticsGuides[selectedPlastic]?.safe ? 'Material Seguro' : 'MATERIAL TÓXICO'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-700 leading-normal">{PlasticsGuides[selectedPlastic]?.description}</p>
                <div className="p-2 rounded border bg-zinc-50 text-[9px] font-mono space-y-0.5">
                  <div><strong>Punto Calorífico:</strong> {PlasticsGuides[selectedPlastic]?.temp}</div>
                  <div><strong>Gasificación / Humos:</strong> {PlasticsGuides[selectedPlastic]?.toxicity}</div>
                  <div className="text-zinc-500 leading-normal pt-1 border-t mt-1 font-sans"><strong>Por qué:</strong> {PlasticsGuides[selectedPlastic]?.reason}</div>
                </div>
              </div>

              <div className="bg-white border p-3 rounded-xl space-y-2">
                <h6 className="font-bold text-[9.5px] uppercase text-zinc-600 leading-none">Simulador de Protocolo Escolar Habilitador</h6>
                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                  {Object.keys(fusePracticeStatus).map(k => (
                    <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fusePracticeStatus[k]}
                        onChange={(e) => setFusePracticeStatus(prev => ({ ...prev, [k]: e.target.checked }))}
                        className="rounded border-zinc-300 text-emerald-600"
                      />
                      <span className="capitalize">{k === 'goggles' ? 'Anteojos gafa' : k === 'gloves' ? 'Guantes horno' : k === 'paper' ? 'Papel manteca' : k === 'ventilation' ? 'Ventilador / Puerta' : 'Plástico Apto'}</span>
                    </label>
                  ))}
                </div>
                <div className={`p-1.5 rounded text-center font-bold text-[9px] border transition-colors ${isSafetyPass ? 'bg-emerald-150 border-emerald-350 text-emerald-850' : 'bg-amber-100 border-amber-200 text-amber-800'}`}>
                  {isSafetyPass ? '✅ PRENSA LIBERADA PARA ABORDAR EL PROYECTO CON ALUMNOS' : '⚠️ Sigue preparando las capas del kit de seguridad.'}
                </div>
              </div>
            </div>
          )}

          {/* Resource 5: Mundial Digital 2026 */}
          {activeResourceForTesting.id === 'res-5' && (
            <div className="space-y-4 rounded-2xl border p-4 bg-neutral-55/40">
              <div className="flex justify-between items-center bg-white border px-3 py-1.5 rounded-xl gap-2">
                <h5 className="font-bold text-xs text-primary leading-tight">Mundial Digital: Cultura de Tecnología</h5>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMundialTab('home')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${mundialTab === 'home' ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 hover:bg-neutral-200 text-zinc-700'}`}
                  >
                    Países
                  </button>
                  <button
                    type="button"
                    onClick={() => setMundialTab('juga')}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${mundialTab === 'juga' ? 'bg-primary text-white shadow-xs' : 'bg-neutral-100 hover:bg-neutral-200 text-zinc-700'}`}
                  >
                    Trivia
                  </button>
                </div>
              </div>

              {mundialTab === 'home' ? (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-500">Selecciona el grupo mundial para indagar:</p>
                  <div className="grid grid-cols-5 gap-1">
                    {Object.keys(p_digitales).map(cntry => (
                      <button
                        key={cntry}
                        type="button"
                        onClick={() => setSelectedCountry(cntry)}
                        className={`p-1 border rounded-lg text-center text-[10px] transition-all cursor-pointer ${selectedCountry === cntry ? 'bg-primary/10 border-primary font-bold' : 'bg-white'}`}
                      >
                        <div className="text-sm">{p_digitales[cntry]?.flag}</div>
                        <div className="truncate text-[7.5px] font-bold">{cntry}</div>
                      </button>
                    ))}
                  </div>

                  <div className={`p-3 rounded-xl border bg-gradient-to-br ${p_digitales[selectedCountry]?.color}`}>
                    <div className="font-bold text-[11px] mb-1 flex items-center gap-1">
                      <span>{p_digitales[selectedCountry]?.flag}</span>
                      <span>{selectedCountry}</span>
                    </div>
                    <p className="text-[10px] text-neutral-700 leading-normal">{p_digitales[selectedCountry]?.culture}</p>
                    <p className="text-[9px] text-[#33691e] font-extrabold italic mt-1 font-mono">Curiosidad: {p_digitales[selectedCountry]?.fact}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-xl border">
                  {!triviaCompleted ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-[9px] font-bold font-mono text-zinc-400 border-b pb-0.5">
                         <span>Pregunta {triviaIndex + 1} de {triviaQuestions.length}</span>
                         <span>Puntaje: {triviaScore} aciertos</span>
                      </div>
                      <p className="font-extrabold text-[10.5px] leading-relaxed text-zinc-805">{triviaQuestions[triviaIndex]?.q}</p>
                      <div className="space-y-1">
                        {triviaQuestions[triviaIndex]?.opts.map((opt, oIdx) => {
                          const isSelected = triviaSelectedAnswer === oIdx;
                          const isReview = triviaSelectedAnswer !== null;
                          const isCorrect = triviaQuestions[triviaIndex]?.correct === oIdx;

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                if (triviaSelectedAnswer !== null) return;
                                setTriviaSelectedAnswer(oIdx);
                                if (oIdx === triviaQuestions[triviaIndex]?.correct) {
                                  setTriviaScore(prev => prev + 1);
                                }
                              }}
                              className={`w-full p-2 text-left border rounded-lg text-[9.5px] font-medium transition-all ${
                                isSelected
                                  ? (isCorrect ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-red-50 border-red-500 font-bold')
                                  : (isReview && isCorrect ? 'bg-emerald-50 border-emerald-500 font-medium' : 'bg-white hover:bg-zinc-50')
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {triviaSelectedAnswer !== null && (
                        <div className="mt-2 text-[9px] p-2 rounded bg-zinc-50 text-zinc-650 font-mono leading-relaxed border">
                          <div><strong>{triviaSelectedAnswer === triviaQuestions[triviaIndex]?.correct ? '⚽ ¡BOLA DE GOL! Muy bien contestado.' : '❌ REBOTÓ AFUERA...'}</strong></div>
                          <p className="mt-0.5">{triviaQuestions[triviaIndex]?.why}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setTriviaSelectedAnswer(null);
                              if (triviaIndex < triviaQuestions.length - 1) {
                                setTriviaIndex(prev => prev + 1);
                              } else {
                                setTriviaCompleted(true);
                              }
                            }}
                            className="mt-2.5 bg-primary text-white font-bold rounded px-2.5 py-1 text-[9px] ml-auto flex cursor-pointer"
                          >
                            Avanzar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-1">
                      <span className="material-symbols-outlined text-3xl text-amber-500">emoji_events</span>
                      <h5 className="font-bold text-xs text-neutral-800">¡Trivia Mundialista Concluida!</h5>
                      <p className="text-[10px] text-zinc-500">Has interactuado óptimamente desde el formulario.</p>
                      <p className="font-extrabold text-[11px] text-primary mt-1.5">Puntuación Final: {triviaScore} / {triviaQuestions.length} Goles</p>
                      <button
                        type="button"
                        onClick={() => {
                          setTriviaIndex(0);
                          setTriviaScore(0);
                          setTriviaSelectedAnswer(null);
                          setTriviaCompleted(false);
                        }}
                        className="px-3 py-1 border rounded-xl hover:bg-zinc-50 bg-white font-bold text-[9px] mt-2.5 cursor-pointer shadow-xs"
                      >
                        Intentar de Nuevo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
    </div>
    </div>
  );
};
