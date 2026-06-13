import React, { useState, useEffect, useRef } from 'react';
import { ResourceMaterial } from '../types';

interface ResourceViewerModalProps {
  resource: ResourceMaterial;
  onClose: () => void;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  resource,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'print'>('interactive');

  // PRINT FUNCTION
  const handlePrint = () => {
    window.print();
  };

  // ----- RESOURCE 1: TABLA PITAGÓRICA DINÁMICA -----
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceChecking, setPracticeChecking] = useState(false);

  // Generate blanked options for practice mode
  const isCellBlanked = (r: number, c: number): boolean => {
    // Blank out some numbers for practice
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

  // ----- RESOURCE 2: CÍRCULO WALDORF -----
  const [multiplier, setMultiplier] = useState<number>(3);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [yarnColor, setYarnColor] = useState<string>('#3b82f6'); // blue
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const waldorfSteps = Array.from({ length: 11 }, (_, i) => ({
    label: `${multiplier} x ${i}`,
    product: multiplier * i,
    lastDigit: (multiplier * i) % 10,
  }));

  // Coordinate math for 10-pin circle (radius 100, center at 120, 120)
  const getCoordinatesForPin = (pin: number) => {
    const angle = (pin * 36 - 90) * (Math.PI / 180);
    const r = 85; // circle radius
    const cx = 110;
    const cy = 110;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  useEffect(() => {
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

  useEffect(() => {
    // Pick yarn color depending on times table
    const colors = [
      '#ef4444', // 0/1 - red
      '#f97316', // 2 - orange
      '#3b82f6', // 3 - blue
      '#84cc16', // 4 - lime
      '#10b981', // 5 - emerald
      '#8b5cf6', // 6 - violet
      '#ec4899', // 7 - pink
      '#06b6d4', // 8 - cyan
      '#eab308'  // 9 - yellow
    ];
    setYarnColor(colors[multiplier % colors.length]);
  }, [multiplier]);


  // ----- RESOURCE 3: EFEMÉRIDES DE 1810 -----
  const [selectedCharacter, setSelectedCharacter] = useState<number>(0);
  const [customQuestion, setCustomQuestion] = useState<string>(
    '¿Cómo crees que el Aguatero transportaba el agua limpia desde el Río de la Plata?'
  );
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

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

  // ----- RESOURCE 4: MANUAL DE TERMOFUSIÓN -----
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

  // ----- RESOURCE 5: MUNDIAL DIGITAL 2026 -----
  const [mundialTab, setMundialTab] = useState<'home' | 'explora' | 'juga' | 'investiga'>('home');
  const [selectedCountry, setSelectedCountry] = useState<string>('Argentina');
  const [triviaIndex, setTriviaIndex] = useState<number>(0);
  const [triviaScore, setTriviaScore] = useState<number>(0);
  const [triviaSelectedAnswer, setTriviaSelectedAnswer] = useState<number | null>(null);
  const [triviaChecking, setTriviaChecking] = useState<boolean>(false);
  const [triviaCompleted, setTriviaCompleted] = useState<boolean>(false);
  const [userMundialNotes, setUserMundialNotes] = useState<string>('');

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
      color: 'from-yellow-100/40 to-green-100/45 dark:from-yellow-950/10 dark:to-green-950/10 border-yellow-200/50 dark:border-green-800/30'
    },
    'Alemania': {
      flag: '🇩🇪',
      culture: 'Sistemas rigurosos orientados al aprendizaje del Internet de las Cosas (IoT), automatización solar fotovoltaica escolar y protección de la privacidad cibernética (Criptografía educativa elemental desde edad escolar).',
      fact: 'Simulan maquetas a escala de casas domóticas eco-eficientes regulando el gasto eléctrico de ventiladores basándose en la temperatura ambiente real.',
      color: 'from-amber-100/30 to-rose-100/40 dark:from-amber-950/10 dark:to-rose-950/10 border-neutral-200 dark:border-neutral-800'
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md" onClick={onClose}></div>

      {/* Box */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-3xl p-5 md:p-8 shadow-2xl max-w-4xl w-full z-10 max-h-[92vh] overflow-y-auto space-y-6 border border-neutral-200/20">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-outline-variant/30 gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <span className="material-symbols-outlined text-[24px]">
                {resource.id === 'res-1' ? 'calculate' : 
                 resource.id === 'res-2' ? 'motion_photos_on' : 
                 resource.id === 'res-3' ? 'library_books' : 
                 resource.id === 'res-4' ? 'shield_with_heart' : 
                 resource.id === 'res-5' ? 'smart_toy' : 'language'}
              </span>
            </span>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                Recurso Pedagógico Habilitado
              </span>
              <h3 className="font-headline font-bold text-lg md:text-xl text-on-surface">
                {resource.titulo}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View selectors */}
            {['res-1', 'res-2', 'res-3', 'res-4', 'res-5'].includes(resource.id) && (
              <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full flex gap-1 border">
                <button
                  onClick={() => setActiveTab('interactive')}
                  className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 transition-all ${
                    activeTab === 'interactive' 
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">touch_app</span>
                  Interactive
                </button>
                <button
                  onClick={() => setActiveTab('print')}
                  className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 transition-all ${
                    activeTab === 'print' 
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Ficha Imprimible
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="material-symbols-outlined text-neutral-500 hover:bg-neutral-100 rounded-full p-1.5 transition-colors"
            >
              close
            </button>
          </div>
        </div>

        {/* ----- CONTENT PANELS ----- */}

        {/* RESOURCE 1: TABLA PITAGÓRICA INTERACTIVA */}
        {resource.id === 'res-1' && (
          <div className="space-y-6">
            {activeTab === 'interactive' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                <div className="md:col-span-8 space-y-4">
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-700">Exploración o Autoevaluación</h4>
                      <p className="text-xs text-neutral-500">Haz clic en los números de fila/columna para ver multiplicaciones. Haz clases lúdicas con tus alumnos.</p>
                    </div>
                    <button
                      onClick={() => {
                        setPracticeMode(!practiceMode);
                        resetPractice();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        practiceMode 
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border'
                      }`}
                    >
                      {practiceMode ? 'Modo Explorador' : 'Activar Modo Práctica'}
                    </button>
                  </div>

                  {/* Grid Table */}
                  <div className="overflow-x-auto p-1.5 bg-neutral-50 rounded-2xl border">
                    <table className="mx-auto border-separate border-spacing-1">
                      <tbody>
                        {/* Header Row */}
                        <tr>
                          <td className="w-8 h-8 rounded-lg bg-primary-container/20 text-neutral-800 text-center font-bold text-[11px]">X</td>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(c => (
                            <td
                              key={c}
                              onMouseEnter={() => setSelectedCol(c)}
                              onMouseLeave={() => setSelectedCol(null)}
                              onClick={() => setSelectedCol(c)}
                              className={`w-8 h-8 rounded-lg text-center font-bold text-[11px] cursor-pointer transition-colors ${
                                selectedCol === c ? 'bg-primary text-white' : 'bg-primary-container/10 text-primary hover:bg-primary-container/20'
                              }`}
                            >
                              {c}
                            </td>
                          ))}
                        </tr>

                        {/* Grid Rows */}
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(r => (
                          <tr key={r}>
                            {/* Row Index */}
                            <td
                              onMouseEnter={() => setSelectedRow(r)}
                              onMouseLeave={() => setSelectedRow(null)}
                              onClick={() => setSelectedRow(r)}
                              className={`w-8 h-8 rounded-lg text-center font-bold text-[11px] cursor-pointer transition-colors ${
                                selectedRow === r ? 'bg-primary text-white' : 'bg-primary-container/10 text-primary hover:bg-primary-container/20'
                              }`}
                            >
                              {r}
                            </td>

                            {/* Cells */}
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
                                  className={`w-8 h-8 rounded-lg text-center text-[11px] font-medium transition-all relative select-none ${
                                    isIntersection ? 'bg-secondary text-white font-bold scale-105 shadow' :
                                    isHighlighted ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/30' :
                                    'bg-white text-neutral-700 hover:bg-neutral-100 border'
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
                                          : 'bg-purple-50 focus:bg-white text-purple-900 border-purple-200 focus:border-purple-500'
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
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={resetPractice}
                        className="px-4 py-1.5 rounded-xl border text-xs font-bold hover:bg-neutral-100"
                      >
                        Reiniciar
                      </button>
                      <button
                        onClick={() => setPracticeChecking(true)}
                        className="px-5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow"
                      >
                        Corregir Tabla
                      </button>
                    </div>
                  )}
                </div>

                {/* Sidebar details */}
                <div className="md:col-span-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs text-neutral-800 uppercase tracking-widest flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-sm">explore</span>
                      Asistente Conceptual
                    </h5>
                    
                    {selectedRow && selectedCol ? (
                      <div className="space-y-2">
                        <div className="text-[32px] font-bold text-center text-primary py-2 border-b">
                          {selectedRow} × {selectedCol} = <span className="text-secondary">{selectedRow * selectedCol}</span>
                        </div>
                        <p className="text-xs text-neutral-600 font-medium">Representación Pedagógica Adapta:</p>
                        <div className="bg-white p-3 rounded-xl border space-y-1">
                          <p className="text-xs font-semibold text-neutral-700">Abordaje por sumas sucesivas:</p>
                          <p className="text-xs text-neutral-500 font-mono">
                            {Array(selectedRow).fill(selectedCol).join(' + ')} = {selectedRow * selectedCol}
                          </p>
                          <p className="text-[10px] text-neutral-400">"{selectedRow} veces sumado el {selectedCol}"</p>
                        </div>
                        
                        {/* Dot array mockup */}
                        <div className="p-3 bg-white rounded-xl border space-y-1">
                          <p className="text-xs font-semibold text-neutral-700">Matriz de puntos ({selectedRow} x {selectedCol}):</p>
                          <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                            {Array.from({ length: Math.min(selectedRow, 8) }).map((_, rIdx) => (
                              <div key={rIdx} className="flex gap-0.5">
                                {Array.from({ length: Math.min(selectedCol, 12) }).map((_, cIdx) => (
                                  <span key={cIdx} className="w-1.5 h-1.5 rounded-full bg-secondary-container shrink-0"></span>
                                ))}
                                {selectedCol > 12 && <span className="text-[8px] text-neutral-300">...</span>}
                              </div>
                            ))}
                            {selectedRow > 8 && <div className="text-[8px] text-neutral-300">({selectedRow - 8} filas más)</div>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 border border-dashed rounded-xl text-center text-xs text-neutral-400 italic">
                        Selecciona cualquier intersección en la tabla para ver su desglose conceptual.
                      </div>
                    )}
                  </div>

                  <div className="bg-secondary-container/10 p-3 rounded-xl border border-secondary-container/20">
                    <p className="text-[10px] leading-relaxed text-neutral-600">
                      <strong>Consejo de inclusión:</strong> Al ensenar a niños con TGD o discalculia, usa el color interactivo para guiar la lectura secuencial. El modo autoevaluación les permite jugar con aciertos y errores interactivos sin presión de tiempo.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // PRINT PREVIEW
              <div className="bg-neutral-50 p-6 rounded-2xl border text-center space-y-6">
                <div id="printable-table-pdf" className="bg-white p-8 max-w-2xl mx-auto rounded-xl shadow-sm border space-y-6 text-left printable-resource text-neutral-800">
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Escuela Especial Domiciliaria N° 1</span>
                      <h4 className="font-bold text-lg text-neutral-800">MI TABLA PITAGÓRICA COMPLETA</h4>
                      <p className="text-xs text-neutral-500">Nombre del Alumno: ____________________________________</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-neutral-400">Adaptación Curricular</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto p-2 bg-neutral-50 border rounded-xl flex justify-center">
                    <table className="border-collapse">
                      <tbody>
                        <tr>
                          <td className="w-8 h-8 border text-center font-bold text-xs bg-neutral-100">X</td>
                          {Array.from({ length: 11 }, (_, i) => i).map(c => (
                            <td key={c} className="w-8 h-8 border text-center font-bold text-xs bg-neutral-100">{c}</td>
                          ))}
                        </tr>
                        {Array.from({ length: 11 }, (_, i) => i).map(r => (
                          <tr key={r}>
                            <td className="w-8 h-8 border text-center font-bold text-xs bg-neutral-100">{r}</td>
                            {Array.from({ length: 11 }, (_, i) => i).map(c => (
                              <td key={c} className="w-8 h-8 border text-center text-xs text-neutral-700 bg-white">{r * c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="border p-3 rounded-lg bg-neutral-55/10">
                      <p className="font-bold mb-1">📝 Tarea escolar sugerida:</p>
                      <p className="text-neutral-500">Encuentra los resultados de las tablas gemelas (por ejemplo, 3 x 4 y 4 x 3) y píntalas con el mismo color. ¿Notas algún patrón?</p>
                    </div>
                    <div className="border p-3 rounded-lg bg-neutral-55/10">
                      <p className="font-bold mb-1">⭐ Autoevaluación:</p>
                      <p className="text-neutral-500">¿Qué multiplicación de números iguales (ej: 6x6, 7x7) te resultó más fácil de memorizar? ¡Escríbelas!</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs inline-flex items-center gap-1.5 shadow"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Imprimir Ficha PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESOURCE 2: CÍRCULO WALDORF */}
        {resource.id === 'res-2' && (
          <div className="space-y-6">
            {activeTab === 'interactive' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                <div className="md:col-span-7 flex flex-col items-center space-y-4">
                  <div className="flex gap-4 items-center justify-between w-full">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-700">Geometría Numérica con Hilado</h4>
                      <p className="text-xs text-neutral-500">Observa cómo la matemática genera arte geométrico simétrico.</p>
                    </div>
                    <select
                      value={multiplier}
                      onChange={(e) => {
                        setMultiplier(parseInt(e.target.value));
                        setStepIndex(0);
                        setIsPlaying(false);
                      }}
                      className="border text-xs py-1.5 px-3 rounded-xl shadow-sm font-bold bg-white outline-none"
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 2).map(n => (
                        <option key={n} value={n}>Tabla del {n}</option>
                      ))}
                    </select>
                  </div>

                  {/* SVG Waldorf Area */}
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-6 border flex justify-center items-center relative w-full h-[320px]">
                    <svg width="240" height="240" className="overflow-visible">
                      {/* Outer Wooden Circle mockup outline */}
                      <circle cx="110" cy="110" r="105" fill="none" stroke="#d7ccc8" strokeWidth="6" className="shadow-xs" />
                      <circle cx="110" cy="110" r="95" fill="none" stroke="#e0e0e0" strokeWidth="1" />

                      {/* DRAWN YARN PATHS UP TO THE CURRENT STEP */}
                      <path
                        d={(() => {
                          let p = '';
                          for (let i = 0; i <= stepIndex; i++) {
                            const lastDigit = (multiplier * i) % 10;
                            const coords = getCoordinatesForPin(lastDigit);
                            if (i === 0) p += `M ${coords.x} ${coords.y}`;
                            else p += ` L ${coords.x} ${coords.y}`;
                          }
                          return p;
                        })()}
                        fill="none"
                        stroke={yarnColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />

                      {/* Pins */}
                      {Array.from({ length: 10 }).map((_, pIdx) => {
                        const coords = getCoordinatesForPin(pIdx);
                        const isCurrentActive = waldorfSteps[stepIndex]?.lastDigit === pIdx;

                        return (
                          <g key={pIdx}>
                            {/* Pin drawing */}
                            <circle
                              cx={coords.x}
                              cy={coords.y}
                              r={isCurrentActive ? '7' : '4'}
                              fill={isCurrentActive ? yarnColor : '#795548'}
                              className="transition-all cursor-pointer hover:scale-125"
                              title={`Pin ${pIdx}`}
                              onClick={() => {
                                // Find step that matches lastDigit
                                const match = waldorfSteps.findIndex((s, sIdx) => sIdx > 0 && s.lastDigit === pIdx);
                                if (match !== -1) setStepIndex(match);
                              }}
                            />
                            {/* Text label */}
                            <text
                              x={coords.x + (coords.x > 110 ? 12 : -12)}
                              y={coords.y + 4}
                              textAnchor="middle"
                              className={`text-[9px] font-bold select-none ${
                                isCurrentActive ? 'fill-primary font-extrabold text-[12px]' : 'fill-neutral-500'
                              }`}
                            >
                              {pIdx}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <button
                        onClick={() => {
                          setStepIndex(prev => (prev > 0 ? prev - 1 : 0));
                          setIsPlaying(false);
                        }}
                        className="w-8 h-8 rounded-full border bg-white text-neutral-600 hover:bg-neutral-100 flex items-center justify-center font-bold hover:scale-105 transition-all shadow-xs cursor-pointer"
                        title="Paso Anterior"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white hover:scale-105 transition-all shadow cursor-pointer ${
                          isPlaying ? 'bg-amber-600' : 'bg-primary'
                        }`}
                        title={isPlaying ? 'Pausa' : 'Auto-reproduce'}
                      >
                        <span className="material-symbols-outlined text-sm">{isPlaying ? 'pause' : 'play_arrow'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setStepIndex(prev => (prev < 10 ? prev + 1 : 0));
                          setIsPlaying(false);
                        }}
                        className="w-8 h-8 rounded-full border bg-white text-neutral-600 hover:bg-neutral-100 flex items-center justify-center font-bold hover:scale-105 transition-all shadow-xs cursor-pointer"
                        title="Siguiente Paso"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Waldorf Sidebar list */}
                <div className="md:col-span-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border space-y-4 text-left flex flex-col justify-between">
                  <div className="space-y-4">
                    <h5 className="font-bold text-xs text-neutral-800 uppercase tracking-widest text-[#795548] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">pattern</span>
                      Secuencia de Enlazado ({multiplier} en {multiplier})
                    </h5>

                    <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-2">
                      {waldorfSteps.map((step, idx) => {
                        const isActive = idx === stepIndex;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setStepIndex(idx);
                              setIsPlaying(false);
                            }}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-white border-primary shadow text-primary font-bold scale-[1.01]'
                                : 'bg-white/40 hover:bg-white border-transparent text-neutral-600'
                            }`}
                          >
                            <span className="text-[11px] font-mono">{step.label}</span>
                            <span className="text-xs font-bold text-neutral-700">{step.product}</span>
                            <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-500">
                              Pin #{step.lastDigit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#efebe9]/50 p-2.5 rounded-xl border border-[#d7ccc8]/40 text-[10px] leading-relaxed text-neutral-600">
                    <strong>¿Qué figura geométrica se forma?</strong>
                    <br />
                    - Tabla del 5: Línea recta (estrella bivalente).
                    <br />
                    - Tablas del 2 u 8: Formas estrelladas de cinco puntas (Pentáculo).
                    <br />
                    - Tablas del 3 o 7: Estrellas de diez puntas de gran complejidad!
                  </div>
                </div>
              </div>
            ) : (
              // PRINT VIEW
              <div className="bg-neutral-50 p-6 rounded-2xl border text-center space-y-6">
                <div className="bg-white p-8 max-w-xl mx-auto rounded-xl shadow-sm border space-y-6 text-left text-neutral-800">
                  <div className="text-center border-b pb-4">
                    <span className="text-[9px] uppercase tracking-wider text-[#795548] font-bold">Lanas de Colores e Hilado Matemático</span>
                    <h4 className="font-bold text-lg text-neutral-800">CÍRCULO DE MULTIPLICACIÓN WALDORF</h4>
                    <p className="text-xs text-neutral-500">Tabla de Multiplicar Seleccionada: Tabla del {multiplier}</p>
                  </div>

                  <div className="flex justify-center py-4">
                    <svg width="220" height="220" className="border rounded-full p-2 bg-neutral-55/10">
                      <circle cx="110" cy="110" r="100" fill="none" stroke="#795548" strokeWidth="2" strokeDasharray="4 4" />
                      {Array.from({ length: 10 }).map((_, pIdx) => {
                        const coords = getCoordinatesForPin(pIdx);
                        return (
                          <g key={pIdx}>
                            <circle cx={coords.x} cy={coords.y} r="5" fill="#795548" />
                            <text x={coords.x} y={coords.y - 10} textAnchor="middle" className="text-[10px] font-bold fill-neutral-700">{pIdx}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs mb-2 text-[#795548]">Guía de Pasos Imprimible:</h5>
                    <ol className="text-xs text-neutral-600 list-decimal list-inside space-y-1.5 bg-neutral-50 p-4 rounded-xl border border-[#d7ccc8]/40">
                      <li>Amarra la punta del hilo de lana en el <strong>Pin 0</strong>.</li>
                      {Array.from({ length: 10 }).map((_, i) => {
                        const nextVal = multiplier * (i + 1);
                        const lastDigit = nextVal % 10;
                        return (
                          <li key={nextVal}>Multiplica {multiplier} x {i + 1} = {nextVal}. Enlaza el hilo al <strong>Pin {lastDigit}</strong>.</li>
                        );
                      })}
                      <li>Corta el hilo sobrante y haz un nudo fuerte. ¡Mira tu mandala numérico terminado!</li>
                    </ol>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs inline-flex items-center gap-1.5 shadow"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Imprimir Guía de Trabajo
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESOURCE 3: EFEMÉRIDES DE 1810 */}
        {resource.id === 'res-3' && (
          <div className="space-y-6">
            {activeTab === 'interactive' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                {/* Character selection area */}
                <div className="md:col-span-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-500">Personajes Ilustres</h4>
                  <div className="space-y-2">
                    {personajes.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCharacter(idx);
                          setCustomQuestion(p.adaptedPrompt);
                        }}
                        className={`w-full p-3.5 rounded-xl border transition-all text-left flex items-center justify-between group ${
                          selectedCharacter === idx
                            ? 'bg-primary/10 border-primary shadow text-primary font-bold scale-[1.01]'
                            : 'bg-white hover:bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-[10px] text-neutral-500 font-medium">Época Colonial de Mayo</p>
                        </div>
                        <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary transition-colors text-base">
                          {selectedCharacter === idx ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 leading-normal">
                    <p className="font-bold">💡 Tip Pedagógico:</p>
                    <p className="mt-1">Pídele al alumno que lea o escuche el pregón y dibuje al personaje imaginando cómo vestían. Es un gran disparador de escritura creativa adaptada.</p>
                  </div>
                </div>

                {/* Character visual cards and task generator */}
                <div className="md:col-span-8 space-y-4">
                  {/* Card showcase */}
                  <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border p-6 flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 space-y-2">
                      <div className="w-full h-44 rounded-xl overflow-hidden border bg-white flex items-center justify-center">
                        <img
                          src={personajes[selectedCharacter].image}
                          alt={personajes[selectedCharacter].name}
                          className="w-full h-full object-contain p-2 max-h-44"
                          onError={(e) => {
                            // If images are missing or slow, provide nice fallback text representation
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="text-center p-4">
                          <span className="material-symbols-outlined text-5xl text-amber-500">person</span>
                          <p className="text-xs font-bold font-mono mt-1">{personajes[selectedCharacter].name}</p>
                        </div>
                      </div>
                      <p className="text-[10px] italic text-neutral-400 text-center">Ficha adaptada imprimible debajo</p>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-extrabold text-lg text-primary">{personajes[selectedCharacter].name}</h4>
                        <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-mono font-bold">1810</span>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 text-amber-900 italic font-medium p-3.5 rounded-xl text-center font-serif text-sm relative">
                        <span className="absolute -top-2 left-2 text-3xl font-serif text-amber-300">“</span>
                        {personajes[selectedCharacter].pregon}
                        <span className="absolute -bottom-5 right-2 text-3xl font-serif text-amber-300">”</span>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed pt-2">
                        {personajes[selectedCharacter].desc}
                      </p>
                    </div>
                  </div>

                  {/* Worksheet customize helper */}
                  <div className="border rounded-2xl p-4 bg-white space-y-3">
                    <h5 className="font-bold text-xs text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
                      Personalizar Preguntas de la Ficha escolar adaptada
                    </h5>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Escribe una pregunta adaptada para tu alumno..."
                        className="w-full border border-neutral-200 bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary"
                      />
                      <textarea
                        rows={2}
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="Glosa/Notas adicionales del docente (ej: Utilizar pictogramas impresos para las respuestas)"
                        className="w-full border border-neutral-200 bg-white p-2.5 rounded-xl text-[11px] outline-none text-neutral-500 leading-normal"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // PRINT VIEW
              <div className="bg-neutral-50 p-6 rounded-2xl border text-center space-y-6">
                <div className="bg-white p-8 max-w-xl mx-auto rounded-xl shadow-sm border space-y-6 text-left text-neutral-800">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Ficha de Ciencias Sociales adaptada</span>
                      <h4 className="font-bold text-lg text-neutral-800">EFEMÉRIDES DE MAYO: {personajes[selectedCharacter].name.toUpperCase()}</h4>
                      <p className="text-xs text-neutral-500">Alumno: _____________________</p>
                    </div>
                    <span className="text-[11px] font-bold font-mono text-white bg-primary px-3 py-1 rounded">25 de Mayo</span>
                  </div>

                  {/* Printable layout card */}
                  <div className="border-2 border-dashed p-4 rounded-xl flex gap-4 items-center">
                    <div className="w-24 h-24 border flex items-center justify-center text-center p-2 rounded-lg bg-neutral-50 shrink-0">
                      <span className="text-xs font-bold text-neutral-400">DIBUJA AL PERSONAJE AQUÍ</span>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-neutral-800">{personajes[selectedCharacter].name}</h5>
                      <p className="text-[11px] font-serif italic text-neutral-500">"{personajes[selectedCharacter].pregon}"</p>
                      <p className="text-[11px] text-neutral-600 leading-relaxed font-body">{personajes[selectedCharacter].desc}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-extrabold text-xs text-neutral-800 border-b pb-1">CON RESPONDEMOS JUNTOS:</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-neutral-700">1. {customQuestion}</p>
                        <div className="h-10 border-b border-neutral-300"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-neutral-700">2. Dibuja o pega una imagen del personaje.</p>
                        <div className="h-28 border rounded-lg bg-neutral-50 flex items-center justify-center">
                          <span className="text-[10px] text-neutral-400 font-medium font-sans">Cuadro para dibujo y pegado</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {studentNotes && (
                    <div className="p-3 bg-neutral-50 rounded-lg border text-[10px] text-neutral-500 leading-normal font-mono">
                      <strong>Guía Docente / Ajuste Razonable:</strong> {studentNotes}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs inline-flex items-center gap-1.5 shadow"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Imprimir Ficha Auxiliar
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESOURCE 4: MANUAL DE TERMOFUSIÓN */}
        {resource.id === 'res-4' && (
          <div className="space-y-6">
            {activeTab === 'interactive' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                {/* Plastic Selector list */}
                <div className="md:col-span-4 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-500">Clases de Plásticos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    {Object.keys(PlasticsGuides).map((key) => {
                      const item = PlasticsGuides[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedPlastic(key)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedPlastic === key
                              ? (item.safe
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow'
                                : 'bg-red-50 border-red-500 text-red-800 font-bold shadow')
                              : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold">#{item.num} - {key}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${item.safe ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Plastic information display & safety checklist game */}
                <div className="md:col-span-8 space-y-4">
                  {/* Plastic Info Panel */}
                  {(() => {
                    const plastic = PlasticsGuides[selectedPlastic];
                    return (
                      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-5 border border-neutral-200/40 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className={`font-extrabold text-base ${plastic.safe ? 'text-emerald-700' : 'text-red-700'}`}>
                            {plastic.name}
                          </h4>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            plastic.safe ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {plastic.safe ? 'Apto Termofusión' : 'NO FUNDIR / PELIGRO'}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-700 font-medium">
                          <strong>Comúnmente encontrado en:</strong> {plastic.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                          <div className="bg-white p-3 rounded-xl border">
                            <p className="text-neutral-500 text-[10px] uppercase font-bold">Temperatura Recomendada</p>
                            <p className="font-bold text-neutral-800 mt-1">{plastic.temp}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border">
                            <p className="text-neutral-500 text-[10px] uppercase font-bold">Grado de Toxicidad</p>
                            <p className={`font-bold mt-1 ${plastic.toxicity === 'MUY ALTA' ? 'text-red-650' : 'text-neutral-800'}`}>
                              {plastic.toxicity}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl border bg-white text-xs leading-relaxed text-neutral-600">
                          {plastic.reason}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Safety Practice Simulator Checklist */}
                  <div className="bg-white rounded-2xl p-4 border space-y-3">
                    <h5 className="font-bold text-xs text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm text-primary">gpp_maybe</span>
                      Simulador de Preparación Segura de la Prensa Térmica
                    </h5>
                    <p className="text-[11px] text-neutral-400">Antes de encender la prensa de termofusión en el Hogar Juanito, marca las precauciones necesarias cumplidas en tu entorno:</p>
                    
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 rounded-lg border-neutral-100">
                        <input
                          type="checkbox"
                          checked={fusePracticeStatus.goggles}
                          onChange={(e) => setFusePracticeStatus({ ...fusePracticeStatus, goggles: e.target.checked })}
                          className="rounded border-zinc-300 bg-zinc-50 w-4 h-4 cursor-pointer text-primary focus:ring-0"
                        />
                        <span>Tengo puestos mis lentes de seguridad (antiparras) protectores.</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={fusePracticeStatus.gloves}
                          onChange={(e) => setFusePracticeStatus({ ...fusePracticeStatus, gloves: e.target.checked })}
                          className="rounded border-zinc-300 w-4 h-4 cursor-pointer text-primary"
                        />
                        <span>Tengo puestos guantes térmicos protectores para el manejo del calor.</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={fusePracticeStatus.ventilation}
                          onChange={(e) => setFusePracticeStatus({ ...fusePracticeStatus, ventilation: e.target.checked })}
                          className="rounded border-zinc-300 w-4 h-4 cursor-pointer text-primary"
                        />
                        <span>Las ventanas están abiertas y el extractor de aire del taller está encendido.</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={fusePracticeStatus.nonPVC}
                          onChange={(e) => setFusePracticeStatus({ ...fusePracticeStatus, nonPVC: e.target.checked })}
                          className="rounded border-zinc-300 w-4 h-4 cursor-pointer text-primary"
                        />
                        <span>He clasificado y quitado todas las botellas, tubos o mangueras de <strong>PVC (Nó. 3)</strong> del cesto.</span>
                      </label>
                    </div>

                    <div className={`p-3 rounded-xl border text-center transition-all ${
                      isSafetyPass
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <span className="text-xs">
                        {isSafetyPass
                          ? '✅ MULTI-PREVENCIONES COMPLETADAS: ¡Prensa Térmica Lista para Encender y Sellar con Seguridad!'
                          : '⚠️ ¡Protocolo Incompleto! Asegúrate de cumplir todas las medidas de prevención antes de encender la prensa.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // PRINT VIEW
              <div className="bg-neutral-50 p-6 rounded-2xl border text-center space-y-6">
                <div className="bg-white p-8 max-w-xl mx-auto rounded-xl shadow-sm border space-y-6 text-left text-neutral-800">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Afiche de Aula - Escuela Sustentable (Escuelas Verdes)</span>
                      <h4 className="font-extrabold text-base text-neutral-800">NORMAS DE SEGURIDAD PARA TERMOFUSIÓN EN TALLER</h4>
                      <p className="text-xs text-neutral-500">Hogar Juanito • Dirección Pedagógica</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-white bg-red-650 px-2 py-0.5 rounded">¡PRECAUCIÓN!</span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[11px] text-neutral-600">Pegar este afiche en un lugar visible directamente al lado de la Prensa Térmica y repasar con los alumnos antes de cada proceso.</p>

                    <div className="border border-red-200 bg-red-50/20 p-4 rounded-xl space-y-1.5 text-xs">
                      <p className="font-bold text-red-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">dangerous</span>
                        PROHIBIDO ABSOLUTO: PVC (Policloruro de Vinilo)
                      </p>
                      <p className="text-neutral-500 text-[11px] leading-normal">
                        No fundas bajo ninguna circunstancia plásticos con el número <strong>3 o PVC</strong> (mangueras, juguetes rotos, caños). Desprenden emanaciones altamente corrosivas e irritantes muy gases tóxicas para el sistema respiratorio infantil.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-bold text-xs text-neutral-700">📋 PROTOCOLO EN 5 PASOS DOCENTE-ALUMNO:</p>
                      
                      <div className="bg-neutral-50 rounded-xl p-3 border space-y-2 text-xs">
                        <div className="flex items-start gap-1.5">
                          <span className="font-bold text-primary shrink-0">1.</span>
                          <div>
                            <p className="font-bold">Clasificación:</p>
                            <p className="text-neutral-500 leading-normal">Usa solo bolsas vacías y limpias de PEBD (Nó 4, de supermercado) o botellas trituradas de PEAD (Nó 2).</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 border-t pt-2">
                          <span className="font-bold text-primary shrink-0">2.</span>
                          <div>
                            <p className="font-bold">Papel Manteca Protector:</p>
                            <p className="text-neutral-500 leading-normal">Coloca siempre los retazos de plástico sandwichados enteramente dentro de dos hojas de papel manteca vegetal para proteger las planchas metálicas de derretimientos.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 border-t pt-2">
                          <span className="font-bold text-primary shrink-0">3.</span>
                          <div>
                            <p className="font-bold">Calor Controlado:</p>
                            <p className="text-neutral-500 leading-normal">Establece la temperatura de prensa a un rango moderado (110 - 130 °C). Mantén encendida la campana extractora o ventanas totalmente abiertas.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 border-t pt-2">
                          <span className="font-bold text-primary shrink-0">4.</span>
                          <div>
                            <p className="font-bold">Uso de Equipo de Protección:</p>
                            <p className="text-neutral-500 leading-normal">El docente o alumno operador debe manipular las láminas usando gafas y guantes aislantes térmicos gruesos.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs inline-flex items-center gap-1.5 shadow"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Imprimir Manual de Aula
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESOURCE 5: MUNDIAL DIGITAL 2026 */}
        {resource.id === 'res-5' && (
          <div className="space-y-6">
            {activeTab === 'interactive' ? (
              <div className="space-y-6 text-left">
                {/* Simulated Web App Frame */}
                <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm bg-[#fafafa] dark:bg-neutral-950">
                  
                  {/* Web Banner Style Header */}
                  <div className="relative bg-black text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden border-b border-neutral-800">
                    {/* Background image overlay */}
                    {resource.imageUrl && (
                      <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                        <img 
                          src={resource.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt="Banner BG"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    {/* Glowing Accent Lines container */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none" />
                    
                    {/* Logo & Headline */}
                    <div className="relative z-10 flex items-center gap-4 text-center md:text-left flex-col md:flex-row animate-fade-in">
                      <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-400/40 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                        <span className="material-symbols-outlined text-[36px] animate-pulse">sports_soccer</span>
                      </div>
                      <div>
                        <h1 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                          MUNDIAL DIGITAL <span className="text-emerald-400 font-black">2026</span>
                        </h1>
                        <p className="text-xs md:text-sm text-neutral-300 font-medium">
                          Un recorrido por las culturas digitales de los países participantes
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 relative z-10 bg-emerald-400/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs animate-pulse text-emerald-400">sensors</span>
                      Demo Pedagógica Viva
                    </div>
                  </div>

                  {/* Lower body of Simulated App */}
                  <div className="p-6 md:p-8 min-h-[400px]">
                    {/* HOME VIEW */}
                    {mundialTab === 'home' && (
                      <div className="max-w-2xl mx-auto text-center space-y-8 py-4">
                        <div className="space-y-4">
                          <p className="text-primary dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                            ¡EMPECEMOS A JUGAR!
                          </p>
                          <h2 className="font-headline font-black text-2xl md:text-4xl text-on-surface leading-tight tracking-tight">
                            Explorá la cultura digital de los países del Mundial 2026
                          </h2>
                          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-lg mx-auto">
                            Descubrí cómo viven, juegan y usan tecnología en las distintas partes del mundo
                          </p>
                        </div>

                        {/* Three Golden Bento Cards representing Buttons in Screenshot */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Card 1: Explorá */}
                          <button
                            onClick={() => setMundialTab('explora')}
                            className="bg-[#fac10c] hover:bg-[#e0ad0b] text-slate-950 p-6 rounded-[2.5rem] border-2 border-amber-600 hover:scale-[1.02] shadow-sm active:scale-95 transition-all text-center flex flex-col items-center justify-center space-y-2 group cursor-pointer"
                          >
                            <span className="text-3xl group-hover:rotate-12 transition-transform">🌎</span>
                            <span className="font-extrabold text-base tracking-tight">Explorá</span>
                            <span className="text-[11px] font-semibold leading-normal opacity-90 block">
                              Conocé la cultura digital de los países participantes.
                            </span>
                          </button>

                          {/* Card 2: Jugá */}
                          <button
                            onClick={() => {
                              setMundialTab('juga');
                              setTriviaIndex(0);
                              setTriviaScore(0);
                              setTriviaSelectedAnswer(null);
                              setTriviaCompleted(false);
                            }}
                            className="bg-[#fac10c] hover:bg-[#e0ad0b] text-slate-950 p-6 rounded-[2.5rem] border-2 border-amber-600 hover:scale-[1.02] shadow-sm active:scale-95 transition-all text-center flex flex-col items-center justify-center space-y-2 group cursor-pointer"
                          >
                            <span className="text-3xl group-hover:animate-bounce animate-duration-1000">🎮</span>
                            <span className="font-extrabold text-base tracking-tight">Jugá</span>
                            <span className="text-[11px] font-semibold leading-normal opacity-90 block">
                              Poné a prueba tus conocimientos en la Trivia Digital.
                            </span>
                          </button>

                          {/* Card 3: Investigá */}
                          <button
                            onClick={() => setMundialTab('investiga')}
                            className="bg-[#fac10c] hover:bg-[#e0ad0b] text-slate-950 p-6 rounded-[2.5rem] border-2 border-amber-600 hover:scale-[1.02] shadow-sm active:scale-95 transition-all text-center flex flex-col items-center justify-center space-y-2 group cursor-pointer"
                          >
                            <span className="text-3xl group-hover:scale-110 transition-transform">🔎</span>
                            <span className="font-extrabold text-base tracking-tight">Investigá</span>
                            <span className="text-[11px] font-semibold leading-normal opacity-90 block">
                              Descargá fichas y desafíos para profundizar la exploración.
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* EXPLORA VIEW */}
                    {mundialTab === 'explora' && (
                      <div className="space-y-6">
                        {/* Selector Navigation */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                          <button
                            onClick={() => setMundialTab('home')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-800 bg-neutral-105 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Volver al Inicio
                          </button>

                          {/* Country selector bar */}
                          <div className="flex flex-wrap gap-1.5">
                            {Object.keys(p_digitales).map(country => (
                              <button
                                key={country}
                                onClick={() => setSelectedCountry(country)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                  selectedCountry === country
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50'
                                }`}
                              >
                                <span>{p_digitales[country].flag}</span> {country}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Country Detail Sheet */}
                        {selectedCountry && (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                            <div className="md:col-span-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-6 rounded-3xl border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-center items-center text-center space-y-2">
                              <span className="text-7xl select-none filter drop-shadow">
                                {p_digitales[selectedCountry].flag}
                              </span>
                              <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                                {selectedCountry}
                              </h3>
                              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                                Cultura Digital Mundial
                              </p>
                            </div>

                            <div className="md:col-span-8 flex flex-col justify-between space-y-4 text-left">
                              <div className={`p-6 rounded-3xl border bg-gradient-to-br ${p_digitales[selectedCountry].color} space-y-3`}>
                                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-base">school</span>
                                  Cultura Digital Escolar
                                </h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                  {p_digitales[selectedCountry].culture}
                                </p>
                              </div>

                              <div className="bg-amber-100/45 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-5 rounded-3xl space-y-2">
                                <h4 className="font-bold text-xs text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-amber-600 animate-bounce">tips_and_updates</span>
                                  Dato Curioso del País
                                </h4>
                                <p className="text-xs text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                                  {p_digitales[selectedCountry].fact}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* JUGA VIEW - TRIVIA GAME */}
                    {mundialTab === 'juga' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                          <button
                            onClick={() => setMundialTab('home')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-800 bg-neutral-105 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Volver al Inicio
                          </button>

                          <div className="text-xs font-bold text-neutral-500 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1.5 rounded-full">
                            <span>Puntos: <strong className="text-emerald-500 font-extrabold">{triviaScore}</strong></span>
                            <span>•</span>
                            <span>Pregunta: <strong className="text-primary">{triviaIndex + 1}/{triviaQuestions.length}</strong></span>
                          </div>
                        </div>

                        {!triviaCompleted ? (
                          <div className="max-w-xl mx-auto space-y-6 py-2">
                            <div className="space-y-3">
                              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                                Saberes Digitales
                              </span>
                              <h3 className="font-headline font-extrabold text-lg md:text-xl text-on-surface leading-snug">
                                {triviaQuestions[triviaIndex].q}
                              </h3>
                            </div>

                            <div className="space-y-3">
                              {triviaQuestions[triviaIndex].opts.map((opt, oIdx) => {
                                let optClass = 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 text-neutral-700';
                                if (triviaSelectedAnswer !== null) {
                                  if (oIdx === triviaQuestions[triviaIndex].correct) {
                                    optClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-bold';
                                  } else if (triviaSelectedAnswer === oIdx) {
                                    optClass = 'bg-red-500/10 border-red-500 text-red-800 dark:text-red-400';
                                  } else {
                                    optClass = 'opacity-50 border-neutral-200 dark:border-neutral-800';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => {
                                      if (triviaSelectedAnswer === null) {
                                        setTriviaSelectedAnswer(oIdx);
                                        if (oIdx === triviaQuestions[triviaIndex].correct) {
                                          setTriviaScore(prev => prev + 10);
                                        }
                                      }
                                    }}
                                    disabled={triviaSelectedAnswer !== null}
                                    className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-start gap-3 justify-between cursor-pointer ${optClass}`}
                                  >
                                    <span className="leading-snug">{opt}</span>
                                    {triviaSelectedAnswer !== null && oIdx === triviaQuestions[triviaIndex].correct && (
                                      <span className="material-symbols-outlined text-emerald-500 shrink-0 text-xl font-bold">check_circle</span>
                                    )}
                                    {triviaSelectedAnswer === oIdx && oIdx !== triviaQuestions[triviaIndex].correct && (
                                      <span className="material-symbols-outlined text-red-500 shrink-0 text-xl font-bold">cancel</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {triviaSelectedAnswer !== null && (
                              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 space-y-3 animate-fade-in">
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                                  <strong>Explicación:</strong> {triviaQuestions[triviaIndex].why}
                                </p>
                                <button
                                  onClick={() => {
                                    if (triviaIndex + 1 < triviaQuestions.length) {
                                      setTriviaIndex(prev => prev + 1);
                                      setTriviaSelectedAnswer(null);
                                    } else {
                                      setTriviaCompleted(true);
                                    }
                                  }}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl block transition-all cursor-pointer"
                                >
                                  {triviaIndex + 1 < triviaQuestions.length ? 'Siguiente Pregunta' : 'Finalizar Desafío'}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="max-w-md mx-auto text-center space-y-6 py-6 animate-fade-in">
                            <span className="text-6xl animate-bounce inline-block">🏆</span>
                            <div className="space-y-2">
                              <h3 className="font-headline font-black text-2xl text-on-surface">¡Juego Completado!</h3>
                              <p className="text-sm text-neutral-500">
                                Lograste descifrar con éxito los misterios de las culturas digitales escolares.
                              </p>
                              <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-3xl max-w-xs mx-auto mt-4">
                                <span className="text-[11px] uppercase font-bold text-emerald-600 tracking-wider block">Puntaje Final</span>
                                <span className="text-4xl font-headline font-black text-emerald-500">{triviaScore} pts</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setTriviaIndex(0);
                                setTriviaScore(0);
                                setTriviaSelectedAnswer(null);
                                setTriviaCompleted(false);
                              }}
                              className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-full shadow cursor-pointer hover:bg-primary-dark"
                            >
                              Jugar de Nuevo
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INVESTIGA VIEW */}
                    {mundialTab === 'investiga' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                          <button
                            onClick={() => setMundialTab('home')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-800 bg-neutral-105 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Volver al Inicio
                          </button>

                          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-[#fac10c]/10 text-amber-700">
                            Consignas y Desafíos
                          </span>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200 text-left">
                            Estaciones de Innovación: Desafíos Escolares 🚀
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* challenge 1 */}
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-5 rounded-2xl flex flex-col justify-between text-left space-y-4">
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-sky-500 bg-sky-500/10 px-2.5 py-0.5 rounded-full">A. Solución Móvil</span>
                                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 leading-snug">El Sistema SMS</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                  Inspirados en las plataformas de Nigeria, diseñen un boceto de alertas escolares que funcione con mensajería móvil de texto básico en zonas con baja señal.
                                </p>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-mono">Consigna 1 • TIC Básica</span>
                            </div>

                            {/* challenge 2 */}
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-5 rounded-2xl flex flex-col justify-between text-left space-y-4">
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">B. Orquesta Maker</span>
                                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 leading-snug">El Piano Frutal</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                  Basándote en los FabLabs de Brasil, simula un circuito conectando bananas a tu teclado de computadora mediante cables de contacto y diseña notas musicales visuales.
                                </p>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-mono">Consigna 2 • Creatividad</span>
                            </div>

                            {/* challenge 3 */}
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-5 rounded-2xl flex flex-col justify-between text-left space-y-4">
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">C. Algoritmia</span>
                                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 leading-snug">Autómata del Aula</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                  De acuerdo a la práctica de Japón, escribe un algoritmo secuencial para guiar a un robot ficticio en la tarea de organizar los borradores del aula.
                                </p>
                              </div>
                              <span className="text-[10px] text-neutral-400 font-mono">Consigna 3 • Diseño</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/40 p-5 rounded-3xl border text-center flex flex-col items-center space-y-3">
                  <span className="material-symbols-outlined text-[36px] text-neutral-400">link</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-on-surface">¿Deseas acceder al portal oficial del Mundial Digital?</h4>
                    <p className="text-xs text-neutral-500 leading-normal max-w-sm mx-auto">
                      Allí podrás visualizar la grilla, los grupos de alumnos de varias escuelas de la Ciudad, y los proyectos interactivos creados por ellos.
                    </p>
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#fac10c] hover:bg-yellow-400 text-slate-900 font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Visitar mundialdigital2026.bue.edu.ar
                    </a>
                  )}
                </div>
              </div>
            ) : (
              // PRINT RES-5 WORKSHEET
              <div id="printable-resource" className="space-y-6 text-left border p-6 md:p-8 rounded-3xl bg-white dark:bg-neutral-900 shadow-sm">
                <div className="border-b pb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Secuencia Didáctica Escolar</span>
                    <h2 className="font-headline font-black text-2xl text-on-surface">Mundial Digital 2026</h2>
                    <p className="text-xs text-neutral-500">Un recorrido pedagógico para la integración lúdica de Tecnologías de Información en Escuelas Verdes.</p>
                  </div>
                  <span className="text-4xl select-none">🏆</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-primary uppercase tracking-wider flex items-center gap-1 border-b pb-1">
                      <span className="material-symbols-outlined text-sm">school</span>
                      Objetivos de Aprendizaje
                    </h3>
                    <ul className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Descubrir la relación globalizada del uso de la informática en escuelas de diferentes continentes (América Latina, África, Asia y Europa).</li>
                      <li>Vincular el aprendizaje de la cibernética y hardware libre con la resolución de problemáticas locales y el manejo seguro de residuos.</li>
                      <li>Desarrollar capacidades de algoritmia elemental y diseño centrado en el alumno.</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-primary uppercase tracking-wider flex items-center gap-1 border-b pb-1">
                      <span className="material-symbols-outlined text-sm">construction</span>
                      Materiales sugeridos
                    </h3>
                    <ul className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Dispositivos móviles o netbooks escolares con simuladores de programación visual.</li>
                      <li>Kits de placas electrónicas de baja complejidad con terminales USB.</li>
                      <li>Insumos reciclables escolares (papel, envases no clorados).</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium text-sm text-primary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit_document</span>
                    Consignas del Alumno / Respuestas del Docente
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl space-y-1">
                      <p className="text-xs font-bold">1. Estación Brasil (Orquesta Maker):</p>
                      <p className="text-xs text-neutral-500 leading-normal">
                        Dibujen el diagrama de cables que conectan una fruta a la controladora USB. Definan qué sonido producirá. Recordar aislar los contactos correctamente.
                      </p>
                    </div>

                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl space-y-1">
                      <p className="text-xs font-bold">2. Estación Japón (Algoritmia del Cuidado):</p>
                      <p className="text-xs text-neutral-500 leading-normal">
                        Escriban las instrucciones secuenciales para que un robot automatice la clasificación de objetos reciclables de su aula (botellas, tapas, cartones).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-xs uppercase tracking-wider text-neutral-500">Notas de Trabajo de Aula</h4>
                  <textarea
                    value={userMundialNotes}
                    onChange={(e) => setUserMundialNotes(e.target.value)}
                    placeholder="Escribe aquí observaciones grupales, pautas de evaluación específicas o adaptaciones curriculares indicadas..."
                    className="w-full text-xs p-3 rounded-2xl border bg-neutral-50 outline-none text-neutral-750 min-h-24 dark:bg-neutral-950 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="flex justify-between items-center gap-4 pt-2">
                  <span className="text-[10px] text-neutral-400 italic">Mundial Digital 2026 - Planificación adaptada para talleres escolares.</span>
                  <button
                    onClick={handlePrint}
                    className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs inline-flex items-center gap-1.5 shadow"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    Imprimir Ficha de Aula
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FALLBACK FOR EXTERNAL PROGRAMS OR OTHER RESOURCES */}
        {!['res-1', 'res-2', 'res-3', 'res-4', 'res-5'].includes(resource.id) && (
          <div className="space-y-6 text-left py-4">
            <div className="bg-neutral-50 dark:bg-neutral-800/45 rounded-3xl p-6 md:p-8 border border-neutral-200/50 flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              {resource.imageUrl ? (
                <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-700 shadow-sm relative group">
                  <img
                    src={resource.imageUrl}
                    alt={resource.titulo}
                    className="w-full h-auto object-cover max-h-72 transition-transform duration-300 group-hover:scale-[1.01]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-neutral-900/70 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs animate-pulse text-emerald-400">sensors</span>
                    Demo de Interface
                  </div>
                </div>
              ) : (
                <span className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-2xl">
                  <span className="material-symbols-outlined text-[48px]">language</span>
                </span>
              )}
              <div className="space-y-2">
                <h4 className="font-headline font-bold text-xl text-on-surface">{resource.titulo}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
                  {resource.descripcion}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    Materia: {resource.materia}
                  </span>
                  {resource.url && (
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      Enlace Externo Habilitado
                    </span>
                  )}
                </div>
              </div>

              {resource.url && (
                <div className="pt-4 w-full max-w-sm">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-full transition-all shadow-md hover:scale-[1.02] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    Acceder al Programa Oficial
                  </a>
                  <p className="text-[11px] text-neutral-400 mt-3 leading-normal">
                    Este link te llevará al portal oficial de <strong>{resource.titulo}</strong> para explorar sus herramientas, grupos y proyectos pedagógicos activos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
