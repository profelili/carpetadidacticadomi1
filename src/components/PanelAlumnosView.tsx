import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Student, ContextType } from '../types';

interface PanelAlumnosViewProps {
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, 'id' | 'avatarInitials'>) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const PanelAlumnosView: React.FC<PanelAlumnosViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [filterContext, setFilterContext] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [viewingStudentExpediente, setViewingStudentExpediente] = useState<Student | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Form states
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState<number>(8);
  const [dni, setDni] = useState('');
  const [fechaNac, setFechaNac] = useState('2018-05-15');
  const [escuela, setEscuela] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [contexto, setContexto] = useState<ContextType>('Domicilio');
  const [salaDetail, setSalaDetail] = useState('');
  const [ultimaClase, setUltimaClase] = useState('06/06/2026');
  const [estado, setEstado] = useState('Activo');

  // Submit adding
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !dni || !escuela) {
      showToast('Por favor, completa los campos requeridos (*).', 'error');
      return;
    }

    onAddStudent({
      nombre,
      apellido,
      edad: Number(edad),
      dni,
      fechaNac,
      escuela,
      diagnostico,
      contexto,
      salaDetail: contexto === 'Hospital' ? salaDetail : undefined,
      ultimaClase,
      estado,
    });

    // Reset
    setNombre('');
    setApellido('');
    setEdad(8);
    setDni('');
    setFechaNac('2018-05-15');
    setEscuela('');
    setDiagnostico('');
    setContexto('Domicilio');
    setSalaDetail('');
    setEstado('Activo');
    setShowAddForm(false);
    showToast('Alumno registrado exitosamente.', 'success');
  };

  // Filter & Search Logic
  const filteredStudents = students.filter(student => {
    const matchesFilter = filterContext === 'Todos' || student.contexto === filterContext;
    const fullName = `${student.nombre} ${student.apellido}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      student.dni.includes(searchQuery) ||
      student.escuela.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-inverse-surface border border-outline-variant p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Total Alumnado</p>
            <p className="font-bold text-3xl text-primary mt-1">{students.length}</p>
          </div>
          <div className="p-3 bg-primary-container text-white rounded-xl">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
        </div>

        <div className="bg-white dark:bg-inverse-surface border border-outline-variant p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Altas de Ciclo</p>
            <p className="font-bold text-3xl text-secondary mt-1">11 Alumnos</p>
          </div>
          <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl">
            <span className="material-symbols-outlined text-[24px]">add_task</span>
          </div>
        </div>

        <div className="bg-white dark:bg-inverse-surface border border-outline-variant p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Planificados Activos</p>
            <p className="font-bold text-3xl text-amber-700 mt-1">
              {students.filter(s => s.contexto === 'Hospital' || s.contexto === 'Domicilio').length}
            </p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">calendar_today</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-inverse-surface p-4 border border-outline-variant rounded-2xl shadow-sm">
        {/* Chips filters */}
        <div className="flex flex-wrap gap-2">
          {['Todos', 'Domicilio', 'Hospital', 'Hogar'].map(ctx => {
            const isActive = filterContext === ctx;
            return (
              <button
                key={ctx}
                onClick={() => setFilterContext(ctx)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant hover:text-on-surface'
                }`}
              >
                {ctx === 'Todos' ? 'Todos los Alumnos' : ctx}
              </button>
            );
          })}
        </div>

        {/* Search Input & Register button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, DNI, escuela..."
              className="pl-9 pr-4 py-2 bg-background border border-outline-variant rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition-all w-full sm:w-64"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-on-primary font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            {showAddForm ? 'Cerrar Registro' : 'Registrar Alumno'}
          </button>
        </div>
      </div>

      {/* Register Student Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-inverse-surface p-6 rounded-2xl border border-primary shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-primary">person_add</span>
            <h4 className="font-bold text-on-surface text-sm">Formulario de Inscripción Pedagógica</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Sofía"
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Apellido *</label>
              <input
                type="text"
                value={apellido}
                onChange={e => setApellido(e.target.value)}
                placeholder="Ej: Rodríguez"
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Edad *</label>
              <input
                type="number"
                value={edad}
                onChange={e => setEdad(Number(e.target.value))}
                min={4}
                max={18}
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">DNI *</label>
              <input
                type="text"
                value={dni}
                onChange={e => setDni(e.target.value)}
                placeholder="Ej: 49.882.331"
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Fecha de Nacimiento</label>
              <input
                type="date"
                value={fechaNac}
                onChange={e => setFechaNac(e.target.value)}
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary w-full text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Escuela de Origen *</label>
              <input
                type="text"
                value={escuela}
                onChange={e => setEscuela(e.target.value)}
                placeholder="Ej: EP N° 4"
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary w-full text-on-surface"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Contexto Pedagógico *</label>
              <select
                value={contexto}
                onChange={e => setContexto(e.target.value as ContextType)}
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary w-full text-on-surface font-semibold"
              >
                <option value="Domicilio">Domicilio</option>
                <option value="Hospital">Hospital</option>
                <option value="Hogar">Hogar Juanito</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Estado *</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary w-full text-on-surface font-semibold"
              >
                <option value="Activo">Activo</option>
                <option value="Alta médica">Alta médica</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface-variant">Diagnóstico / Condición Clínica</label>
              <input
                type="text"
                value={diagnostico}
                onChange={e => setDiagnostico(e.target.value)}
                placeholder="Ej: Recuperación de cirugía / Post-operatoria"
                className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary"
              />
            </div>

            {contexto === 'Hospital' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant">Ubicación del Alumno (Sala / Habitación) *</label>
                <input
                  type="text"
                  value={salaDetail}
                  onChange={e => setSalaDetail(e.target.value)}
                  placeholder="Ej: Habitación 402 ó Sala 4 - Pediatría"
                  className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary"
                  required={contexto === 'Hospital'}
                />
              </div>
            )}

            {contexto !== 'Hospital' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant">Última Clase Dictada</label>
                <input
                  type="text"
                  value={ultimaClase}
                  onChange={e => setUltimaClase(e.target.value)}
                  placeholder="Ej: 15/10/2023"
                  className="rounded-xl border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 text-xs pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 hover:bg-surface-container-high rounded-full font-bold text-on-surface-variant"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 shadow-sm"
            >
              Registrar en la Matrícula
            </button>
          </div>
        </motion.form>
      )}

      {/* Students Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          let contextBadgeClass = 'bg-blue-50 text-blue-700';
          let locIcon = 'home';
          let locLabel = 'Última clase:';
          let locValue = student.ultimaClase || 'No asignada';

          if (student.contexto === 'Hospital') {
            contextBadgeClass = 'bg-emerald-50 text-emerald-700';
            locIcon = 'hotel';
            locLabel = 'Habitación/Sala:';
            locValue = student.salaDetail || 'Pediatría Pabellón';
          } else if (student.contexto === 'Hogar') {
            contextBadgeClass = 'bg-amber-50 text-amber-700';
            locIcon = 'holiday_village';
            locLabel = 'Refugio:';
            locValue = 'Hogar Juanito';
          }

          return (
            <div
              key={student.id}
              className="bg-white dark:bg-inverse-surface border border-outline-variant p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden text-left"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center text-sm">
                      {student.avatarInitials}
                    </div>
                    <div>
                      <h5 className="font-bold text-on-surface text-sm">
                        {student.apellido}, {student.nombre}
                      </h5>
                      <span className="text-caption text-on-surface-variant font-medium">
                        {student.edad} años • DNI {student.dni}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${contextBadgeClass}`}>
                      {student.contexto}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      (student.estado || 'Activo') === 'Alta médica' 
                        ? 'bg-teal-55 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900 dark:text-teal-300' 
                        : (student.estado || 'Activo') === 'Activo'
                        ? 'bg-green-55 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-300'
                        : 'bg-rose-55 border-rose-205 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300'
                    }`}>
                      {student.estado || 'Activo'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-3 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">school</span>
                    <span className="font-semibold text-[11px]">Origen:</span>
                    <span className="text-[11px] font-medium">{student.escuela}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">{locIcon}</span>
                    <span className="font-semibold text-[11px]">{locLabel}</span>
                    <span className="text-[11px] font-bold text-primary">{locValue}</span>
                  </div>
                  <div className="flex items-start gap-2 text-on-surface-secondary pt-1.5">
                    <span className="material-symbols-outlined text-sm mt-0.5">clinical_notes</span>
                    <div>
                      <span className="font-semibold text-[11px] block text-on-surface">Ficha diagnóstica:</span>
                      <p className="text-[10px] text-on-surface-variant italic leading-relaxed mt-0.5">{student.diagnostico || 'Sin observaciones adaptativas clínicas asignadas.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-1.5 mt-6 pt-3 border-t border-outline-variant/30 text-xs">
                <button
                  onClick={() => setViewingStudentExpediente(student)}
                  className="px-2.5 py-1.5 hover:bg-surface-container-high rounded text-primary font-bold transition-all text-[11px] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">assignment</span>
                  Expediente
                </button>
                <button
                  onClick={() => setEditingStudent(student)}
                  className="px-2.5 py-1.5 hover:bg-primary-container text-primary font-bold rounded transition-all text-[11px] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">edit</span>
                  Modificar
                </button>
                <button
                  onClick={() => setStudentToDelete(student)}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 font-bold rounded transition-all text-[11px] flex items-center gap-1 border border-red-200/50"
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">delete</span>
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
        
        {filteredStudents.length === 0 && (
          <div className="col-span-full py-12 text-center text-on-surface-variant italic">
            Ningún alumno coincide con los filtros de búsqueda.
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-2xl max-w-2xl w-full p-6 border border-outline-variant shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="font-headline-sm text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">edit</span>
                Modificar Datos: {editingStudent.nombre} {editingStudent.apellido}
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-on-surface-variant hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingStudent.nombre || !editingStudent.apellido || !editingStudent.dni || !editingStudent.escuela) {
                  showToast('Por favor, completa los campos requeridos (*).', 'error');
                  return;
                }
                onUpdateStudent(editingStudent);
                setEditingStudent(null);
                showToast('Ficha del alumno modificada correctamente.', 'success');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Nombre *</label>
                  <input
                    type="text"
                    value={editingStudent.nombre}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nombre: e.target.value })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Apellido *</label>
                  <input
                    type="text"
                    value={editingStudent.apellido}
                    onChange={(e) => setEditingStudent({ ...editingStudent, apellido: e.target.value })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Edad *</label>
                  <input
                    type="number"
                    value={editingStudent.edad}
                    onChange={(e) => setEditingStudent({ ...editingStudent, edad: Number(e.target.value) })}
                    min={4}
                    max={18}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">DNI *</label>
                  <input
                    type="text"
                    value={editingStudent.dni}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dni: e.target.value })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={editingStudent.fechaNac}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fechaNac: e.target.value })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Escuela de Origen *</label>
                  <input
                    type="text"
                    value={editingStudent.escuela}
                    onChange={(e) => setEditingStudent({ ...editingStudent, escuela: e.target.value })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Contexto Pedagógico *</label>
                  <select
                    value={editingStudent.contexto}
                    onChange={(e) => setEditingStudent({ ...editingStudent, contexto: e.target.value as ContextType })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface font-semibold"
                  >
                    <option value="Domicilio">Domicilio</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Hogar">Hogar Juanito</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Estado *</label>
                  <select
                    value={editingStudent.estado || 'Activo'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, estado: e.target.value })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface font-semibold"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Alta médica">Alta médica</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface-variant">Diagnóstico / Condición Clínica</label>
                  <input
                    type="text"
                    value={editingStudent.diagnostico || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, diagnostico: e.target.value })}
                    className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                  />
                </div>

                {editingStudent.contexto === 'Hospital' ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Ubicación (Sala / Cama / Hosp. Fernández) *</label>
                    <input
                      type="text"
                      value={editingStudent.salaDetail || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, salaDetail: e.target.value })}
                      className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                      required
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Última Clase Dictada</label>
                    <input
                      type="text"
                      value={editingStudent.ultimaClase || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, ultimaClase: e.target.value })}
                      className="rounded-xl border border-outline-variant bg-surface text-xs focus:ring-1 focus:ring-primary outline-none p-2.5 text-on-surface"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 font-bold text-on-surface-variant hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CUSTOM SECURE DELETE CONFIRMATION DIALOG */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-2xl max-w-md w-full p-6 border border-outline-variant shadow-2xl relative space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0 text-red-600">
                <span className="material-symbols-outlined text-[24px] font-bold">warning</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="font-headline-sm text-base font-bold text-red-600 flex items-center gap-2">
                  Confirmar Eliminación
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                  ¿Seguro que deseas eliminar definitivamente el registro escolar y expediente de:
                </p>
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-outline-variant/40 p-3 rounded-xl">
                  <span className="text-sm font-bold text-on-surface block">
                    {studentToDelete.nombre} {studentToDelete.apellido}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                    DNI: {studentToDelete.dni} · Escuela: {studentToDelete.escuela}
                  </span>
                </div>
                <p className="text-[10px] text-red-500 leading-relaxed font-semibold flex items-start gap-1">
                  <span className="material-symbols-outlined text-[12px] mt-0.5 font-bold animate-pulse">info</span>
                  <span>Esta acción es permanente, depurará de inmediato su ficha pedagógica del sistema y no se puede deshacer.</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 font-bold text-on-surface-variant hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200"
              >
                No, cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  showToast(`El registro de ${studentToDelete.nombre} ha sido eliminado definitivamente.`, 'success');
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm font-bold">delete_forever</span>
                Sí, eliminar registro
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CUSTOM EXPEDIENTE DOSSIER MODAL */}
      {viewingStudentExpediente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-left">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-3xl max-w-xl w-full p-6 border border-outline-variant shadow-2xl relative space-y-6 overflow-hidden"
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-secondary"></div>

            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">folder_shared</span>
                Ficha Clínico-Pedagógica Digital
              </h3>
              <button
                onClick={() => setViewingStudentExpediente(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            <div className="flex items-center gap-4 bg-primary-container/30 border border-primary/10 p-4 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm font-headline">
                {viewingStudentExpediente.avatarInitials}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] bg-primary-container text-primary border border-primary/20 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                  Matriculación / Gestión: {viewingStudentExpediente.contexto}
                </span>
                <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
                  {viewingStudentExpediente.nombre} {viewingStudentExpediente.apellido}
                </h4>
                <p className="text-[11px] text-on-surface-variant font-medium">
                  {viewingStudentExpediente.edad || 8} años · Nacido/a: {viewingStudentExpediente.fechaNac || 'No especificada'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-50 dark:bg-neutral-900 border border-outline-variant/40 p-3.5 rounded-xl space-y-2">
                <h5 className="font-bold text-on-surface flex items-center gap-1 border-b border-outline-variant/30 pb-1 text-[11px] uppercase tracking-wide text-primary">
                  <span className="material-symbols-outlined text-sm">assignment_ind</span>
                  Datos Generales
                </h5>
                <div className="space-y-1 text-[11px]">
                  <p className="text-on-surface-variant">DNI: <span className="font-bold text-on-surface block sm:inline">{viewingStudentExpediente.dni}</span></p>
                  <p className="text-on-surface-variant">Escuela: <span className="font-bold text-on-surface block sm:inline">{viewingStudentExpediente.escuela}</span></p>
                  <p className="text-on-surface-variant">Último contacto: <span className="font-semibold text-on-surface block sm:inline">{viewingStudentExpediente.ultimaClase || 'Pendiente'}</span></p>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900 border border-outline-variant/40 p-3.5 rounded-xl space-y-2">
                <h5 className="font-bold text-on-surface flex items-center gap-1 border-b border-outline-variant/30 pb-1 text-[11px] uppercase tracking-wide text-secondary">
                  <span className="material-symbols-outlined text-sm">clinical_notes</span>
                  Estado Operativo
                </h5>
                <div className="space-y-1 text-[11px]">
                  <p className="text-on-surface-variant">Ubicación / Sala: <span className="font-bold text-on-surface block truncate">{viewingStudentExpediente.salaDetail || 'No requiere registro clínico'}</span></p>
                  <p className="text-on-surface-variant">Seguimiento: <span className="font-bold text-on-surface block sm:inline">{viewingStudentExpediente.fechaProxVisita || 'Automático'} {viewingStudentExpediente.horaProxVisita || ''}</span></p>
                  <p className="text-on-surface-variant">Estado: <span className={`font-bold block sm:inline ${
                    (viewingStudentExpediente.estado || 'Activo') === 'Alta médica'
                      ? 'text-teal-600 dark:text-teal-400'
                      : (viewingStudentExpediente.estado || 'Activo') === 'Activo'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>{viewingStudentExpediente.estado || 'Activo'}</span></p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 border border-outline-variant/40 p-4 rounded-xl space-y-2 text-xs">
              <h5 className="font-bold text-on-surface flex items-center gap-1 border-b border-outline-variant/30 pb-1.5 text-[11px] uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                <span className="material-symbols-outlined text-sm">psychology</span>
                Diagnóstico y Contexto Curricular
              </h5>
              <p className="text-xs text-on-surface-variant italic leading-relaxed text-left font-medium">
                {viewingStudentExpediente.diagnostico || 'Sin observaciones preventivas especiales cargadas en el sistema escolar.'}
              </p>
            </div>

            <div className="flex justify-end pt-2 text-xs">
              <button
                type="button"
                onClick={() => setViewingStudentExpediente(null)}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm text-xs active:scale-[0.98]"
              >
                Cerrar Expediente
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-bold font-sans text-white pointer-events-auto ${
              toast.type === 'error'
                ? 'bg-red-600 border-red-500'
                : toast.type === 'info'
                ? 'bg-primary border-primary-dark'
                : 'bg-green-600 border-green-500'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-80 inline-flex items-center text-white/90"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};
