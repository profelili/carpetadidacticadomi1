import React, { useState, useRef } from 'react';
import { Student, ActivityPlan, AttachedFile } from '../types';

interface PlanningModalProps {
  onClose: () => void;
  students: Student[];
  onAddActivity: (newAct: Omit<ActivityPlan, 'id'>) => void;
  activityToEdit?: ActivityPlan;
  onUpdateActivity?: (updatedAct: ActivityPlan) => void;
}

export const PlanningModal: React.FC<PlanningModalProps> = ({
  onClose,
  students,
  onAddActivity,
  activityToEdit,
  onUpdateActivity,
}) => {
  const [studentId, setStudentId] = useState<string>(activityToEdit?.studentId || students[0]?.id || '');
  const [materia, setMateria] = useState<string>(activityToEdit?.materia || 'Matemática');
  const [tema, setTema] = useState<string>(activityToEdit?.tema || '');
  const [descripcion, setDescripcion] = useState<string>(activityToEdit?.descripcion || '');
  const [prioridad, setPrioridad] = useState<'Alta' | 'Media' | 'Baja'>(activityToEdit?.prioridad || 'Media');
  const [estado, setEstado] = useState<'EN PROGRESO' | 'PENDIENTE' | 'INTEGRADOR'>(activityToEdit?.estado || 'EN PROGRESO');
  const [recursoClave, setRecursoClave] = useState<string>(activityToEdit?.recursoClave || '');
  const [tagsInput, setTagsInput] = useState<string>(activityToEdit?.tags.join(', ') || '');
  const [enlaceUrl, setEnlaceUrl] = useState<string>(activityToEdit?.enlaceUrl || '');
  const [enlaceTitulo, setEnlaceTitulo] = useState<string>(activityToEdit?.enlaceTitulo || '');

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
      <div className="relative bg-white dark:bg-inverse-surface rounded-3xl p-6 md:p-8 shadow-2xl max-w-2xl w-full z-10 max-h-[90vh] overflow-y-auto space-y-6">
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
                <option value="Expresión Artística">Expresión Artística (Plástica/Música)</option>
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
                onChange={e => setRecursoClave(e.target.value)}
                placeholder="Ej: Fichas adaptadas con lanas"
                className="rounded-xl border border-outline-variant bg-surface text-xs py-2 px-3"
              />
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
    </div>
  );
};
