import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Student, ActivityPlan, AttachedFile, ResourceMaterial } from '../types';
import { DEFAULT_RESOURCES } from '../data';
import { parseGoogleDriveUrl } from '../lib/drive';
import tallerImg from '../assets/images/escuelas_verdes_taller_1781302131421.jpg';

const renderTextWithLinks = (text: string) => {
  if (!text) return null;
  const urlRegex = /((?:https?:\/\/|www\.)[^\s()<>]+|(?:gemini|drive)\.google\.com\/[^\s()<>]+)/gi;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      let href = part;
      if (!/^https?:\/\//i.test(href)) {
        href = 'https://' + href;
      }
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-bold inline-flex items-center gap-0.5 break-all cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-[11px] inline-block">open_in_new</span>
          {part}
        </a>
      );
    }
    return part;
  });
};

const renderAttachedFiles = (files?: AttachedFile[]) => {
  if (!files || files.length === 0) return null;
  return (
    <div className="mt-4 mb-4 space-y-2.5 border-t border-outline-variant/30 pt-3 text-left">
      <p className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
        <span className="material-symbols-outlined text-xs">attach_file</span>
        Archivos / Videos Adjuntos ({files.length})
      </p>
      <div className="grid grid-cols-1 gap-2.5">
        {files.map((file, idx) => {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

          return (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant flex items-center">
                    {isVideo ? 'videocam' : isImage ? 'image' : isPdf ? 'picture_as_pdf' : 'insert_drive_file'}
                  </span>
                  <span className="font-mono text-[11px] truncate text-on-surface font-medium" title={file.name}>
                    {file.name}
                  </span>
                </div>
                <a
                  href={file.dataUrl}
                  download={file.name}
                  className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all border border-primary/20 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[12px]">download</span>
                  <span>Descargar</span>
                </a>
              </div>

              {/* Preview image */}
              {isImage && (
                <div className="relative group overflow-hidden rounded-lg border border-outline-variant/30 max-h-40 bg-neutral-50 flex justify-center">
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="max-h-40 object-contain hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Play video */}
              {isVideo && (
                <div className="rounded-lg overflow-hidden border border-outline-variant/30 bg-black">
                  <video
                    src={file.dataUrl}
                    controls
                    className="w-full max-h-48 object-contain"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface HogarViewProps {
  students: Student[];
  activities: ActivityPlan[];
  onOpenPlanningModal: (studentId?: string) => void;
  onEditActivity?: (act: ActivityPlan) => void;
  onDeleteActivity?: (id: string) => void;
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
  onRestoreHogarActivities?: () => void;
  onPreviewResource?: (res: ResourceMaterial) => void;
}

export const HogarView: React.FC<HogarViewProps> = ({
  students,
  activities,
  onOpenPlanningModal,
  onEditActivity,
  onDeleteActivity,
  selectedStudentId: selectedStudentIdProp,
  onSelectStudent,
  onRestoreHogarActivities,
  onPreviewResource,
}) => {
  const hogarStudents = students.filter(s => s.contexto === 'Hogar');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    selectedStudentIdProp || hogarStudents[0]?.id || ''
  );

  useEffect(() => {
    if (selectedStudentIdProp) {
      setSelectedStudentId(selectedStudentIdProp);
    }
  }, [selectedStudentIdProp]);

  const selectedStudent = hogarStudents.find(s => s.id === selectedStudentId);

  // Filter activities for this selected student
  const studentActivities = activities.filter(
    a => a.studentId === selectedStudentId
  );

  const defaultHogars = [
    { id: 'act-5', studentId: 'hog-1', name: 'Termofusión (Giovani Baden)' },
    { id: 'act-6', studentId: 'hog-2', name: 'Termofusión (Mario Sarmiento)' }
  ];
  const missingHogarDefaultActivities = defaultHogars.filter(
    def => !activities.some(act => act.id === def.id)
  );

  // Modals / Mini game inside Hogar Juanito context
  const [showProtocolGuideline, setShowProtocolGuideline] = useState(false);
  const [showGame, setShowGame] = useState(false);
  
  // Game states
  const [gameScore, setGameScore] = useState(0);
  const [gameFeedback, setGameScoreFeedback] = useState('¡Clasifica los siguientes materiales!');
  const [currentTrashIndex, setCurrentTrashIndex] = useState(0);
  
  const trashItems = [
    { name: 'Bolsa de polietileno', type: 'plastico', icon: '🛍️' },
    { name: 'Frasco de mermelada', type: 'vidrio', icon: '🫙' },
    { name: 'Cáscara de banana', type: 'organico', icon: '🍌' },
    { name: 'Tetra brick de leche', type: 'reciclable', icon: '🥛' },
    { name: 'Papel de diario', type: 'papel', icon: '📰' },
    { name: 'Lata de refresco', type: 'metal', icon: '🥫' }
  ];

  const handleGameOptionClick = (type: string) => {
    const current = trashItems[currentTrashIndex];
    if (type === 'organico' && current.type === 'organico') {
      setGameScore(gameScore + 10);
      setGameScoreFeedback('¡Excelente! Va para compost orgánico.');
    } else if (type === 'reciclable' && (current.type === 'plastico' || current.type === 'vidrio' || current.type === 'papel' || current.type === 'metal' || current.type === 'reciclable')) {
      setGameScore(gameScore + 10);
      setGameScoreFeedback('¡Perfecto! Va directo al cesto verde de reciclaje.');
    } else {
      setGameScoreFeedback('Cuidado, ese material requiere otra clasificación.');
    }

    if (currentTrashIndex < trashItems.length - 1) {
      setCurrentTrashIndex(currentTrashIndex + 1);
    } else {
      setGameScoreFeedback(`¡Muy bien! Completaste el juego. Puntaje final: ${gameScore + 10}/60`);
      setTimeout(() => {
        setCurrentTrashIndex(0);
        setGameScore(0);
      }, 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full"
    >
      {/* Left panel: Active Students list */}
      <section className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline-sm text-lg font-bold text-primary">Alumnos Activos</h3>
          <span className="bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-xs font-bold font-caption">
            {hogarStudents.length} alumnos
          </span>
        </div>
        
        <div className="space-y-3">
          {hogarStudents.map(student => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                onClick={() => {
                  setSelectedStudentId(student.id);
                  if (onSelectStudent) {
                    onSelectStudent(student.id);
                  }
                }}
                className={`w-full text-left p-3 rounded-xl border card-shadow flex items-center justify-between transition-all group ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/10 bg-white'
                    : 'border-outline-variant bg-white hover:border-primary cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-primary-fixed text-primary'
                  }`}>
                    {student.avatarInitials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-on-surface text-sm">{student.nombre} {student.apellido}</span>
                    <span className="text-caption text-secondary font-medium">
                      {student.diagnostico || 'Educación especial'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-[18px]">chevron_right</span>
              </button>
            );
          })}
        </div>

        <div className="bg-primary-container/10 p-4 rounded-2xl border border-primary-container/20">
          <h3 className="font-bold text-xs text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">info</span>
            Recordatorio Semanal
          </h3>
          <p className="text-caption text-on-surface-variant leading-relaxed">
            Revisar stock de bolsas de polietileno para el taller del viernes. Coordinar con cooperadora para comprar guantes protectores extra.
          </p>
        </div>
      </section>

      {/* Right panel: Activity dashboard & bento columns */}
      <section className="lg:col-span-9 space-y-6">

        {/* Main Taller Termofusion Bento Card */}
        <article className="bg-white dark:bg-inverse-surface rounded-3xl border border-outline-variant card-shadow overflow-hidden group">
          <div className="relative h-64 w-full">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              alt="Taller de Termofusion en el Hogar Juanito"
              src={tallerImg}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
            <div className="absolute bottom-6 left-8 text-white">
              <span className="bg-secondary text-white text-[10px] px-3 py-1 rounded-full font-bold mb-2 inline-block">
                Proyecto Escuelas Verdes
              </span>
              <h2 className="font-headline-md text-xl md:text-2xl font-bold">
                Taller de Escuelas Verdes
              </h2>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-lg text-xs font-semibold">
                #ConsumoResponsable
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-lg text-xs font-semibold">
                #Termofusión
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-lg text-xs font-semibold">
                #EscuelasVerdes
              </span>
              <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-lg text-xs font-semibold">
                #EconomiaCircular
              </span>
            </div>

            <div>
              <h3 className="text-on-surface font-headline-sm mb-3">Descripción de la Actividad</h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Los alumnos explorarán el proceso de transformación de residuos plásticos (bolsas de polietileno de baja densidad) en nuevos materiales textiles mediante calor controlado. Este proceso fomenta la conciencia ambiental y el desarrollo de habilidades motrices finas.
              </p>
            </div>

            <div className="bg-error-container/20 border-l-4 border-error p-4 rounded-r-xl">
              <h4 className="font-bold text-on-error-container text-xs flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                Protocolo de Seguridad
              </h4>
              <ul className="text-xs text-on-error-container space-y-1.5 list-disc pl-4 font-semibold">
                <li>Uso obligatorio de guantes térmicos durante el prensado.</li>
                <li>Ambiente con ventilación cruzada activa.</li>
                <li>Distancia mínima de 1 metro respecto a las planchas térmicas.</li>
              </ul>
            </div>

            {/* Actions for Termofusión (Verify guidelines: trigger detailed game & guidelines popup) */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setShowProtocolGuideline(true)}
                className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs hover:shadow-lg active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                Ver Guía de Protocolo
              </button>
              <button
                onClick={() => setShowGame(true)}
                className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs hover:bg-secondary/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">extension</span>
                Juego: Clasificador de Residuos
              </button>
            </div>
          </div>
        </article>

        {/* Custom Planned Activities */}
        <div className="space-y-4 animate-fade-in text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-base flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary">calendar_today</span>
              Otras Planificaciones Personalizadas (Hogar)
            </h3>
            {selectedStudentId && (
              <button
                onClick={() => onOpenPlanningModal(selectedStudentId)}
                className="flex items-center gap-1 text-primary hover:bg-primary/10 text-xs px-3 py-1.5 rounded-xl font-bold border border-primary/20 transition-all shadow-xs cursor-pointer bg-primary/5"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                <span>Planificar Actividad</span>
              </button>
            )}
          </div>

          {missingHogarDefaultActivities.length > 0 && onRestoreHogarActivities && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-3xl shrink-0">info_outline</span>
                <div className="text-left">
                  <h4 className="font-bold text-emerald-850 dark:text-emerald-400 text-sm">Se detectaron actividades sugeridas eliminadas</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-normal mt-0.5">
                    Faltan planes por defecto de Hogar Juanito: <strong className="text-emerald-700 dark:text-emerald-300">{missingHogarDefaultActivities.map(a => a.name).join(' e ')}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={onRestoreHogarActivities}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 inline-flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">restore</span>
                Restaurar sugeridos
              </button>
            </div>
          )}

          {studentActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-primary-container/10 text-primary rounded-xl">
                          <span className="material-symbols-outlined text-sm">assignment</span>
                        </span>
                        <h4 className="font-bold text-on-surface text-sm">{activity.materia}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          {activity.estado}
                        </span>
                        {onEditActivity && (
                          <button
                            onClick={() => onEditActivity(activity)}
                            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer border border-primary/20 bg-primary/5 shrink-0"
                            title="Modificar planificación"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        )}
                        {onDeleteActivity && (
                          <button
                            onClick={() => onDeleteActivity(activity.id)}
                            className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/15 rounded-full transition-colors cursor-pointer border border-error/20 bg-error/5 shrink-0"
                            title="Eliminar planificación"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-on-surface text-xs mb-1">{activity.tema}</p>
                    <div className="text-xs text-on-surface-variant leading-relaxed mb-4 whitespace-pre-wrap">
                      {renderTextWithLinks(activity.descripcion)}
                    </div>

                    {renderAttachedFiles(activity.attachedFiles)}

                    {activity.enlaceUrl && (() => {
                      const driveInfo = parseGoogleDriveUrl(activity.enlaceUrl);
                      if (driveInfo) {
                        return (
                          <div className="mb-4 space-y-2 text-left">
                            <a
                              href={activity.enlaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-emerald-550/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl transition-all border border-emerald-500/20 shadow-xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">{driveInfo.icon}</span>
                              <span>{activity.enlaceTitulo || driveInfo.typeName}</span>
                            </a>
                            {driveInfo.previewUrl && (
                              <div className="relative group overflow-hidden rounded-xl border border-outline-variant/30 max-h-48 bg-neutral-100 flex justify-center">
                                <img
                                  src={driveInfo.previewUrl}
                                  alt="Vista previa de Google Drive"
                                  className="max-h-48 object-contain hover:scale-102 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 text-white text-[9px] uppercase font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                                  <span className="material-symbols-outlined text-xs text-emerald-400">add_to_drive</span>
                                  <span>Google Drive</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="mb-4 text-left">
                          <a
                            href={activity.enlaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-xl transition-all border border-primary/20 shadow-sm cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">link</span>
                            <span>{activity.enlaceTitulo || 'Ver Enlace Adjunto'}</span>
                          </a>
                        </div>
                      );
                    })()}
                    {(() => {
                      const txtValue = (activity.recursoClave || '').trim();
                      if (!txtValue) return null;

                      // Load custom external resources dynamically
                      let customList: ResourceMaterial[] = [];
                      try {
                        const stored = localStorage.getItem('custom_external_resources');
                        if (stored) customList = JSON.parse(stored);
                      } catch (e) {
                        console.error(e);
                      }

                      const allResources = [...DEFAULT_RESOURCES, ...customList];
                      const matched = allResources.find(r => 
                        r.titulo.toLowerCase() === txtValue.toLowerCase() ||
                        txtValue.toLowerCase().includes(r.titulo.toLowerCase()) ||
                        r.titulo.toLowerCase().includes(txtValue.toLowerCase())
                      );

                      if (matched) {
                        if (matched.url) {
                          return (
                            <a
                              href={matched.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mb-4 w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="material-symbols-outlined text-base">language</span>
                              <span>🌐 Abrir Recurso Externo: {matched.titulo}</span>
                            </a>
                          );
                        } else if (onPreviewResource) {
                          return (
                            <button
                              type="button"
                              onClick={() => onPreviewResource(matched)}
                              className="mb-4 w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                            >
                              <span className="material-symbols-outlined text-base">smart_toy</span>
                              <span>🎮 Jugar con Recurso Adaptado: {matched.titulo}</span>
                            </button>
                          );
                        }
                      }

                      // Fallback matching logic for original identifiers to be thoroughly safe
                      let detectedId: string | null = null;
                      const txt = txtValue.toLowerCase();
                      if (txt.includes('pitagórica') || txt.includes('pitagorica') || txt.includes('tabla pit')) {
                        detectedId = 'res-1';
                      } else if (txt.includes('waldorf') || txt.includes('circulo') || txt.includes('círculo')) {
                        detectedId = 'res-2';
                      } else if (txt.includes('efemérides') || txt.includes('1810') || txt.includes('revolución') || txt.includes('revolucion')) {
                        detectedId = 'res-3';
                      } else if (txt.includes('termofusión') || txt.includes('termofusion') || txt.includes('seguridad de termo') || txt.includes('manual de seguridad')) {
                        detectedId = 'res-4';
                      } else if (txt.includes('mundial') || txt.includes('digital 2026') || txt.includes('mundial 2026')) {
                        detectedId = 'res-5';
                      }

                      if (detectedId && onPreviewResource) {
                        const mappedResource = DEFAULT_RESOURCES.find(r => r.id === detectedId);
                        if (mappedResource) {
                          return (
                            <button
                              type="button"
                              onClick={() => onPreviewResource(mappedResource)}
                              className="mb-4 w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                            >
                              <span className="material-symbols-outlined text-base">smart_toy</span>
                              <span>🎮 Jugar con Recurso Adaptado: {mappedResource.titulo}</span>
                            </button>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>

                  <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1 flex-wrap">
                      <span className="material-symbols-outlined text-[13px]">extension</span>
                      {(() => {
                        const recurso = activity.recursoClave;
                        if (!recurso) return 'Sin recursos';
                        const urlRegex = /((?:https?:\/\/|www\.)[^\s()<>]+|(?:gemini|drive)\.google\.com\/[^\s()<>]+)/gi;
                        const parts = recurso.split(urlRegex);
                        const matches = recurso.match(urlRegex);
                        if (matches) {
                          return (
                            <span className="flex flex-wrap items-center gap-1">
                              {parts.map((part, index) => {
                                if (part.match(urlRegex)) {
                                  let href = part;
                                  if (!/^https?:\/\//i.test(href)) {
                                    href = 'https://' + href;
                                  }
                                  return (
                                    <a
                                      key={index}
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-primary hover:underline font-bold bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-lg transition-all cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                      <span className="max-w-[160px] truncate">{part}</span>
                                    </a>
                                  );
                                }
                                return <span key={index}>{part}</span>;
                              })}
                            </span>
                          );
                        }
                        return recurso;
                      })()}
                    </span>
                    <div className="flex gap-1">
                      {activity.tags.map(tag => (
                        <span key={tag} className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-outline-variant rounded-2xl text-center bg-surface-container-lowest">
              <span className="material-symbols-outlined text-outline text-3xl mb-2">calendar_today</span>
              <p className="text-xs text-on-surface-variant italic mb-3">No hay otras planificaciones creadas para este alumno en Hogar.</p>
              {selectedStudentId && (
                <button
                  onClick={() => onOpenPlanningModal(selectedStudentId)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl transition-all shadow-sm hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                  <span>Nueva Planificación</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Secondary Bento Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white dark:bg-inverse-surface p-6 rounded-2xl border border-outline-variant card-shadow flex flex-col justify-between hover:border-primary transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">science</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-base">Ciencias Naturales</h3>
                <p className="text-xs text-on-surface-variant font-medium">Clasificación de Materiales</p>
              </div>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
              Laboratorio de texturas y resistencia. Comparativa entre plásticos vírgenes y termofusionados del taller hogareño.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-white text-[10px] flex items-center justify-center font-bold">AC</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-secondary text-white text-[10px] flex items-center justify-center font-bold">ME</div>
              </div>
              <button
                onClick={() => alert('Buscando archivos de laboratorio pedagógico en el Drive escolar...')}
                className="text-primary font-bold text-xs flex items-center gap-1 hover:underline"
              >
                Abrir carpeta <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-inverse-surface p-6 rounded-2xl border border-outline-variant card-shadow flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-on-surface text-sm mb-4">Métricas Semanales</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                    <span>Tiempo de conexión</span>
                    <span className="font-bold text-on-surface">18.5 hs / 20 hs</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1 font-semibold">
                    <span>Progreso del Proyecto</span>
                    <span className="font-bold text-secondary">78%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <div className="flex-1 bg-surface-container-low dark:bg-inverse-surface/40 p-2.5 rounded-lg text-center">
                <span className="block text-lg font-bold text-on-surface">24</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Actividades</span>
              </div>
              <div className="flex-1 bg-surface-container-low dark:bg-inverse-surface/40 p-2.5 rounded-lg text-center">
                <span className="block text-lg font-bold text-secondary">05</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Proyectos</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* GAME MODAL: Waste Sorter Game */}
      {showGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGame(false)}></div>
          <div className="relative bg-white dark:bg-inverse-surface rounded-2xl p-6 shadow-xl max-w-md w-full z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-outline-variant/30">
              <h4 className="font-headline-sm text-base text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">extension</span>
                Clasificador de Residuos Ecológico
              </h4>
              <button className="material-symbols-outlined text-on-surface" onClick={() => setShowGame(false)}>close</button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Ayuda a clasificar el siguiente descarte. Es el juego lúdico recomendado para interactuar en el Hogar Juanito.
            </p>

            <div className="bg-surface-container-low p-6 rounded-2xl text-center space-y-3">
              <div className="text-4xl animate-bounce">
                {trashItems[currentTrashIndex].icon}
              </div>
              <p className="font-bold text-sm text-on-surface">
                {trashItems[currentTrashIndex].name}
              </p>
              <div className="text-xs text-secondary font-bold py-1 bg-white inline-block px-4 rounded-full border border-secondary/20 shadow-sm">
                {gameFeedback}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => handleGameOptionClick('reciclable')}
                className="py-3 bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white rounded-xl font-bold transition-all shadow-sm"
              >
                ♻️ Cesto Reciclable (Plásticos/Cartón/Latas)
              </button>
              <button
                onClick={() => handleGameOptionClick('organico')}
                className="py-3 bg-tertiary-container/30 text-tertiary hover:bg-tertiary hover:text-white rounded-xl font-bold transition-all shadow-sm"
              >
                🍎 Compost Orgánico (Yerba/Cáscaras)
              </button>
            </div>

            <div className="flex justify-between items-center text-xs text-on-surface-variant font-bold pt-2 border-t border-outline-variant/30">
              <span>Puntaje: {gameScore} Pts</span>
              <span>Progreso: {currentTrashIndex + 1} / {trashItems.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* PROTOCOL MODAL: Safety Protocol Guide description */}
      {showProtocolGuideline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProtocolGuideline(false)}></div>
          <div className="relative bg-white dark:bg-inverse-surface rounded-2xl p-6 shadow-xl max-w-lg w-full z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-outline-variant/30">
              <h4 className="font-headline-sm text-base text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">description</span>
                Guía de Seguridad: Taller de Termofusión
              </h4>
              <button className="material-symbols-outlined text-on-surface" onClick={() => setShowProtocolGuideline(false)}>close</button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-on-surface max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <p className="font-bold text-sm">Escuela Especial Domiciliaria N°1 - Contexto Hogares Convivenciales</p>
              <p>
                La termofusión escolar de bolsas de plástico (PEBD) exige un cuidado riguroso. Este manual ha sido redactado colaborativamente para docentes que asisten de forma itinerante para asegurar el resguardo de la salud física.
              </p>
              
              <div className="p-3 bg-error-container/20 border-l-4 border-error rounded-r-xl">
                <strong>Paso 1: Preparación del material.</strong> El polietileno se debe higienizar primero con agua y jabón neutro, eliminando cualquier residuo graso u orgánico para prevenir gases molestos al aplicar calor.
              </div>

              <div className="p-3 bg-secondary-container/20 border-l-4 border-secondary rounded-r-xl">
                <strong>Paso 2: Prensado con papel manteca.</strong> Interponer *siempre* papel vegetal o manteca entre el plástico y la plancha térmica de hierro para evitar que se adhiera al metal caliente.
              </div>

              <p>
                <strong>Paso 3: Ventilación permanente.</strong> Aunque el PEBD no emana humos nocivos si está limpio, todo taller de calor debe llevarse a cabo junto a ventanas abiertas de par en par con corriente activa.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => setShowProtocolGuideline(false)}
                className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
