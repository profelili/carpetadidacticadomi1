import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ResourceMaterial, Student, ActivityPlan } from '../types';
import welcomeImg from '../assets/images/welcome_hero_steps_1780775091527.jpg';

const renderTextWithLinks = (text: string) => {
  if (!text) return null;
  
  // Custom replace for Carpeta Didáctica Domi1
  const containsDomi1 = text.includes('Carpeta Didáctica Domi1');
  let cleanText = text;
  if (containsDomi1) {
    cleanText = text.replace('Carpeta Didáctica Domi1', '');
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = cleanText.split(urlRegex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold inline-flex items-center gap-0.5 break-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[11px] inline-block">open_in_new</span>
              {part}
            </a>
          );
        }
        return part;
      })}
      
      {containsDomi1 && (
        <a
          href="https://carpetadidacticadomi1.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-secondary-container/60 hover:bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded border border-secondary-container inline-flex items-center gap-1 m-1 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[10px]">folder</span>
          Carpeta Didáctica Domi1
        </a>
      )}
    </>
  );
};

interface InicioViewProps {
  students: Student[];
  resources: ResourceMaterial[];
  activities?: ActivityPlan[]; // Optional for backward compatibility but fully supported
  setActiveTab: (tab: string) => void;
  openPlanningModal: () => void;
  onDownloadResource: (res: ResourceMaterial) => void;
  onDownloadSite: () => void;
  isExporting: boolean;
  onDeleteCustomResource?: (id: string) => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  students,
  resources,
  activities = [],
  setActiveTab,
  openPlanningModal,
  onDownloadResource,
  onDownloadSite,
  isExporting,
  onDeleteCustomResource,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(16); // Martes 16 default
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeWeek, setActiveWeek] = useState<number>(1);

  // States for external sheets linking
  const [externalSheetUrl, setExternalSheetUrl] = useState(() => {
    return localStorage.getItem('carp_external_sheet_url') || '';
  });
  const [externalSheetTitle, setExternalSheetTitle] = useState(() => {
    return localStorage.getItem('carp_external_sheet_title') || 'Planilla de Seguimiento Docente';
  });
  const [showExternalConfig, setShowExternalConfig] = useState(false);

  // States for local activity synchronization wizard
  const [showSyncWizard, setShowSyncWizard] = useState(false);
  const [selectedWizardActivityId, setSelectedWizardActivityId] = useState<string | null>(null);
  const [wizardTargetWeek, setWizardTargetWeek] = useState<number>(1);
  const [wizardTargetDayIdx, setWizardTargetDayIdx] = useState<number>(0);
  const [wizardSyncObservaciones, setWizardSyncObservaciones] = useState(true);

  const [studentToRemove, setStudentToRemove] = useState<{
    id: string;
    nombre: string;
    dia: string;
    rowIdx: number;
    week: number;
  } | null>(null);

  const defaultWeek1Rows = [
    {
      dia: 'LUNES 25/05',
      diaFeriado: true,
      alumnos: [],
      actividad: 'Feriado Nacional - Día de la Revolución de Mayo.',
      observaciones: 'Carpeta Didáctica Domi1 (Asentado en folios)'
    },
    {
      dia: 'MARTES 26/05',
      alumnos: [],
      actividad: 'Preparación de materiales adaptados and coordinación clínica.',
      observaciones: 'Carpeta Didáctica Domi1 (Asentado en folios)'
    },
    {
      dia: 'MIÉRCOLES 27/05',
      alumnos: [
        { id: 'hosp-1', nombre: 'Emanuel Vega Peña', det: 'Hospital Fernández' },
        { id: 'hosp-2', nombre: 'Santino', det: 'Hospital Fernández' },
        { id: 'hosp-3', nombre: 'Martina Juarez', det: 'Hospital Fernández' }
      ],
      actividad: 'Multiplicación con Métodos Dinámicos: Completar Tabla Pitagórica y uso del círculo de multiplicación Waldorf para el trazado geométrico.',
      observaciones: 'Emanuel: completó toda la tabla y la representó en el Círculo Waldorf sin dificultad. Santino y Martina: sin clase por estudio odontológico obligatorio. Carpeta Didáctica Domi1.'
    },
    {
      dia: 'JUEVES 28/05',
      alumnos: [
        { id: 'hosp-2', nombre: 'Santino', det: 'Hospital Fernández' },
        { id: 'hosp-3', nombre: 'Martina Juarez', det: 'Hospital Fernández' },
        { id: 'hosp-1', nombre: 'Emanuel Vega Peña', det: 'Hospital Fernández' }
      ],
      actividad: 'Efemérides de Mayo: Armado de rompecabezas histórico y análisis de la Vida Social Colonial de 1810. Crucigrama interactivo.',
      observaciones: 'Excelente participación colaborativa. Identificaron jerarquías sociales y costumbres coloniales. Carpeta Didáctica Domi1.'
    },
    {
      dia: 'VIERNES 29/05',
      alumnos: [
        { id: 'hog-1', nombre: 'Giovani Baden', det: 'Hogar Juanito' },
        { id: 'hog-2', nombre: 'Mario Sarmiento', det: 'Hogar Juanito' }
      ],
      actividad: 'Taller de Termofusión: Reconocimiento y reutilización experimental de bolsas plásticas (PEBD) bajo protocolo de seguridad industrial.',
      observaciones: 'Comprendieron el protocolo de seguridad para la prensa térmica. Identificación: PEAD o PEBD, PVC. Carpeta Didáctica Domi1.'
    }
  ];

  const defaultWeek2Rows = [
    {
      dia: 'LUNES 01/06',
      alumnos: [{ id: 'dom-1', nombre: 'Mateo R.', det: 'Domi1' }],
      actividad: 'Trabajo adaptado individual de alfabetización inicial enfocada en fonemas y oraciones breves.',
      observaciones: 'Asistencia normal. Se utiliza soporte de pictograma. Carpeta Didáctica Domi1.'
    },
    {
      dia: 'MARTES 02/06',
      alumnos: [{ id: 'dom-2', nombre: 'Lautaro M.', det: 'Domi2' }],
      actividad: 'Algoritmo de división decimal mediante juego de billetes y transacciones cotidianas.',
      observaciones: 'Descansos intermitentes programados para evitar somnolencia y fatiga post-quirúrgica.'
    },
    {
      dia: 'MIÉRCOLES 03/06',
      alumnos: [
        { id: 'hosp-1', nombre: 'Emanuel Vega Peña', det: 'Hospital Fernández' }
      ],
      actividad: 'Asimilación del algoritmo de multiplicación: Tablas de doble entrada personalizadas.',
      observaciones: 'Excelente progreso en destrezas de cálculo mental.'
    },
    {
      dia: 'JUEVES 04/06',
      alumnos: [
        { id: 'hosp-2', nombre: 'Santino', det: 'Hospital Fernández' },
        { id: 'hosp-3', nombre: 'Martina Juarez', det: 'Hospital Fernández' }
      ],
      actividad: 'Comprensión de relatos de tradición oral compartida. Reconstrucción colectiva de secuencias narrativas.',
      observaciones: 'Ambos alumnos demuestran gran interés y retención lírica.'
    },
    {
      dia: 'VIERNES 05/06',
      alumnos: [
        { id: 'hog-1', nombre: 'Giovani Baden', det: 'Hogar Juanito' },
        { id: 'hog-2', nombre: 'Mario Sarmiento', det: 'Hogar Juanito' }
      ],
      actividad: 'Proyecto Termofusión: Creación de retazos y costura adaptada fría de láminas fusionadas.',
      observaciones: 'Se obtuvieron muestras con terminación regular. Se archivan para el taller integrador.'
    }
  ];

  const [weeks, setWeeks] = useState<Array<{
    id: number;
    label: string;
    rows: Array<{
      dia: string;
      diaFeriado?: boolean;
      alumnos: Array<{ id: string; nombre: string; det: string }>;
      actividad: string;
      observaciones: string;
    }>;
  }>>(() => {
    try {
      const saved = localStorage.getItem('carp_weeks');
      if (saved) return JSON.parse(saved);

      const savedWeek1 = localStorage.getItem('carp_week1');
      const savedWeek2 = localStorage.getItem('carp_week2');

      if (savedWeek1 || savedWeek2) {
        const w1 = savedWeek1 ? JSON.parse(savedWeek1) : defaultWeek1Rows;
        const w2 = savedWeek2 ? JSON.parse(savedWeek2) : defaultWeek2Rows;
        
        const migrated = [
          { id: 1, label: 'Semana (26/05 - 29/05)', rows: w1 },
          { id: 2, label: 'Semana (01/06 - 05/06)', rows: w2 }
        ];
        localStorage.setItem('carp_weeks', JSON.stringify(migrated));
        return migrated;
      }
    } catch (e) {
      console.error('Error parsing weeks from localStorage', e);
    }

    return [
      { id: 1, label: 'Semana (26/05 - 29/05)', rows: defaultWeek1Rows },
      { id: 2, label: 'Semana (01/06 - 05/06)', rows: defaultWeek2Rows }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('carp_weeks', JSON.stringify(weeks));
    } catch (e) {
      console.error('Failed to save carp_weeks to localStorage:', e);
    }
  }, [weeks]);

  // States for new week addition modal
  const [showAddWeekModal, setShowAddWeekModal] = useState(false);
  const [newWeekLabel, setNewWeekLabel] = useState('');
  const [newWeekDays, setNewWeekDays] = useState<Array<{ name: string; date: string }>>([
    { name: 'LUNES', date: '' },
    { name: 'MARTES', date: '' },
    { name: 'MIÉRCOLES', date: '' },
    { name: 'JUEVES', date: '' },
    { name: 'VIERNES', date: '' }
  ]);

  // States for renaming a week
  const [renameWeekId, setRenameWeekId] = useState<number | null>(null);
  const [renameWeekLabel, setRenameWeekLabel] = useState('');

  // States for deleting a week
  const [weekToDeleteId, setWeekToDeleteId] = useState<number | null>(null);

  const autoProposeNextWeek = () => {
    if (weeks.length === 0) return;
    const lastWeek = weeks[weeks.length - 1];
    
    const matches = lastWeek.label.match(/(\d{2})\/(\d{2})/g);
    let lastDate = new Date(2026, 5, 5); // Default June 5, 2026 fallback
    
    if (matches && matches.length >= 2) {
      const [lastDay, lastMonth] = matches[matches.length - 1].split('/').map(Number);
      lastDate = new Date(2026, lastMonth - 1, lastDay);
    } else {
      const lastRow = lastWeek.rows[lastWeek.rows.length - 1];
      const dateStr = lastRow.dia.split(' ')[1];
      if (dateStr) {
        const [lastDay, lastMonth] = dateStr.split('/').map(Number);
        lastDate = new Date(2026, lastMonth - 1, lastDay);
      }
    }
    
    const nextMonday = new Date(lastDate);
    nextMonday.setDate(lastDate.getDate() + 3); // Monday is 3 days after Friday
    
    const pad = (n: number) => String(n).padStart(2, '0');
    
    const updatedDays = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'].map((name, idx) => {
      const currentDay = new Date(nextMonday);
      currentDay.setDate(nextMonday.getDate() + idx);
      const dateStr = `${pad(currentDay.getDate())}/${pad(currentDay.getMonth() + 1)}`;
      return { name, date: dateStr };
    });
    
    setNewWeekDays(updatedDays);
    const monStr = updatedDays[0].date;
    const friStr = updatedDays[4].date;
    setNewWeekLabel(`Semana (${monStr} - ${friStr})`);
  };

  useEffect(() => {
    if (showAddWeekModal) {
      autoProposeNextWeek();
    }
  }, [showAddWeekModal]);

  const [editingRow, setEditingRow] = useState<{
    week: number;
    index: number;
    dia: string;
    actividad: string;
    observaciones: string;
  } | null>(null);

  // Count context students
  const countDomiciliarios = students.filter(s => s.contexto === 'Domicilio' && (s.estado || 'Activo') === 'Activo').length;
  const countHospitalarios = students.filter(s => s.contexto === 'Hospital' && (s.estado || 'Activo') === 'Activo').length;
  const countHogar = students.filter(s => s.contexto === 'Hogar' && (s.estado || 'Activo') === 'Activo').length;

  const totalActivos = students.filter(s => (s.estado || 'Activo') === 'Activo').length;
  const totalAltas = students.filter(s => s.estado === 'Alta médica').length;

  const filteredResources = resources.filter(r =>
    r.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.materia.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-primary-container text-on-primary-container p-8 md:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-2xl flex-1">
          <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-3 inline-block">
            Carpeta Didáctica de Alvarez Liliana
          </span>
          <h1 className="font-headline-lg text-3xl md:text-4xl mb-4 font-bold">¡Hola, Liliana!</h1>
          <p className="font-body-lg text-lg opacity-90 leading-relaxed italic">
            "Un espacio de aprendizaje pensado para cada estudiante."
          </p>
          <div className="mt-8 flex flex-wrap gap-y-4 gap-x-6 items-center">
            <div className="flex flex-col">
              <span className="text-[32px] font-bold">{totalActivos}</span>
              <span className="text-xs uppercase tracking-wider opacity-80">Alumnos Activos</span>
            </div>
            {totalAltas > 0 && (
              <>
                <div className="w-[1px] h-12 bg-white/20 mx-2 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[32px] font-bold text-teal-200">{totalAltas}</span>
                  <span className="text-xs uppercase tracking-wider text-teal-100 font-semibold">Altas Médicas</span>
                </div>
              </>
            )}
            <div className="w-[1px] h-12 bg-white/20 mx-2 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-[32px] font-bold">4</span>
              <span className="text-xs uppercase tracking-wider opacity-80">Planificaciones Hoy</span>
            </div>
          </div>
        </div>

        {/* Dynamic decorative image */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 flex items-center justify-center">
          <img
            src={welcomeImg}
            alt="Ilustración Carpeta Didáctica"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-2xl drop-shadow-md transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </section>

      {/* Standalone HTML Deployment Callout */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-outline-variant rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">download_for_offline</span>
            Exportar Carpeta Didáctica Completa (Sitio Autónomo)
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Descargá tu sitio completo en un <b>único archivo HTML autónomo</b> para guardarlo en tu computadora o subirlo directamente a tu GitHub Pages. Incluye todos tus alumnos actuales, planificaciones y clases registradas para abrir y usar sin conexión a internet en cualquier lugar.
          </p>
        </div>
        <button
          onClick={onDownloadSite}
          disabled={isExporting}
          className={`px-5 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg hover:opacity-90 active:scale-[0.98] flex items-center gap-2.5 shrink-0 whitespace-nowrap ${
            isExporting ? 'opacity-65 cursor-not-allowed' : ''
          }`}
        >
          <span className={`material-symbols-outlined text-base ${isExporting ? 'animate-spin' : ''}`}>
            {isExporting ? 'sync' : 'download'}
          </span>
          {isExporting ? 'Preparando archivo...' : 'Descargar Archivo HTML Único'}
        </button>
      </section>

      {/* Interactive Weekly Planning Spreadsheet (Carpeta Didáctica Oficial) */}
      <section className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-3xl p-6 shadow-md space-y-6">
        <div className="border-b border-outline-variant pb-4 space-y-4">
          <div className="space-y-1 text-left">
            <span className="text-[10px] md:text-[11px] font-bold text-primary tracking-widest uppercase block">
              Gobierno de la Ciudad Autónoma de Buenos Aires · Ministerio de Educación
            </span>
            <h2 className="font-headline-sm text-lg md:text-xl font-extrabold flex items-center gap-3 text-on-surface tracking-tight">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm shrink-0">
                <span className="material-symbols-outlined text-xl">grid_on</span>
              </span>
              <span>Planilla de seguimiento pedagógico semanal</span>
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Escuela Especial Domiciliaria N° 1 "Dr. Pedro Ignacio Rivera" · Distrito Escolar 12
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-outline-variant/30">
            {/* Local Week Selector */}
            <div className="flex flex-col gap-1.5 shrink-0 align-left text-left">
              <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low dark:bg-surface-dim p-1.5 rounded-2xl border border-outline-variant">
                {weeks.map((week) => (
                  <button 
                    key={week.id}
                    onClick={() => setActiveWeek(week.id)}
                    className={`px-3 py-1 text-xs font-extrabold transition-all rounded-xl outline-none cursor-pointer ${
                      activeWeek === week.id 
                        ? 'bg-primary text-white shadow-xs' 
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {week.label}
                  </button>
                ))}
                
                {/* Plus button to add a new week */}
                <button
                  onClick={() => setShowAddWeekModal(true)}
                  className="w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/25 transition-all outline-none cursor-pointer flex items-center justify-center shadow-xs active:scale-95"
                  title="Agregar una nueva semana consecutiva automáticamente"
                >
                  <span className="material-symbols-outlined text-sm font-bold">add</span>
                </button>
              </div>

              {/* Inline controls to manage the active week */}
              <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-semibold px-2">
                <button
                  onClick={() => {
                    const current = weeks.find(w => w.id === activeWeek);
                    if (current) {
                      setRenameWeekId(current.id);
                      setRenameWeekLabel(current.label);
                    }
                  }}
                  className="hover:text-primary flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Renombrar la semana seleccionada"
                >
                  <span className="material-symbols-outlined text-[12px]">edit</span>
                  <span>Renombrar</span>
                </button>
                
                {weeks.length > 1 && (
                  <button
                    onClick={() => setWeekToDeleteId(activeWeek)}
                    className="hover:text-red-600 flex items-center gap-0.5 transition-colors cursor-pointer text-red-500/70"
                    title="Eliminar esta semana por completo"
                  >
                    <span className="material-symbols-outlined text-[12px]">delete</span>
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic spreadsheet tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSyncWizard(true)}
                className="px-3 py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 rounded-full text-[11px] font-extrabold transition-all border border-secondary-container/40 flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                title="Sincronizar automáticamente la planilla con actividades del sitio"
              >
                <span className="material-symbols-outlined text-xs font-bold">sync</span>
                <span>Sincronizar Actividades</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExternalConfig(!showExternalConfig)}
                className={`px-3 py-2 rounded-full text-[11px] font-extrabold transition-all border flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 ${
                  externalSheetUrl 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-300/40' 
                    : 'bg-neutral-100 text-on-surface border-neutral-300/40 hover:bg-neutral-200'
                }`}
                title="Vincular con tu planilla oficial de Google Sheets"
              >
                <span className="material-symbols-outlined text-xs font-bold">link</span>
                <span>{externalSheetUrl ? 'Planilla Vinculada' : 'Vincular Externa'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* External Sheet Config Panel */}
        {showExternalConfig && (
          <div className="bg-surface-container-low dark:bg-surface-dim border border-outline-variant rounded-2xl p-4 md:p-5 space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">settings_ethernet</span>
                Configuración de Planilla Externa (Google Drive / Sheets)
              </span>
              <button 
                onClick={() => setShowExternalConfig(false)}
                className="text-on-surface-variant hover:text-on-surface material-symbols-outlined text-xs p-1"
              >
                close
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Para vincular esta carpeta didáctica con tu planilla de seguimiento semanal externa (por ejemplo, tu documento oficial cargado en <b>Google Sheets</b>), pega aquí el enlace. Esto te permitirá acceder a ella y sincronizarla fácilmente desde tu sitio.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nombre del Archivo Linkeado</label>
                <input
                  type="text"
                  placeholder="Ej: Planilla Seguimiento Semanal - Liliana"
                  value={externalSheetTitle}
                  onChange={(e) => {
                    setExternalSheetTitle(e.target.value);
                    localStorage.setItem('carp_external_sheet_title', e.target.value);
                  }}
                  className="w-full p-2 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Enlace a Google Sheets / Drive</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: https://docs.google.com/spreadsheets/d/..."
                    value={externalSheetUrl}
                    onChange={(e) => {
                      setExternalSheetUrl(e.target.value);
                      localStorage.setItem('carp_external_sheet_url', e.target.value);
                    }}
                    className="w-full pl-8 pr-2 py-2 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    table_chart
                  </span>
                </div>
              </div>
            </div>
            {externalSheetUrl && (
              <div className="bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs font-semibold gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  ¡Enlace guardado correctamente! Ya está listo tu acceso directo rápido.
                </span>
                <a
                  href={externalSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg border border-emerald-750 inline-flex items-center gap-1 cursor-pointer shadow-sm transition-all text-[11px]"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  <span>Abrir Planilla</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Connected shortcut card (always visible below header if URL exists for instant action) */}
        {externalSheetUrl && !showExternalConfig && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/10 dark:to-teal-950/10 border border-emerald-350 dark:border-emerald-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <span className="material-symbols-outlined text-sm font-bold text-emerald-600">table_chart</span>
                Acceso Rápido a Planilla Oficial Vinculada
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
                El sitio está vinculado a: <strong className="font-bold text-emerald-700 dark:text-emerald-400">{externalSheetTitle}</strong>. Puedes abrirla en Google Sheets para realizar tu carga de clases.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowExternalConfig(true)}
                className="px-3 py-1.5 text-[10px] font-bold text-on-surface-variant hover:bg-neutral-150 rounded-lg border border-outline-variant bg-white dark:bg-inverse-surface transition-all cursor-pointer"
              >
                Cambiar Enlace
              </button>
              <a
                href={externalSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg shadow-sm border border-emerald-750 flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-md"
              >
                <span className="material-symbols-outlined text-xs">open_in_new</span>
                <span>Abrir en Google Sheets</span>
              </a>
            </div>
          </div>
        )}

        {/* The Spreadsheet Grid */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-dim text-on-surface border-b border-outline-variant uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4 w-28">Día / Fecha</th>
                <th className="py-3 px-4 w-52">Alumno / Institución (H. Fernández / Hogar)</th>
                <th className="py-3 px-4">Contenido y Actividad</th>
                <th className="py-3 px-4 w-72">Observaciones de la Clase</th>
                <th className="py-3 px-4 w-20 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {((weeks.find(w => w.id === activeWeek) || weeks[0])?.rows || []).map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-surface-container-lowest/50 transition-colors ${
                    row.diaFeriado ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''
                  }`}
                >
                  {/* Day column */}
                  <td className="py-3 px-4 align-top font-bold text-on-surface">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs">{row.dia.split(' ')[0]}</span>
                      <span className="text-[10px] text-primary font-medium">{row.dia.split(' ')[1] || ''}</span>
                    </div>
                  </td>
                  
                  {/* Students column */}
                  <td className="py-3 px-4 align-top">
                    {row.alumnos.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {row.alumnos.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between gap-1 bg-primary-container/40 hover:bg-primary-container/60 text-primary text-[11px] px-2 py-1 rounded-md border border-primary/10 transition-all font-semibold w-full group relative"
                          >
                            <button
                              onClick={() => {
                                const std = students.find(s => s.id === st.id);
                                if (std) {
                                  if (std.contexto === 'Domicilio') setActiveTab('domiciliarios');
                                  else if (std.contexto === 'Hospital') setActiveTab('hospitalarios');
                                  else if (std.contexto === 'Hogar') setActiveTab('hogar');
                                }
                              }}
                              className="text-left flex-1 min-w-0 outline-none cursor-pointer active:scale-[0.98]"
                              title="Haz clic para ver la ficha completa"
                            >
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[11px] shrink-0">person_search</span>
                                <span className="truncate block font-bold text-[11px]">{st.nombre}</span>
                              </div>
                              <span className="text-[9px] block opacity-80 pl-4">{st.det}</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStudentToRemove({
                                  id: st.id,
                                  nombre: st.nombre,
                                  dia: row.dia,
                                  rowIdx: idx,
                                  week: activeWeek
                                });
                              }}
                              className="w-4 h-4 rounded-full hover:bg-red-50 text-red-600/60 hover:text-red-600 dark:hover:bg-red-950/40 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                              title="Quitar de este día de clase"
                            >
                              <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-on-surface-variant italic text-[11px]">
                        {row.diaFeriado ? 'Feriado Nacional' : 'Sin traslados registrados'}
                      </span>
                    )}
                  </td>
                  
                  {/* Content & Activity */}
                  <td className="py-3 px-4 align-top text-on-surface leading-relaxed text-[11px] whitespace-pre-wrap">
                    <div className="font-semibold text-primary mb-1 text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">edit_note</span>
                      Actividad Planificada
                    </div>
                    {renderTextWithLinks(row.actividad)}
                  </td>
                  
                  {/* Observations */}
                  <td className="py-3 px-4 align-top text-on-surface leading-relaxed text-[11px] whitespace-pre-wrap">
                    <div className="font-semibold text-secondary mb-1 text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">chat_bubble_outline</span>
                      Observación Pedagógica
                    </div>
                    <div className="text-on-surface-variant leading-normal">
                      {renderTextWithLinks(row.observaciones)}
                    </div>
                  </td>
                  
                  {/* Action */}
                  <td className="py-3 px-4 align-top text-center">
                    <button
                      onClick={() => setEditingRow({
                        week: activeWeek,
                        index: idx,
                        dia: row.dia,
                        actividad: row.actividad,
                        observaciones: row.observaciones
                      })}
                      className="p-1 px-2.5 bg-neutral-100 hover:bg-primary hover:text-white rounded text-[10px] font-bold transition-all duration-200 border border-neutral-300/40 text-on-surface"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Helpful hints and link to school email */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-on-surface-variant gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">contact_support</span>
            ¿Necesitas contactar a Liliana? Correo Oficial: 
            <a href="mailto:profe.liliana.alvarez@gmail.com" className="text-primary hover:underline font-bold">profe.liliana.alvarez@gmail.com</a>
          </span>
          <span className="text-caption font-medium italic">
            * Haz clic en los alumnos para ver su ficha, o en "Carpeta Didáctica Domi1" para abrir la aplicación web externa vinculada.
          </span>
        </div>
      </section>

      {/* Inline Editing Spreadsheet Dialog/Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-2xl max-w-lg w-full p-6 border border-outline-variant shadow-2xl relative space-y-4"
          >
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="font-headline-sm text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit_calendar</span>
                Editar Celda: {editingRow.dia}
              </h3>
              <button 
                onClick={() => setEditingRow(null)}
                className="text-on-surface-variant hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Contenido y Actividad</label>
                <textarea
                  rows={3}
                  value={editingRow.actividad}
                  onChange={(e) => setEditingRow({ ...editingRow, actividad: e.target.value })}
                  className="w-full p-2.5 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Observaciones de la Clase</label>
                <textarea
                  rows={3}
                  value={editingRow.observaciones}
                  onChange={(e) => setEditingRow({ ...editingRow, observaciones: e.target.value })}
                  className="w-full p-2.5 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingRow(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setWeeks(prevWeeks => prevWeeks.map(w => {
                    if (w.id === editingRow.week) {
                      return {
                        ...w,
                        rows: w.rows.map((r, i) => {
                          if (i === editingRow.index) {
                            return {
                              ...r,
                              actividad: editingRow.actividad,
                              observaciones: editingRow.observaciones
                            };
                          }
                          return r;
                        })
                      };
                    }
                    return w;
                  }));
                  setEditingRow(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
              >
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Confirmation Modal for Removing Student */}
      {studentToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-2xl max-w-sm w-full p-6 border border-outline-variant shadow-2xl relative space-y-4"
          >
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                ¿Quitar alumno?
              </h3>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              ¿Estás segura de que deseas quitar a <strong className="font-bold text-on-surface">{studentToRemove.nombre}</strong> de la asistencia del día <strong className="font-bold text-on-surface">{studentToRemove.dia}</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStudentToRemove(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setWeeks(prevWeeks => prevWeeks.map(w => {
                    if (w.id === studentToRemove.week) {
                      return {
                        ...w,
                        rows: w.rows.map((r, rIdx) => {
                          if (rIdx === studentToRemove.rowIdx) {
                            return {
                              ...r,
                              alumnos: r.alumnos.filter(a => a.id !== studentToRemove.id)
                            };
                          }
                          return r;
                        })
                      };
                    }
                    return w;
                  }));
                  setStudentToRemove(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Quitar Alumno
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sincronizar Actividades Smart wizard modal */}
      {showSyncWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-3xl max-w-3xl w-full p-6 border border-outline-variant shadow-2xl relative flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-sm font-bold">sync</span>
                </span>
                <div className="text-left">
                  <h3 className="font-headline text-sm font-bold text-on-surface">
                    Asistente de Sincronización de Clases
                  </h3>
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    Actualiza tu Planilla Semanal importando planificaciones existentes en 1 clic
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowSyncWizard(false);
                  setSelectedWizardActivityId(null);
                }}
                className="text-on-surface-variant hover:text-on-surface material-symbols-outlined p-1 cursor-pointer hover:bg-neutral-100 rounded-full"
              >
                close
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto py-4 space-y-4 flex-1">
              {!activities || activities.length === 0 ? (
                <div className="p-8 text-center bg-surface-container-low border border-dashed border-outline-variant rounded-2xl flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-outline-variant">edit_note</span>
                  <p className="text-xs font-semibold text-on-surface-variant italic">
                    No se encontraron planificaciones cargadas en el sitio.
                  </p>
                  <p className="text-[11px] text-on-surface-variant max-w-sm">
                    Para sincronizar, primero debes agregar proyectos o actividades en las pestañas de <b>Domiciliarios</b>, <b>Hospitalarios</b> o <b>Hogar Juanito</b>.
                  </p>
                  <button
                    onClick={() => {
                      setShowSyncWizard(false);
                      openPlanningModal();
                    }}
                    className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow cursor-pointer active:scale-95 transition-all text-center animate-bounce"
                  >
                    Crear Nueva Planificación
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-stretch">
                  {/* Left Column: List of site activities */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block text-left">
                      Selecciona una Planificación Activa:
                    </span>
                    <div className="space-y-2">
                      {activities.map((act) => {
                        const student = students.find(s => s.id === act.studentId);
                        const isSelected = selectedWizardActivityId === act.id;
                        
                        return (
                          <div
                            key={act.id}
                            onClick={() => setSelectedWizardActivityId(act.id)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs flex flex-col gap-1.5 ${
                              isSelected
                                ? 'bg-primary-container/20 border-primary shadow-sm ring-1 ring-primary'
                                : 'bg-surface-container-low dark:bg-surface-dim hover:bg-surface-container-high border-outline-variant'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2.5">
                              <span className="text-[11px] font-bold text-on-surface truncate">
                                {student ? `${student.nombre} ${student.apellido}` : 'Estudiante Desconocido'}
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                student?.contexto === 'Domicilio' ? 'bg-blue-50 text-blue-700 font-bold' :
                                student?.contexto === 'Hospital' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-amber-50 text-amber-700 font-bold'
                              }`}>
                                {student?.contexto === 'Domicilio' ? 'Domicilio' :
                                 student?.contexto === 'Hospital' ? 'Hospital' : 'Hogar'}
                              </span>
                            </div>
                            <div className="text-[10px] space-y-0.5 font-medium leading-relaxed text-on-surface">
                              <div><strong className="text-primary">{act.materia}</strong>: {act.tema}</div>
                              <p className="text-on-surface-variant line-clamp-2 italic">{act.descripcion}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Settings & apply */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col justify-between max-h-[50vh] overflow-y-auto">
                    {selectedWizardActivityId ? (() => {
                      const selectedAct = activities.find(a => a.id === selectedWizardActivityId);
                      const selectedStudent = students.find(s => s?.id === selectedAct?.studentId);
                      
                      const selectedWeekObj = weeks.find(w => w.id === wizardTargetWeek) || weeks[0];
                      const targetWeekDays = selectedWeekObj ? selectedWeekObj.rows.map(r => r.dia) : [];

                      return (
                        <div className="space-y-4 flex-1 flex flex-col justify-between text-left">
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                              Destino y Opciones
                            </span>

                            {/* Row selection */}
                            <div className="space-y-2">
                              <div>
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">1. Elegir Semana</label>
                                <select
                                  value={wizardTargetWeek}
                                  onChange={(e) => setWizardTargetWeek(Number(e.target.value))}
                                  className="w-full p-2 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface text-on-surface outline-none"
                                >
                                  {weeks.map((w) => (
                                    <option key={w.id} value={w.id}>
                                      {w.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">2. Elegir Día</label>
                                <select
                                  value={wizardTargetDayIdx}
                                  onChange={(e) => setWizardTargetDayIdx(Number(e.target.value))}
                                  className="w-full p-2 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface text-on-surface outline-none"
                                >
                                  {targetWeekDays.map((dayName, idx) => (
                                    <option key={idx} value={idx}>
                                      {dayName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Sync settings toggle */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="checkbox"
                                id="syncObs"
                                checked={wizardSyncObservaciones}
                                onChange={(e) => setWizardSyncObservaciones(e.target.checked)}
                                className="rounded border-outline-variant text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <label htmlFor="syncObs" className="text-[10px] font-semibold text-on-surface-variant select-none cursor-pointer">
                                Autocompletar observaciones por defecto
                              </label>
                            </div>

                            {/* Small preview block */}
                            <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-2.5 space-y-1.5 text-[10px]">
                              <div className="font-bold text-primary">Acción a realizar:</div>
                              <div className="grid grid-cols-2 gap-1 bg-white p-1.5 rounded-md border border-neutral-150 font-medium text-on-surface">
                                <div className="text-on-surface-variant">Alumno:</div>
                                <div className="font-bold">{selectedStudent?.nombre}</div>
                                <div className="text-on-surface-variant">Día:</div>
                                <div className="font-bold text-primary">{targetWeekDays[wizardTargetDayIdx] || 'No definido'}</div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (!selectedAct || !selectedStudent) return;
                              
                              // Deduce institution / context string
                              let det = 'Domicilio';
                              if (selectedStudent.contexto === 'Hospital') {
                                det = selectedStudent.salaDetail || 'Hospital Fernández';
                              } else if (selectedStudent.contexto === 'Hogar') {
                                det = 'Hogar Juanito';
                              } else {
                                det = 'Domi' + (selectedStudent.id.includes('1') ? '1' : '2');
                              }

                              const studentEntry = {
                                id: selectedStudent.id,
                                nombre: `${selectedStudent.nombre} ${selectedStudent.apellido}`,
                                det: det
                              };

                              setWeeks(prevWeeks => prevWeeks.map(w => {
                                if (w.id === wizardTargetWeek) {
                                  return {
                                    ...w,
                                    rows: w.rows.map((row, rowIdx) => {
                                      if (rowIdx === wizardTargetDayIdx) {
                                        // 1. Append student if not in there
                                        const hasStudent = row.alumnos.some((s: any) => s.id === selectedStudent.id);
                                        const updatedAlumnos = hasStudent ? row.alumnos : [...row.alumnos, studentEntry];
                                        
                                        // 2. Format activity text
                                        const materialHeader = `${selectedAct.materia}: ${selectedAct.tema}.`;
                                        const activityDesc = selectedAct.descripcion;
                                        const fullActText = `${materialHeader} ${activityDesc}.`;

                                        // Append or replace if row was default empty/minimal
                                        let newActividad = row.actividad;
                                        if (!newActividad || newActividad.includes('Preparación de materiales') || newActividad.includes('Trabajo adaptado individual') || !!row.diaFeriado || newActividad.includes('Algoritmo de división decimal mediante juego')) {
                                          newActividad = fullActText;
                                        } else if (!newActividad.includes(selectedAct.tema)) {
                                          newActividad = newActividad ? `${newActividad}\n• ${fullActText}` : fullActText;
                                        }

                                        // 3. Observations text
                                        let newObservations = row.observaciones || '';
                                        if (wizardSyncObservaciones) {
                                          const obsText = `${selectedStudent.nombre}: progreso satisfactorio en contenido de ${selectedAct.materia}. Carpeta Didáctica.`;
                                          if (!newObservations || newObservations.includes('Carpeta Didáctica Domi1 (Asentado en folios)')) {
                                            newObservations = obsText;
                                          } else if (!newObservations.includes(selectedStudent.nombre)) {
                                            newObservations = newObservations ? `${newObservations} ${obsText}` : obsText;
                                          }
                                        }

                                        return {
                                          ...row,
                                          diaFeriado: false, // Override if active
                                          alumnos: updatedAlumnos,
                                          actividad: newActividad,
                                          observaciones: newObservations
                                        };
                                      }
                                      return row;
                                    })
                                  };
                                }
                                return w;
                              }));

                              // Done!
                              setShowSyncWizard(false);
                              setSelectedWizardActivityId(null);
                            }}
                            className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 mt-4"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">add_task</span>
                            <span>Sincronizar y Cargar a la Planilla</span>
                          </button>
                        </div>
                      );
                    })() : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-on-surface-variant gap-2 py-10">
                        <span className="material-symbols-outlined text-2xl text-outline-variant">info</span>
                        <p className="text-xs font-semibold italic">Siguiente paso:</p>
                        <p className="text-[10px] text-on-surface-variant max-w-[200px]">
                          Selecciona una planificación de la columna izquierda para configurar su asignación.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-outline-variant pt-3 flex justify-between items-center text-[10px] text-on-surface-variant font-medium shrink-0">
              <span>* Los cambios se guardan localmente para descargar en tu archivo HTML.</span>
              <button 
                onClick={() => {
                  setShowSyncWizard(false);
                  setSelectedWizardActivityId(null);
                }}
                className="px-4 py-2 border border-outline-variant hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg font-bold text-on-surface cursor-pointer text-xs"
              >
                Cerrar Ayudante
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bento summaries of contexts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Domiciliarios Card */}
        <div className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-700">
                <span className="material-symbols-outlined text-[28px]">house</span>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">DOMICILIARIOS</span>
            </div>
            
            <div className="space-y-4 mb-6">
              {students.filter(s => s.contexto === 'Domicilio').slice(0, 2).map((s) => (
                <div key={s.id} className="flex flex-col gap-1 border-b border-dashed border-outline-variant pb-3">
                  <span className="text-on-surface font-semibold text-sm">{s.nombre} {s.apellido}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant italic truncate max-w-44">
                      {s.diagnostico}
                    </span>
                    <span className={`text-[11px] font-bold ${
                      (s.estado || 'Activo') === 'Alta médica'
                        ? 'text-teal-600 dark:text-teal-400'
                        : (s.estado || 'Activo') === 'Activo'
                        ? 'text-primary'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {(s.estado || 'Activo') === 'Activo' ? `${s.fechaProxVisita} ${s.horaProxVisita}` : s.estado}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-on-surface-variant">Alumnos Domiciliarios</span>
                <span className="font-bold text-primary text-base">{String(countDomiciliarios).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('domiciliarios')}
            className="w-full py-3 bg-surface-container-low dark:bg-surface-container text-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white"
          >
            Ver Listado Completo
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Hospitalarios Card */}
        <div className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
                <span className="material-symbols-outlined text-[28px]">festival</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">HOSPITALARIOS</span>
            </div>
            
            <div className="space-y-4 mb-6">
              {students.filter(s => s.contexto === 'Hospital').slice(0, 2).map((s) => (
                <div key={s.id} className="flex flex-col gap-1 border-b border-dashed border-outline-variant pb-3">
                  <span className="text-on-surface font-semibold text-sm">{s.nombre} {s.apellido}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant italic truncate max-w-44">
                      {s.salaDetail}
                    </span>
                    <span className={`text-[11px] font-bold ${
                      (s.estado || 'Activo') === 'Alta médica'
                        ? 'text-teal-600 dark:text-teal-400'
                        : (s.estado || 'Activo') === 'Activo'
                        ? 'text-secondary'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {s.estado || 'Activo'}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-on-surface-variant">Alumnos Hospitalarios</span>
                <span className="font-bold text-secondary text-base">{String(countHospitalarios).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('hospitalarios')}
            className="w-full py-3 bg-surface-container-low dark:bg-surface-container text-secondary font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-secondary group-hover:text-white"
          >
            Panel Hospitalario
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Hogar Juanito Card */}
        <div className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-700">
                <span className="material-symbols-outlined text-[28px]">child_care</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">HOGAR JUANITO</span>
            </div>
            
            <div className="space-y-4 mb-6">
              {students.filter(s => s.contexto === 'Hogar').slice(0, 2).map((s) => (
                <div key={s.id} className="flex flex-col gap-1 border-b border-dashed border-outline-variant pb-3">
                  <span className="text-on-surface font-semibold text-sm font-bold">{s.nombre} {s.apellido}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-on-surface-variant italic truncate max-w-44">
                      {s.diagnostico}
                    </span>
                    <span className={`text-[11px] font-bold ${
                      (s.estado || 'Activo') === 'Alta médica'
                        ? 'text-teal-600 dark:text-teal-400'
                        : (s.estado || 'Activo') === 'Activo'
                        ? 'text-tertiary'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {s.estado || 'Activo'}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-on-surface-variant">Alumnos en el Hogar</span>
                <span className="font-bold text-tertiary text-base">{String(countHogar).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('hogar')}
            className="w-full py-3 bg-surface-container-low dark:bg-surface-container text-tertiary font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-tertiary group-hover:text-white"
          >
            Ver Actividades Hogar
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

      </section>

      {/* Resources & Materials Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-headline-sm text-lg font-bold text-on-surface">Actividades y Recursos Pedagógicos</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar recurso..."
              className="pl-9 pr-4 py-1.5 bg-white dark:bg-inverse-surface border border-outline-variant rounded-full text-xs font-body-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all w-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredResources.map((res, index) => {
            let colorClass = 'bg-primary/10 text-primary';
            let icon = 'calculate';
            if (res.materia === 'CUENTOS' || res.materia === 'Cuentos') {
              colorClass = 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300';
              icon = 'auto_stories';
            } else if (res.materia.startsWith('C.')) {
              colorClass = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700';
              icon = 'recycling';
            } else if (res.materia.startsWith('P.')) {
              colorClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700';
              icon = 'menu_book';
            } else if (res.materia.startsWith('Pla')) {
              colorClass = 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300';
              icon = 'laptop_chromebook';
            } else if (res.materia.startsWith('Tec')) {
              colorClass = 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300';
              icon = 'smart_toy';
            } else if (res.materia.startsWith('Esc') || res.materia === 'Escuelas Verdes') {
              colorClass = 'bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300';
              icon = 'forest';
            }

            return (
              <div
                key={res.id || index}
                onClick={() => onDownloadResource(res)}
                className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between text-left cursor-pointer"
              >
                <div className="h-32 overflow-hidden relative group-hover:opacity-90 transition-colors">
                  {res.imageUrl ? (
                    <img
                      src={res.imageUrl}
                      alt={res.titulo}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`h-full w-full ${colorClass} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[48px]">
                        {icon}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-on-surface mb-1 text-sm">{res.titulo}</h3>
                    <p className="text-caption text-on-surface-variant leading-tight">{res.descripcion}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${colorClass}`}>
                      {res.materia}
                    </span>
                    <div className="flex items-center gap-2">
                      {res.id.startsWith('custom-ext-') && onDeleteCustomResource && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('¿Estás segura de que deseas eliminar este recurso personalizado?')) {
                              onDeleteCustomResource(res.id);
                            }
                          }}
                          className="material-symbols-outlined text-[18px] text-rose-500 hover:text-rose-700 transition-colors hover:scale-110 cursor-pointer"
                          title="Eliminar recurso personalizado"
                        >
                          delete
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadResource(res);
                        }}
                        className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors hover:scale-110 cursor-pointer"
                        title={res.url ? "Abrir Recurso Externo" : "Habilitar Recurso Interactivo"}
                      >
                        {res.url ? 'launch' : 'download'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredResources.length === 0 && (
            <div className="col-span-full py-8 text-center text-on-surface-variant italic">
              No se encontraron recursos pedagógicos con "{searchQuery}"
            </div>
          )}
        </div>
      </section>

      {showAddWeekModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-3xl max-w-md w-full p-6 border border-outline-variant shadow-2xl relative space-y-4 text-left"
          >
            <div className="flex items-center justify-between animate-fade-in">
              <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Crear Nueva Semana
              </h3>
              <button 
                onClick={() => setShowAddWeekModal(false)}
                className="text-on-surface-variant hover:text-on-surface material-symbols-outlined cursor-pointer"
              >
                close
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nombre / Etiqueta de la Semana</label>
                <input
                  type="text"
                  value={newWeekLabel}
                  onChange={(e) => setNewWeekLabel(e.target.value)}
                  placeholder="Ej: Semana (08/06 - 12/06)"
                  className="w-full p-2 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface text-on-surface outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-[10px] text-gray-505 italic">Generada automáticamente a partir del fin de la anterior.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase block">Fechas de los Días</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {newWeekDays.map((day, dIdx) => (
                    <div key={day.name} className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-850 p-1.5 rounded-lg border border-neutral-200/50">
                      <span className="text-[10px] font-bold text-on-surface shrink-0 w-20">{day.name}</span>
                      <input
                        type="text"
                        value={day.date}
                        placeholder="DD/MM"
                        onChange={(e) => {
                          const updated = [...newWeekDays];
                          updated[dIdx].date = e.target.value;
                          setNewWeekDays(updated);
                          
                          const startDay = updated[0].date;
                          const endDay = updated[4].date;
                          if (startDay || endDay) {
                            setNewWeekLabel(`Semana (${startDay || '...'} - ${endDay || '...'})`);
                          }
                        }}
                        className="flex-1 p-1 px-2 border border-outline-variant rounded-md text-xs bg-white dark:bg-inverse-surface text-on-surface outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddWeekModal(false)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!newWeekLabel.trim()) return;
                  
                  const rows = newWeekDays.map(d => ({
                    dia: `${d.name} ${d.date}`,
                    alumnos: [],
                    actividad: '',
                    observaciones: ''
                  }));

                  const newId = weeks.length > 0 ? Math.max(...weeks.map(w => w.id)) + 1 : 1;
                  const newWeeks = [...weeks, {
                    id: newId,
                    label: newWeekLabel,
                    rows: rows
                  }];

                  setWeeks(newWeeks);
                  setActiveWeek(newId);
                  setShowAddWeekModal(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Crear Semana
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {renameWeekId !== null && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-2xl max-w-sm w-full p-6 border border-outline-variant shadow-2xl relative space-y-4 text-left"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface flex items-center gap-1 text-sm">
                <span className="material-symbols-outlined text-primary text-base">edit</span>
                Renombrar Semana
              </h3>
              <button 
                onClick={() => setRenameWeekId(null)}
                className="text-on-surface-variant hover:text-on-surface material-symbols-outlined cursor-pointer text-sm"
              >
                close
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase">Nuevo Nombre / Fecha</label>
              <input
                type="text"
                value={renameWeekLabel}
                onChange={(e) => setRenameWeekLabel(e.target.value)}
                placeholder="Ej: Semana (08/06 - 12/06)"
                className="w-full p-2 border border-outline-variant rounded-xl text-xs bg-white dark:bg-inverse-surface text-on-surface outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRenameWeekId(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!renameWeekLabel.trim()) return;
                  setWeeks(prevWeeks => prevWeeks.map(w => {
                    if (w.id === renameWeekId) {
                      return { ...w, label: renameWeekLabel };
                    }
                    return w;
                  }));
                  setRenameWeekId(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {weekToDeleteId !== null && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-2xl max-w-sm w-full p-6 border border-outline-variant shadow-2xl relative space-y-4 text-left"
          >
            <div className="flex items-center gap-2.5 text-red-600">
              <span className="material-symbols-outlined text-2xl font-bold">warning</span>
              <h3 className="font-bold text-on-surface text-sm">
                ¿Eliminar Semana?
              </h3>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              ¿Estás segura de que deseas eliminar la <strong className="font-bold text-on-surface">{(weeks.find(w => w.id === weekToDeleteId))?.label}</strong> por completo? Se perderán todas las asistencias y actividades anotadas en ella.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setWeekToDeleteId(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const filteredWeeks = weeks.filter(w => w.id !== weekToDeleteId);
                  
                  if (activeWeek === weekToDeleteId) {
                    const fallback = filteredWeeks[0];
                    if (fallback) {
                      setActiveWeek(fallback.id);
                    }
                  }

                  setWeeks(filteredWeeks);
                  setWeekToDeleteId(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Eliminar Semana
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
