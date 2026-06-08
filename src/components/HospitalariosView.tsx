import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Student, ActivityPlan, AttachedFile } from '../types';
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

interface HospitalariosViewProps {
  students: Student[];
  activities: ActivityPlan[];
  onOpenPlanningModal: (studentId?: string) => void;
  onEditActivity?: (act: ActivityPlan) => void;
  onDeleteActivity?: (id: string) => void;
  selectedStudentId?: string;
  onSelectStudent?: (id: string) => void;
}

export const HospitalariosView: React.FC<HospitalariosViewProps> = ({
  students,
  activities,
  onOpenPlanningModal,
  onEditActivity,
  onDeleteActivity,
  selectedStudentId: selectedStudentIdProp,
  onSelectStudent,
}) => {
  const hospitalarios = students.filter(s => s.contexto === 'Hospital');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    selectedStudentIdProp || hospitalarios[0]?.id || ''
  );

  useEffect(() => {
    if (selectedStudentIdProp) {
      setSelectedStudentId(selectedStudentIdProp);
    }
  }, [selectedStudentIdProp]);

  const selectedStudent = hospitalarios.find(s => s.id === selectedStudentId);

  // Filter activities for this selected student
  const studentActivities = activities.filter(
    a => a.studentId === selectedStudentId
  );

  const otherActivities = studentActivities.filter(
    a => !['Matemática', 'Prácticas del Lenguaje', 'Expresión Artística'].includes(a.materia)
  );

  // Modals inside Hospitalarios
  const [showTableModal, setShowTableModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showWaldorfModal, setShowWaldorfModal] = useState(false);

  // Selected multiplication table row/col highlights
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  // Waldorf Multiplication interactive state
  const [waldorfNumber, setWaldorfNumber] = useState<number>(3); // Multiplier of 3 thread

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full"
    >
      {/* Left Panel: Student Selection */}
      <section className="lg:col-span-3 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline-sm text-lg font-bold text-primary">Alumnos</h3>
          <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {hospitalarios.length} Activos
          </span>
        </div>
        
        <div className="space-y-3">
          {hospitalarios.map(student => {
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
                className={`w-full text-left p-4 rounded-xl shadow-sm border transition-all ${
                  isSelected
                    ? 'glass-card border-primary ring-1 ring-primary/20 bg-surface-container-high'
                    : 'bg-white hover:bg-surface-container-low border-outline-variant group'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-variant text-outline group-hover:bg-primary-fixed group-hover:text-primary transition-colors'
                  }`}>
                    {student.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{student.nombre} {student.apellido}</h4>
                    <p className="text-xs text-on-surface-variant font-medium">{student.salaDetail}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Right Panel: Planning & Bento Activities */}
      <section className="lg:col-span-9 flex flex-col gap-6">
        {selectedStudent ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-xl text-on-surface font-semibold">Planificación Semanal</h3>
                <p className="text-sm text-on-surface-variant">
                  Seguimiento pedagógico para {selectedStudent.nombre} {selectedStudent.apellido} ({selectedStudent.salaDetail || 'Educación Hospitalaria'})
                </p>
              </div>
              
              <button
                onClick={() => onOpenPlanningModal(selectedStudentId)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold text-xs hover:shadow-lg transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                Planificar Actividad
              </button>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Mathematics Card */}
              {studentActivities.some(a => a.materia === 'Matemática') ? (
                studentActivities.filter(a => a.materia === 'Matemática').map(act => (
                  <article key={act.id} className="p-6 rounded-xl border border-outline-variant bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-primary-container text-on-primary-container rounded-lg">
                            <span className="material-symbols-outlined text-lg">calculate</span>
                          </span>
                          <h4 className="font-bold text-on-surface text-base">{act.materia}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                            {act.estado}
                          </span>
                          {onEditActivity && (
                            <button
                              onClick={() => onEditActivity(act)}
                              className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer border border-primary/20 bg-primary/5 shrink-0"
                              title="Modificar planificación"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                          )}
                          {onDeleteActivity && (
                            <button
                              onClick={() => onDeleteActivity(act.id)}
                              className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/15 rounded-full transition-colors cursor-pointer border border-error/20 bg-error/5 shrink-0"
                              title="Eliminar planificación"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-bold text-on-surface text-sm mb-1">{act.tema}</p>
                        <div className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {renderTextWithLinks(act.descripcion)}
                        </div>
                        {renderAttachedFiles(act.attachedFiles)}
                      </div>

                      {act.enlaceUrl && (() => {
                        const driveInfo = parseGoogleDriveUrl(act.enlaceUrl);
                        if (driveInfo) {
                          return (
                            <div className="mt-3 space-y-2">
                              <a
                                href={act.enlaceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-emerald-550/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-emerald-500/20 shadow-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">{driveInfo.icon}</span>
                                <span>{act.enlaceTitulo || driveInfo.typeName}</span>
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
                          <div className="mt-3">
                            <a
                              href={act.enlaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-primary/20"
                            >
                              <span className="material-symbols-outlined text-xs">link</span>
                              <span>{act.enlaceTitulo || 'Ver material'}</span>
                            </a>
                          </div>
                        );
                      })()}

                      <div className="flex flex-wrap gap-2 mt-4">
                        {act.tags.map(tag => (
                          <span key={tag} className="bg-surface-container text-on-surface-variant text-[10px] px-2.5 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                      <button
                        onClick={() => setShowTableModal(true)}
                        className="flex items-center gap-2 text-primary font-bold text-xs hover:underline"
                      >
                        <span className="material-symbols-outlined">grid_on</span>
                        Abrir Tabla Pitagórica
                      </button>
                      <span className="material-symbols-outlined text-outline">chevron_right</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="p-6 border border-outline-variant bg-white rounded-xl text-center italic text-on-surface-variant flex items-center justify-center">
                  Ninguna actividad cargada para matemática.
                </div>
              )}

              {/* Language Card */}
              {studentActivities.some(a => a.materia === 'Prácticas del Lenguaje') ? (
                studentActivities.filter(a => a.materia === 'Prácticas del Lenguaje').map(act => (
                  <article key={act.id} className="p-6 rounded-xl border border-outline-variant bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-tertiary-container text-on-tertiary-container rounded-lg">
                            <span className="material-symbols-outlined text-lg">auto_stories</span>
                          </span>
                          <h4 className="font-bold text-on-surface text-base">Prácticas del Lenguaje</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-surface-container text-on-surface-variant text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                            {act.estado}
                          </span>
                          {onEditActivity && (
                            <button
                              onClick={() => onEditActivity(act)}
                              className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer border border-primary/20 bg-primary/5 shrink-0"
                              title="Modificar planificación"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                          )}
                          {onDeleteActivity && (
                            <button
                              onClick={() => onDeleteActivity(act.id)}
                              className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/15 rounded-full transition-colors cursor-pointer border border-error/20 bg-error/5 shrink-0"
                              title="Eliminar planificación"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-bold text-on-surface mb-1 text-sm">{act.tema}</p>
                        <div className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {renderTextWithLinks(act.descripcion)}
                        </div>
                        {renderAttachedFiles(act.attachedFiles)}
                      </div>

                      {act.enlaceUrl && (() => {
                        const driveInfo = parseGoogleDriveUrl(act.enlaceUrl);
                        if (driveInfo) {
                          return (
                            <div className="mt-3 space-y-2">
                              <a
                                href={act.enlaceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-emerald-550/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-emerald-500/20 shadow-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">{driveInfo.icon}</span>
                                <span>{act.enlaceTitulo || driveInfo.typeName}</span>
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
                          <div className="mt-3">
                            <a
                              href={act.enlaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-primary/20"
                            >
                              <span className="material-symbols-outlined text-xs">link</span>
                              <span>{act.enlaceTitulo || 'Ver material'}</span>
                            </a>
                          </div>
                        );
                      })()}

                      <div className="flex flex-wrap gap-2 mt-4">
                        {act.tags.map(tag => (
                          <span key={tag} className="bg-surface-container text-on-surface-variant text-[10px] px-2.5 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between">
                      <button
                        onClick={() => setShowStoryModal(true)}
                        className="flex items-center gap-2 text-primary font-bold text-xs hover:underline"
                      >
                        <span className="material-symbols-outlined">description</span>
                        Ver cuento: El Gato con Botas
                      </button>
                      <span className="material-symbols-outlined text-outline">chevron_right</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="p-6 border border-outline-variant bg-white rounded-xl text-center italic text-on-surface-variant flex items-center justify-center">
                  Ninguna actividad cargada para prácticas del lenguaje.
                </div>
              )}

              {/* Arts / Waldorf Card */}
              {studentActivities.some(a => a.materia === 'Expresión Artística') ? (
                studentActivities.filter(a => a.materia === 'Expresión Artística').map(act => (
                  <article key={act.id} className="md:col-span-2 p-6 rounded-xl border border-outline-variant bg-white hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img
                        className="w-full h-44 object-cover rounded-lg"
                        alt="Círculo Waldorf de madera"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJq4p5kl68tntZi6xybOecqUr3bIRvHKGsxWZ2uXff01rLIz_zrtNc3WCAgQobaAlmBzTMjo1kNx5p7WiWweR28XhQ5OYXy2Ja1jj5Q2eeh0TyvJTNCKEjPpNlBQFxTZU6WGJYUd0Qk6fyqInWCyDU_wHxbre9P1cxQXsTYXgH0L04D3mmz1f4pQT8ekuiyz5ka6zP2yZuYZJoV0RPbLDYfFoHnMfCi4tIrSBnrCWbIZtVb8AiuhmpuXUtcBTXZqksQhg84cZGUG0"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-secondary-container text-on-secondary-container rounded-lg">
                              <span className="material-symbols-outlined text-lg">palette</span>
                            </span>
                            <h4 className="font-bold text-on-surface text-base">{act.materia}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-on-secondary-container text-on-secondary-container bg-opacity-10 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                              {act.estado}
                            </span>
                            {onEditActivity && (
                              <button
                                onClick={() => onEditActivity(act)}
                                className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer border border-primary/20 bg-primary/5 shrink-0"
                                title="Modificar planificación"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                            )}
                            {onDeleteActivity && (
                              <button
                                onClick={() => onDeleteActivity(act.id)}
                                className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/15 rounded-full transition-colors cursor-pointer border border-error/20 bg-error/5 shrink-0"
                                title="Eliminar planificación"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className="font-bold text-on-surface mb-1 text-sm">{act.tema}</p>
                        <div className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                          {renderTextWithLinks(act.descripcion)}
                        </div>

                        {renderAttachedFiles(act.attachedFiles)}

                        {act.enlaceUrl && (() => {
                          const driveInfo = parseGoogleDriveUrl(act.enlaceUrl);
                          if (driveInfo) {
                            return (
                              <div className="mt-3 space-y-2">
                                <a
                                  href={act.enlaceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-emerald-550/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-emerald-500/20 shadow-xs cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-xs">{driveInfo.icon}</span>
                                  <span>{act.enlaceTitulo || driveInfo.typeName}</span>
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
                            <div className="mt-3">
                              <a
                                href={act.enlaceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-primary/20"
                              >
                                <span className="material-symbols-outlined text-xs">link</span>
                                <span>{act.enlaceTitulo || 'Ver material'}</span>
                              </a>
                            </div>
                          );
                        })()}
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {act.tags.map(tag => (
                            <span key={tag} className="bg-surface-container text-on-surface-variant text-[10px] px-2.5 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowWaldorfModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg font-bold text-xs hover:bg-surface-container-highest transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">motion_photos_on</span>
                          Interactividad Círculo
                        </button>
                        <button
                          onClick={() => alert('Guía Audiovisual Pedagógica en desarrollo para docentes domiciliarias.')}
                          className="flex items-center gap-2 px-4 py-2 text-primary font-bold text-xs hover:bg-primary-fixed rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">videocam</span>
                          Guía Visual
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="md:col-span-2 p-6 border border-outline-variant bg-white rounded-xl text-center italic text-on-surface-variant">
                  Ninguna actividad transdisciplinar lúdica adjunta.
                </div>
              )}

              {/* Otras Materias / Ciencias Card */}
              {otherActivities.length > 0 && (
                <div className="md:col-span-2 space-y-4 text-left">
                  <h3 className="font-bold text-on-surface text-base flex items-center gap-1.5 mt-4">
                    <span className="material-symbols-outlined text-primary">science</span>
                    Ciencias Sociales, Naturales y Otras Planificaciones
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {otherActivities.map(act => (
                      <article key={act.id} className="p-6 rounded-xl border border-outline-variant bg-white hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="p-2 bg-primary-container/10 text-primary rounded-lg">
                                <span className="material-symbols-outlined text-lg">school</span>
                              </span>
                              <h4 className="font-bold text-on-surface text-base">{act.materia}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                {act.estado}
                              </span>
                              {onEditActivity && (
                                <button
                                  onClick={() => onEditActivity(act)}
                                  className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors cursor-pointer border border-primary/20 bg-primary/5 shrink-0"
                                  title="Modificar planificación"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                              )}
                              {onDeleteActivity && (
                                <button
                                  onClick={() => onDeleteActivity(act.id)}
                                  className="w-7 h-7 flex items-center justify-center text-error hover:bg-error/15 rounded-full transition-colors cursor-pointer border border-error/20 bg-error/5 shrink-0"
                                  title="Eliminar planificación"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="font-bold text-on-surface text-sm mb-1">{act.tema}</p>
                            <div className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                              {renderTextWithLinks(act.descripcion)}
                            </div>
                            {renderAttachedFiles(act.attachedFiles)}
                          </div>

                          {act.enlaceUrl && (() => {
                            const driveInfo = parseGoogleDriveUrl(act.enlaceUrl);
                            if (driveInfo) {
                              return (
                                <div className="mt-3 space-y-2">
                                  <a
                                    href={act.enlaceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-emerald-550/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-emerald-500/20 shadow-xs cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-xs">{driveInfo.icon}</span>
                                    <span>{act.enlaceTitulo || driveInfo.typeName}</span>
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
                              <div className="mt-3">
                                <a
                                  href={act.enlaceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border border-primary/20"
                                >
                                  <span className="material-symbols-outlined text-xs">link</span>
                                  <span>{act.enlaceTitulo || 'Ver material'}</span>
                                </a>
                              </div>
                            );
                          })()}

                          {act.recursoClave && (
                            <div className="flex flex-wrap gap-2 mt-4 font-mono text-[10px] text-primary bg-primary/5 px-2 py-1 rounded-lg w-max">
                              Recurso clave: {act.recursoClave}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-4">
                            {act.tags.map(tag => (
                              <span key={tag} className="bg-surface-container text-on-surface-variant text-[10px] px-2.5 py-0.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Summary Panel */}
            <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-around gap-6 text-center border border-outline-variant/40">
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Actividades Completadas</p>
                <p className="font-bold text-2xl text-primary mt-1">09 / 12</p>
              </div>
              <div className="w-[1px] h-10 bg-outline-variant hidden md:block"></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Horas de Clase</p>
                <p className="font-bold text-2xl text-primary mt-1">12.5 hs</p>
              </div>
              <div className="w-[1px] h-10 bg-outline-variant hidden md:block"></div>
              <div className="w-full md:w-auto flex-1 max-w-xs text-left">
                <p className="text-[10px] font-bold text-on-surface-variant mb-1.5 uppercase text-center md:text-left">Progreso Mensual</p>
                <div className="h-2 w-full bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-fixed-dim w-[82%] rounded-full"></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-on-surface-variant italic">
            Selecciona un alumno hospitalario activo para visualizar su planificación y actividades lúdicas.
          </div>
        )}
      </section>

      {/* MODAL 1: Pythagoras Table */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTableModal(false)}></div>
          <div className="relative bg-white dark:bg-inverse-surface rounded-2xl p-6 shadow-xl max-w-xl w-full z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-outline-variant/30">
              <h4 className="font-headline-sm text-base text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">grid_on</span>
                Tabla Pitagórica Interactiva
              </h4>
              <button className="material-symbols-outlined text-on-surface" onClick={() => setShowTableModal(false)}>close</button>
            </div>
            
            <p className="text-xs text-on-surface-variant italic">
              Pasa el cursor por las celdas para visualizar factores, intersecciones y productos operativos.
            </p>

            <div className="overflow-auto border rounded-xl border-outline-variant/40 max-h-[350px]">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-primary-container/20 text-primary font-bold">
                    <th className="p-2 border border-outline-variant bg-primary-container/30">x</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <th key={n} className="p-2 border border-outline-variant">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                    <tr key={r}>
                      <td className="p-2 border border-outline-variant bg-primary-container/20 text-primary font-bold">
                        {r}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => {
                        const val = r * c;
                        const isHighlighted = hoveredCell && (hoveredCell.r === r || hoveredCell.c === c);
                        const isMatch = hoveredCell && hoveredCell.r === r && hoveredCell.c === c;
                        return (
                          <td
                            key={c}
                            onMouseEnter={() => setHoveredCell({ r, c })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`p-2 border border-outline-variant transition-colors cursor-pointer ${
                              isMatch
                                ? 'bg-primary text-white font-bold'
                                : isHighlighted
                                ? 'bg-primary-fixed'
                                : 'hover:bg-surface-container'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center font-bold text-sm text-primary py-2 bg-surface-container-low rounded-xl">
              {hoveredCell ? `${hoveredCell.r} x ${hoveredCell.c} = ${hoveredCell.r * hoveredCell.c}` : 'Pasa por arriba para multiplicar'}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Gato con Botas Story PDF Reader Mock */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowStoryModal(false)}></div>
          <div className="relative bg-white dark:bg-inverse-surface rounded-2xl p-6 shadow-xl max-w-lg w-full z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-outline-variant/30">
              <h4 className="font-headline-sm text-base text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">auto_stories</span>
                Cuento Adaptado: El Gato con Botas
              </h4>
              <button className="material-symbols-outlined text-on-surface" onClick={() => setShowStoryModal(false)}>close</button>
            </div>
            
            <div className="space-y-4 text-xs text-on-surface max-h-[350px] overflow-y-auto pr-2 custom-scrollbar leading-relaxed">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 italic mb-2">
                "Esta versión contiene pictogramas ilustrativos de personajes facilitando el acompañamiento lingüístico del escolar internado..."
              </div>
              <p className="font-bold text-sm">Capítulo 1: El legado del molinero</p>
              <p>
                Un viejo molinero tenía tres hijos. Al morir, les dejó todo lo que tenía: su molino al mayor, su asno al segundo, y un gato al menor.
              </p>
              <p>
                El hijo menor estaba muy triste: <em>"¿Qué haré con un gato?"</em>, se lamentaba en voz alta. Pero el inteligente minino, que escuchaba con atención, le propuso un trato:
              </p>
              <div className="p-3 bg-background border rounded-xl flex items-center gap-2 my-2 font-mono">
                🐈 <strong>"¡Dame un par de botas y un saco, y verás que no has salido perdiendo!"</strong>
              </div>
              <p>
                El joven gastó sus últimas monedas en mandar a fabricar unas botas del mejor cuero para su fiel mascota. Así comenzó la gran hazaña...
              </p>
              <p className="font-bold text-sm">Capítulo 2: El Marqués de Carabás</p>
              <p>
                El Gato con Botas ideó un plan ingenioso. Se fue a un bosque cercano, cazó dos perdices jugosas y las llevó ante la corte del Rey, diciendo que eran un obsequio de su amo, a quien inventó un título noble: el valiente "Marqués de Carabás"...
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/30">
              <span>Páginas: 1 de 14</span>
              <button className="text-primary font-bold hover:underline">Siguiente página &gt;</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Waldorf Circle Multiplication */}
      {showWaldorfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowWaldorfModal(false)}></div>
          <div className="relative bg-white dark:bg-inverse-surface rounded-2xl p-6 shadow-xl max-w-lg w-full z-10 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-outline-variant/30">
              <h4 className="font-headline-sm text-base text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">motion_photos_on</span>
                Círculo Waldorf de Multiplicar
              </h4>
              <button className="material-symbols-outlined text-on-surface" onClick={() => setShowWaldorfModal(false)}>close</button>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Modifica el factor multiplicador para ver cómo se traza el patrón geométrico (hilo de color) al calcular las unidades del producto (0-9).
            </p>

            <div className="flex justify-center gap-3">
              {[2, 3, 4, 5, 7, 8].map(n => (
                <button
                  key={n}
                  onClick={() => setWaldorfNumber(n)}
                  className={`px-3 py-1 text-xs rounded-full font-bold ${
                    waldorfNumber === n
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'
                  }`}
                >
                  Tabla del {n}
                </button>
              ))}
            </div>

            {/* Interactive SVG thread diagram */}
            <div className="bg-background/80 flex items-center justify-center p-4 rounded-xl border border-outline-variant/40">
              <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-sm">
                <circle cx="110" cy="110" r="100" fill="none" stroke="#ccc" strokeWidth="2" />
                
                {/* Multiplication thread lines */}
                {(() => {
                  const points: { x: number; y: number; val: number }[] = [];
                  for (let i = 0; i < 10; i++) {
                    const angle = (i * 36 - 90) * (Math.PI / 180);
                    points.push({
                      x: 110 + 90 * Math.cos(angle),
                      y: 110 + 90 * Math.sin(angle),
                      val: i
                    });
                  }

                  // Construct multiplier links starting at 0 up to 10 nodes
                  const lineDras: React.ReactNode[] = [];
                  let curr = 0;
                  for (let step = 1; step <= 10; step++) {
                    const next = (curr + waldorfNumber) % 10;
                    const p1 = points[curr];
                    const p2 = points[next];
                    lineDras.push(
                      <line
                        key={step}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke="#4352a5"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                    );
                    curr = next;
                  }

                  // Render nodes
                  const textDras = points.map(p => (
                    <g key={p.val}>
                      <circle cx={p.x} cy={p.y} r="10" fill="#fff" stroke="#4352a5" strokeWidth="2" />
                      <text
                        x={p.x}
                        y={p.y + 4}
                        fill="#0d1c2e"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.val}
                      </text>
                    </g>
                  ));

                  return (
                    <>
                      {lineDras}
                      {textDras}
                    </>
                  );
                })()}

              </svg>
            </div>

            <div className="text-center text-xs bg-primary-container/10 text-primary p-3 rounded-lg">
              🎯 <strong>Estrella Geométrica del {waldorfNumber}:</strong> Secuencia de unidades:{' '}
              {(() => {
                const seq = [];
                let curr = 0;
                for (let i = 0; i < 10; i++) {
                  curr = (curr + waldorfNumber) % 10;
                  seq.push(curr);
                }
                return seq.join(' → ');
              })()}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
