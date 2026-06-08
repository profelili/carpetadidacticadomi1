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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
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
                 resource.id === 'res-3' ? 'library_books' : 'shield_with_heart'}
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

      </div>
    </div>
  );
};
