import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Student, ActivityPlan, VisitaRegistro, AttachedFile } from '../types';
import { parseGoogleDriveUrl } from '../lib/drive';

const renderTextWithLinks = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-bold inline-flex items-center gap-0.5 break-all"
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

interface DomiciliariosViewProps {
  students: Student[];
  activities: ActivityPlan[];
  onOpenPlanningModal: (studentId?: string) => void;
  onEditActivity?: (act: ActivityPlan) => void;
  onDeleteActivity?: (id: string) => void;
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
}

export const DomiciliariosView: React.FC<DomiciliariosViewProps> = ({
  students,
  activities,
  onOpenPlanningModal,
  onEditActivity,
  onDeleteActivity,
  selectedStudentId: selectedStudentIdProp,
  onSelectStudent,
}) => {
  const domiciliarios = students.filter(s => s.contexto === 'Domicilio');
  const [selectedStudentId, setSelectedDayStudentId] = useState<string>(
    selectedStudentIdProp || domiciliarios[0]?.id || ''
  );

  useEffect(() => {
    if (selectedStudentIdProp) {
      setSelectedDayStudentId(selectedStudentIdProp);
    }
  }, [selectedStudentIdProp]);

  const selectedStudent = domiciliarios.find(s => s.id === selectedStudentId);

  // Filter activities for this selected student
  const studentActivities = activities.filter(
    a => a.studentId === selectedStudentId
  );

  // Visita history state (persistent)
  const [visitHistory, setVisitHistory] = useState<VisitaRegistro[]>(() => {
    try {
      const saved = localStorage.getItem('carp_visit_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing carp_visit_history from localStorage', e);
    }
    return [
      {
        id: 'v-1',
        studentId: 'dom-1',
        fecha: '05/06/2026',
        hora: '09:00',
        actividadesRealizadas: 'Comprensión Lectora - Fichas adaptadas (Nivel 1)',
        observaciones: 'Mostró mucho interés por la lectura de pictogramas de animales.',
        estadoAnimo: 'Excelente'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('carp_visit_history', JSON.stringify(visitHistory));
    } catch (e) {
      console.error('Failed to save carp_visit_history to localStorage:', e);
    }
  }, [visitHistory]);

  // Handle visit register form
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [newVisitFecha, setNewVisitFecha] = useState('2026-06-06');
  const [newVisitHora, setNewVisitHora] = useState('10:00');
  const [newVisitAct, setNewVisitAct] = useState('');
  const [newVisitObs, setNewVisitObs] = useState('');
  const [newVisitAnimo, setNewVisitAnimo] = useState('Muy bueno');

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitAct) return;

    const newVisit: VisitaRegistro = {
      id: 'v-' + Date.now(),
      studentId: selectedStudentId,
      fecha: newVisitFecha.split('-').reverse().join('/'),
      hora: newVisitHora,
      actividadesRealizadas: newVisitAct,
      observaciones: newVisitObs,
      estadoAnimo: newVisitAnimo
    };

    setVisitHistory([newVisit, ...visitHistory]);
    setShowVisitForm(false);
    setNewVisitAct('');
    setNewVisitObs('');
    alert('Visita pedagógica registrada exitosamente.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full"
    >
      {/* Left panel: Active Students */}
      <section className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline-sm text-lg font-bold text-primary">Alumnos</h3>
          <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {domiciliarios.length} Activos
          </span>
        </div>
        
        <div className="space-y-4">
          {domiciliarios.map(student => {
            const isSelected = student.id === selectedStudentId;
            return (
              <button
                key={student.id}
                onClick={() => {
                  setSelectedDayStudentId(student.id);
                  setShowVisitForm(false);
                  if (onSelectStudent) {
                    onSelectStudent(student.id);
                  }
                }}
                className={`w-full text-left p-5 rounded-2xl border transition-all student-shadow group ${
                  isSelected
                    ? 'border-primary ring-4 ring-primary-container/10 bg-white dark:bg-inverse-surface'
                    : 'border-outline-variant bg-white dark:bg-inverse-surface/40 hover:border-primary-container'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-headline-sm ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-primary-fixed text-primary'
                    }`}>
                      {student.avatarInitials}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                        {student.nombre} {student.apellido}
                      </h4>
                      <span className="bg-primary-container/20 text-on-primary-fixed-variant text-caption px-2.5 py-0.5 rounded-full font-medium">
                        {student.id === 'dom-1' ? 'Primaria - 4to Año' : 'Primaria - 6to Año'}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm pt-2 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">medical_services</span>
                    <span className="font-medium text-xs">Diag:</span>
                    <span className="truncate text-xs">{student.diagnostico}</span>
                  </div>
                  {student.fechaProxVisita && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      <span className="font-medium text-xs">Visita:</span>
                      <span className="text-xs">{student.fechaProxVisita}, {student.horaProxVisita}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Right panel: Details & Activities */}
      <section className="lg:col-span-8 flex flex-col gap-6">
        {selectedStudent ? (
          <>
            {/* Top title card */}
            <div className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">home_pin</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-xl text-on-surface font-bold">
                    Planificación Domiciliaria
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    {selectedStudent.nombre} {selectedStudent.apellido} • Escuela de origen:{' '}
                    {selectedStudent.escuela}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => onOpenPlanningModal(selectedStudentId)}
                className="bg-primary text-on-primary font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:opacity-90 transition-all self-start sm:self-auto shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Nueva Planificación
              </button>
            </div>

            {/* Activities grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between animate-fade-in text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-surface-container-high rounded-xl text-primary">
                          <span className="material-symbols-outlined text-lg">
                            {activity.materia === 'Matemática' || activity.materia === 'Matemática Básica'
                              ? 'calculate'
                              : 'menu_book'}
                          </span>
                        </span>
                        <h4 className="font-bold text-on-surface text-base">{activity.materia}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-primary-container/20 text-on-primary-fixed-variant px-3 py-1 rounded-full">
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
                    <p className="font-bold text-on-surface text-sm mb-1">{activity.tema}</p>
                    <div className="text-xs text-on-surface-variant leading-relaxed mb-4 whitespace-pre-wrap">
                      {renderTextWithLinks(activity.descripcion)}
                    </div>

                    {renderAttachedFiles(activity.attachedFiles)}

                    {activity.enlaceUrl && (() => {
                      const driveInfo = parseGoogleDriveUrl(activity.enlaceUrl);
                      if (driveInfo) {
                        return (
                          <div className="mb-4 space-y-2">
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
                        <div className="mb-4">
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
                  </div>

                  <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">extension</span>
                      {activity.recursoClave || 'Sin recursos'}
                    </span>
                    <div className="flex gap-2">
                      {activity.tags.map(tag => (
                        <span key={tag} className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Observations Card */}
            {selectedStudent.observaciones && (
              <div className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                  <h4 className="font-bold text-on-surface text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">monitor_heart</span>
                    Observaciones de Bienestar & Salud
                  </h4>
                  <span className="text-xs text-on-surface-variant italic">
                    Actualizado: {selectedStudent.observaciones.ultimaActualizacion}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background dark:bg-inverse-surface/50 p-4 border border-outline-variant/30 rounded-2xl">
                    <h5 className="font-bold text-primary text-xs mb-2">
                      {selectedStudent.observaciones.titulo1}
                    </h5>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {selectedStudent.observaciones.desc1}
                    </p>
                  </div>
                  <div className="bg-background dark:bg-inverse-surface/50 p-4 border border-outline-variant/30 rounded-2xl">
                    <h5 className="font-bold text-secondary text-xs mb-2">
                      {selectedStudent.observaciones.titulo2}
                    </h5>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {selectedStudent.observaciones.desc2}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Visit card section */}
            <div className="bg-primary text-on-primary rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute -right-4 -bottom-4 opacity-15">
                <span className="material-symbols-outlined text-[130px] text-white">
                  home_health
                </span>
              </div>
              <div className="z-10">
                <h4 className="font-headline-sm text-lg text-white font-bold mb-1">
                  Visitas Pedagógicas Registradas
                </h4>
                <p className="text-primary-fixed text-xs max-w-md">
                  Inscribe reportes de cada visita para garantizar la continuidad pedagógica domiciliaria.
                </p>
              </div>
              <button
                onClick={() => setShowVisitForm(!showVisitForm)}
                className="bg-white text-primary font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all text-xs z-10 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">history_edu</span>
                {showVisitForm ? 'Ocultar Formulario' : 'Registrar Visita'}
              </button>
            </div>

            {/* Inline Visit Form */}
            {showVisitForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleAddVisit}
                className="bg-white dark:bg-inverse-surface border border-primary p-6 rounded-2xl shadow-sm space-y-4"
              >
                <h4 className="font-bold text-on-surface text-sm">Registrar Nueva Visita</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Fecha</label>
                    <input
                      type="date"
                      value={newVisitFecha}
                      onChange={e => setNewVisitFecha(e.target.value)}
                      className="rounded-xl border-outline-variant bg-surface hover:border-primary-container text-xs transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Hora de Inicio</label>
                    <input
                      type="time"
                      value={newVisitHora}
                      onChange={e => setNewVisitHora(e.target.value)}
                      className="rounded-xl border-outline-variant bg-surface hover:border-primary-container text-xs transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Estado de Ánimo</label>
                    <select
                      value={newVisitAnimo}
                      onChange={e => setNewVisitAnimo(e.target.value)}
                      className="rounded-xl border-outline-variant bg-surface hover:border-primary-container text-xs transition-colors"
                    >
                      <option>Excelente</option>
                      <option>Muy bueno</option>
                      <option>Colaborativo</option>
                      <option>Apático / Cansado</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Actividades Realizadas</label>
                  <input
                    type="text"
                    value={newVisitAct}
                    onChange={e => setNewVisitAct(e.target.value)}
                    placeholder="Ej: Sumas repetidas con apoyo de material concreto o lectura activa."
                    className="rounded-xl border-outline-variant bg-surface hover:border-primary-container text-xs transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Observaciones Pedagógicas</label>
                  <textarea
                    value={newVisitObs}
                    onChange={e => setNewVisitObs(e.target.value)}
                    placeholder="Observaciones de avance o adaptaciones necesarias..."
                    rows={2}
                    className="rounded-xl border-outline-variant bg-surface hover:border-primary-container text-xs transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVisitForm(false)}
                    className="px-4 py-2 hover:bg-surface-container-high rounded-full font-bold text-on-surface-variant"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 shadow-sm"
                  >
                    Guardar Reporte
                  </button>
                </div>
              </motion.form>
            )}

            {/* Visit history display list */}
            <div className="bg-white dark:bg-inverse-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-on-surface text-sm mb-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">history</span>
                Historial de Visitas Pedagógicas
              </h4>
              <div className="space-y-4">
                {visitHistory
                  .filter(v => v.studentId === selectedStudentId)
                  .map(log => (
                    <div
                      key={log.id}
                      className="border-b border-outline-variant/30 pb-4 last:border-none last:pb-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-primary">
                          📅 {log.fecha} a las {log.hora} hs
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Ánimo: {log.estadoAnimo}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface font-semibold">
                        {renderTextWithLinks(log.actividadesRealizadas)}
                      </p>
                      {log.observaciones && (
                        <p className="text-xs text-on-surface-variant italic mt-1 bg-background dark:bg-inverse-surface/50 p-2 rounded-lg">
                          Observaciones: {renderTextWithLinks(log.observaciones)}
                        </p>
                      )}
                    </div>
                  ))}
                {visitHistory.filter(v => v.studentId === selectedStudentId).length === 0 && (
                  <p className="text-xs text-on-surface-variant italic text-center py-4">
                    No hay visitas registradas para este alumno aún.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-on-surface-variant italic">
            Selecciona un alumno domiciliario activo para visualizar su planificación y visitas.
          </div>
        )}
      </section>
    </motion.div>
  );
};
