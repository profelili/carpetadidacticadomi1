import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ResourceMaterial, Student } from '../types';

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
  setActiveTab: (tab: string) => void;
  openPlanningModal: () => void;
  onDownloadResource: (res: ResourceMaterial) => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  students,
  resources,
  setActiveTab,
  openPlanningModal,
  onDownloadResource,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(16); // Martes 16 default
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeWeek, setActiveWeek] = useState<1 | 2>(1);

  const [studentToRemove, setStudentToRemove] = useState<{
    id: string;
    nombre: string;
    dia: string;
    rowIdx: number;
    week: 1 | 2;
  } | null>(null);

  const [week1Rows, setWeek1Rows] = useState(() => {
    try {
      const saved = localStorage.getItem('carp_week1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing carp_week1 from localStorage', e);
    }
    return [
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
          { id: 'hosp-3', font: 'Martina Juarez', nombre: 'Martina Juarez', det: 'Hospital Fernández' },
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
  });

  const [week2Rows, setWeek2Rows] = useState(() => {
    try {
      const saved = localStorage.getItem('carp_week2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing carp_week2 from localStorage', e);
    }
    return [
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
          { id: 'hosp-2', font: 'Santino', nombre: 'Santino', det: 'Hospital Fernández' },
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
  });

  useEffect(() => {
    try {
      localStorage.setItem('carp_week1', JSON.stringify(week1Rows));
    } catch (e) {
      console.error('Failed to save carp_week1 to localStorage:', e);
    }
  }, [week1Rows]);

  useEffect(() => {
    try {
      localStorage.setItem('carp_week2', JSON.stringify(week2Rows));
    } catch (e) {
      console.error('Failed to save carp_week2 to localStorage:', e);
    }
  }, [week2Rows]);

  const [editingRow, setEditingRow] = useState<{
    week: 1 | 2;
    index: number;
    dia: string;
    actividad: string;
    observaciones: string;
  } | null>(null);

  // Count context students
  const countDomiciliarios = students.filter(s => s.contexto === 'Domicilio').length;
  const countHospitalarios = students.filter(s => s.contexto === 'Hospital').length;
  const countHogar = students.filter(s => s.contexto === 'Hogar').length;

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
            "Enseñar es dejar una huella en la vida de una persona para siempre. Hoy es un gran día para transformar realidades en la Escuela Especial Domiciliaria N°1."
          </p>
          <div className="mt-8 flex gap-6">
            <div className="flex flex-col">
              <span className="text-[32px] font-bold">{students.length}</span>
              <span className="text-xs uppercase tracking-wider opacity-80">Alumnos Activos</span>
            </div>
            <div className="w-[1px] h-12 bg-white/20 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[32px] font-bold">4</span>
              <span className="text-xs uppercase tracking-wider opacity-80">Planificaciones Hoy</span>
            </div>
          </div>
        </div>

        {/* Dynamic decorative image */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 flex items-center justify-center">
          <img
            src="/src/assets/images/welcome_hero_steps_1780775091527.png"
            alt="Ilustración Carpeta Didáctica"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-2xl drop-shadow-md transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </section>

      {/* Interactive Weekly Planning Spreadsheet (Carpeta Didáctica Oficial) */}
      <section className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-3xl p-6 shadow-md space-y-6">
        <div className="border-b border-outline-variant pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
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
            
            <div className="flex items-center gap-2 bg-surface-container-low dark:bg-surface-dim p-1.5 rounded-full border border-outline-variant">
              <button 
                onClick={() => setActiveWeek(1)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeWeek === 1 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Semana 1 (26/05 - 29/05)
              </button>
              <button 
                onClick={() => setActiveWeek(2)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeWeek === 2 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Semana 2 (01/06 - 05/06)
              </button>
            </div>
          </div>
        </div>

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
              {(activeWeek === 1 ? week1Rows : week2Rows).map((row, idx) => (
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
            ¿Necesitas contactar a secretaría? Correo Oficial: 
            <a href="mailto:edom1_de12@bue.edu.ar" className="text-primary hover:underline font-bold">edom1_de12@bue.edu.ar</a>
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
                  const setRows = editingRow.week === 1 ? setWeek1Rows : setWeek2Rows;
                  setRows(prev => prev.map((r, i) => {
                    if (i === editingRow.index) {
                      return {
                        ...r,
                        actividad: editingRow.actividad,
                        observaciones: editingRow.observaciones
                      };
                    }
                    return r;
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
                  const setRows = studentToRemove.week === 1 ? setWeek1Rows : setWeek2Rows;
                  setRows(prev => prev.map((r, rIdx) => {
                    if (rIdx === studentToRemove.rowIdx) {
                      return {
                        ...r,
                        alumnos: r.alumnos.filter(a => a.id !== studentToRemove.id)
                      };
                    }
                    return r;
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
                    <span className="text-[11px] font-bold text-primary">{s.fechaProxVisita} {s.horaProxVisita}</span>
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
                    <span className="text-[11px] font-bold text-secondary">Activo</span>
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
                    <span className="text-[11px] font-bold text-tertiary">Activo</span>
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
            if (res.materia.startsWith('C.')) {
              colorClass = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700';
              icon = 'recycling';
            } else if (res.materia.startsWith('P.')) {
              colorClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700';
              icon = 'menu_book';
            } else if (res.materia.startsWith('Pla')) {
              colorClass = 'bg-blue-50 dark:bg-blue-950/20 text-blue-700';
              icon = 'brush';
            }

            return (
              <div
                key={res.id || index}
                className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between text-left"
              >
                <div className={`h-32 ${colorClass} flex items-center justify-center group-hover:opacity-90 transition-colors`}>
                  <span className="material-symbols-outlined text-[48px]">
                    {icon}
                  </span>
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
                    <button
                      onClick={() => onDownloadResource(res)}
                      className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors hover:scale-110"
                    >
                      download
                    </button>
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
    </motion.div>
  );
};
