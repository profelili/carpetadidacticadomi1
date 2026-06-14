import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { InicioView } from './components/InicioView';
import { DomiciliariosView } from './components/DomiciliariosView';
import { HospitalariosView } from './components/HospitalariosView';
import { HogarView } from './components/HogarView';
import { PanelAlumnosView } from './components/PanelAlumnosView';
import { PlanningModal } from './components/PlanningModal';
import { INITIAL_STUDENTS, INITIAL_ACTIVITIES, DEFAULT_RESOURCES } from './data';
import { Student, ActivityPlan, ResourceMaterial } from './types';
import { saveActivitiesToDB, loadActivitiesFromDB } from './lib/db';
import { ResourceViewerModal } from './components/ResourceViewerModal';
import avatarImg from './assets/images/liliana_line_art_avatar_1780774966241.jpg';
import logoImg from './assets/images/carpeta_logo_1781462815966.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const embeddedDownloadId = typeof window !== 'undefined' && (window as any).OFFLINE_DOWNLOAD_ID;
      const loadedDownloadId = typeof window !== 'undefined' ? localStorage.getItem('carp_loaded_download_id') : null;
      const isNewDownload = embeddedDownloadId && (embeddedDownloadId !== loadedDownloadId);

      if (isNewDownload) {
        const embeddedStudents = (window as any).OFFLINE_STUDENTS;
        if (embeddedStudents && Array.isArray(embeddedStudents)) {
          try {
            localStorage.setItem('carp_students', JSON.stringify(embeddedStudents));
          } catch (storageErr) {
            console.warn('Could not cache offline students immediately:', storageErr);
          }
          return embeddedStudents;
        }
      }

      const saved = localStorage.getItem('carp_students');
      if (saved) {
        const parsed = JSON.parse(saved) as Student[];
        return parsed.map(s => {
          if (s.id === 'hosp-3' && s.estado === 'Activo') {
            return { ...s, estado: 'Alta médica' };
          }
          return s;
        });
      }
      return INITIAL_STUDENTS;
    } catch (e) {
      console.error('Error parsing carp_students from localStorage', e);
      return INITIAL_STUDENTS;
    }
  });

  const [activities, setActivities] = useState<ActivityPlan[]>(() => {
    try {
      const embeddedDownloadId = typeof window !== 'undefined' && (window as any).OFFLINE_DOWNLOAD_ID;
      const loadedDownloadId = typeof window !== 'undefined' ? localStorage.getItem('carp_loaded_download_id') : null;
      const isNewDownload = embeddedDownloadId && (embeddedDownloadId !== loadedDownloadId);

      if (isNewDownload) {
        const embeddedActivities = (window as any).OFFLINE_ACTIVITIES;
        if (embeddedActivities && Array.isArray(embeddedActivities)) {
          try {
            localStorage.setItem('carp_activities', JSON.stringify(embeddedActivities));
          } catch (storageErr) {
            console.warn('Could not cache offline activities immediately:', storageErr);
          }
          return embeddedActivities;
        }
      }

      const saved = localStorage.getItem('carp_activities');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch (e) {
      console.error('Error parsing carp_activities from localStorage', e);
      return INITIAL_ACTIVITIES;
    }
  });

  const [customExternalResources, setCustomExternalResources] = useState<ResourceMaterial[]>(() => {
    try {
      const stored = localStorage.getItem('custom_external_resources');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleAddCustomExternalResource = (title: string, url: string, description: string = '', imageUrl: string = '') => {
    if (!title || !url) return;
    const cleanUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const newRes: ResourceMaterial = {
      id: `custom-ext-${Date.now()}`,
      titulo: title,
      descripcion: description || 'Recurso externo personalizado.',
      materia: 'Personalizado',
      url: cleanUrl,
      imageUrl: imageUrl || undefined
    };
    const updated = [...customExternalResources, newRes];
    setCustomExternalResources(updated);
    try {
      localStorage.setItem('custom_external_resources', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomExternalResource = (id: string) => {
    const updated = customExternalResources.filter(r => r.id !== id);
    setCustomExternalResources(updated);
    try {
      localStorage.setItem('custom_external_resources', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const resources = [...DEFAULT_RESOURCES, ...customExternalResources];
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityPlan | undefined>(undefined);
  const [activityToDeleteId, setActivityToDeleteId] = useState<string | null>(null);
  const [isDBLoaded, setIsDBLoaded] = useState(false);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);

  const [selectedDomicilioStudentId, setSelectedDomicilioStudentId] = useState<string>('');
  const [selectedHospitalStudentId, setSelectedHospitalStudentId] = useState<string>('');
  const [selectedHogarStudentId, setSelectedHogarStudentId] = useState<string>('');
  const [selectedResourceForPreview, setSelectedResourceForPreview] = useState<ResourceMaterial | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadSite = async () => {
    try {
      setIsExporting(true);
      // Fetch the clean HTML template via GET (0 payload uploaded to server, 413-proof!)
      // cache: 'no-store' and timestamp query completely bypasses browser and proxy caches
      const response = await fetch(`/api/download-single-html?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'No se pudo generar el archivo base.');
      }

      let html = await response.text();

      // Safe escaper to bypass </script> injections
      const escapeScript = (str: string) => str.replace(/<\/script>/ig, '<\\/script>');

      // Client-side injection of current students, activities, and all localized tracker datasets
      const escapedStudentsJSON = students ? escapeScript(JSON.stringify(students)) : '[]';
      const escapedActivitiesJSON = activities ? escapeScript(JSON.stringify(activities)) : '[]';
      
      const weeksJSON = escapeScript(localStorage.getItem('carp_weeks') || '[]');
      const externalUrlJSON = escapeScript(JSON.stringify(localStorage.getItem('carp_external_sheet_url') || ''));
      const externalTitleJSON = escapeScript(JSON.stringify(localStorage.getItem('carp_external_sheet_title') || ''));
      const visitHistoryJSON = escapeScript(localStorage.getItem('carp_visit_history') || '[]');
      const customResourcesJSON = escapeScript(localStorage.getItem('custom_external_resources') || '[]');
      
      const downloadId = String(Date.now());

      const closeScriptTag = String.fromCharCode(60, 47, 115, 99, 114, 105, 112, 116, 62);

      const payloadScript = `
<!-- AUTOMATIC DATA INJECTION IN SINGLE-FILE DEPLOYMENT -->
<script id="offline-data-payload">
  window.OFFLINE_STUDENTS = ${escapedStudentsJSON};
  window.OFFLINE_ACTIVITIES = ${escapedActivitiesJSON};
  window.OFFLINE_WEEKS = ${weeksJSON};
  window.OFFLINE_EXTERNAL_SHEET_URL = ${externalUrlJSON};
  window.OFFLINE_EXTERNAL_SHEET_TITLE = ${externalTitleJSON};
  window.OFFLINE_VISIT_HISTORY = ${visitHistoryJSON};
  window.OFFLINE_CUSTOM_RESOURCES = ${customResourcesJSON};
  window.OFFLINE_DOWNLOAD_ID = "${downloadId}";
  console.log('Datos offline embebidos listos para cargar en la carpeta didáctica autónoma.');
` + closeScriptTag + `\n`;

      // Inject script inside <head> securely at the very beginning of the head using split-literal to avoid JS inlining
      const headTagName = ['<', 'head', '>'].join('');
      const headOpenIndex = html.indexOf(headTagName);
      if (headOpenIndex !== -1) {
        html = html.substring(0, headOpenIndex + headTagName.length) + '\n' + payloadScript + html.substring(headOpenIndex + headTagName.length);
      } else {
        html = payloadScript + html;
      }

      // Create a blob in memory and trigger natural browser download
      const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'carpeta_didactica.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading HTML:', err);
      alert('Error al descargar el sitio: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Synchronize first students when students change
  useEffect(() => {
    if (students && students.length > 0) {
      const dom = students.find(s => s.contexto === 'Domicilio');
      const hosp = students.find(s => s.contexto === 'Hospital');
      const hog = students.find(s => s.contexto === 'Hogar');
      if (dom && !selectedDomicilioStudentId) setSelectedDomicilioStudentId(dom.id);
      if (hosp && !selectedHospitalStudentId) setSelectedHospitalStudentId(hosp.id);
      if (hog && !selectedHogarStudentId) setSelectedHogarStudentId(hog.id);
    }
  }, [students, selectedDomicilioStudentId, selectedHospitalStudentId, selectedHogarStudentId]);

  // Load activities from IndexedDB on mount to restore items with attachments
  useEffect(() => {
    const initDB = async () => {
      try {
        const embeddedDownloadId = typeof window !== 'undefined' && (window as any).OFFLINE_DOWNLOAD_ID;
        const loadedDownloadId = typeof window !== 'undefined' ? localStorage.getItem('carp_loaded_download_id') : null;
        const isNewDownload = embeddedDownloadId && (embeddedDownloadId !== loadedDownloadId);

        if (isNewDownload) {
          console.log('Sincronizando nuevas actividades, almunos, planillas e historias embebidos...');
          const embeddedActivities = (window as any).OFFLINE_ACTIVITIES;
          const embeddedStudents = (window as any).OFFLINE_STUDENTS;
          const embeddedWeeks = (window as any).OFFLINE_WEEKS;
          const embeddedExternalUrl = (window as any).OFFLINE_EXTERNAL_SHEET_URL;
          const embeddedExternalTitle = (window as any).OFFLINE_EXTERNAL_SHEET_TITLE;
          const embeddedVisitHistory = (window as any).OFFLINE_VISIT_HISTORY;
          const embeddedCustomResources = (window as any).OFFLINE_CUSTOM_RESOURCES;

          if (embeddedActivities && Array.isArray(embeddedActivities)) {
            await saveActivitiesToDB(embeddedActivities);
            setActivities(embeddedActivities);
            try {
              localStorage.setItem('carp_activities', JSON.stringify(embeddedActivities));
            } catch (err) {
              console.warn('LocalStorage limit for activities caching:', err);
            }
          }
          if (embeddedStudents && Array.isArray(embeddedStudents)) {
            setStudents(embeddedStudents);
            try {
              localStorage.setItem('carp_students', JSON.stringify(embeddedStudents));
            } catch (err) {
              console.warn('LocalStorage error for students caching:', err);
            }
          }

          // Sync tracking sheet weeks
          if (embeddedWeeks && Array.isArray(embeddedWeeks)) {
            try {
              localStorage.setItem('carp_weeks', JSON.stringify(embeddedWeeks));
              console.log('Semanas de planilla sincronizadas correctamente.');
            } catch (err) {
              console.warn('Error saving embedded weeks to localStorage:', err);
            }
          }

          // Sync official linked Google Sheets URL & title
          if (typeof embeddedExternalUrl === 'string') {
            try {
              localStorage.setItem('carp_external_sheet_url', embeddedExternalUrl);
            } catch (err) {}
          }
          if (typeof embeddedExternalTitle === 'string') {
            try {
              localStorage.setItem('carp_external_sheet_title', embeddedExternalTitle);
            } catch (err) {}
          }

          // Sync visit history
          if (embeddedVisitHistory && Array.isArray(embeddedVisitHistory)) {
            try {
              localStorage.setItem('carp_visit_history', JSON.stringify(embeddedVisitHistory));
            } catch (err) {}
          }

          // Sync custom external resource links
          if (embeddedCustomResources && Array.isArray(embeddedCustomResources)) {
            try {
              localStorage.setItem('custom_external_resources', JSON.stringify(embeddedCustomResources));
              setCustomExternalResources(embeddedCustomResources);
            } catch (err) {}
          }

          if (embeddedDownloadId) {
            localStorage.setItem('carp_loaded_download_id', embeddedDownloadId);
          }
        } else {
          // Normal load: load from IndexedDB
          const dbActivities = await loadActivitiesFromDB();
          if (dbActivities && dbActivities.length > 0) {
            setActivities(dbActivities);
          }
        }
      } catch (err) {
        console.error('Failed to restore or sync activities with IndexedDB:', err);
      } finally {
        setIsDBLoaded(true);
      }
    };
    initDB();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('carp_students', JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save carp_students to localStorage:', e);
    }
  }, [students]);

  useEffect(() => {
    if (!isDBLoaded) return; // Prevent overwriting DB with lightweight/old version on mount

    // 1. Direct save of full data to IndexedDB
    saveActivitiesToDB(activities).catch(err => {
      console.error('Failed to save activities to IndexedDB:', err);
    });

    // 2. Safe save to localStorage (with light version fallback if quota exceeded)
    try {
      localStorage.setItem('carp_activities', JSON.stringify(activities));
    } catch (e) {
      console.warn('LocalStorage limit reached for carp_activities, storing lightweight version instead:', e);
      try {
        const lightActivities = activities.map(act => ({
          ...act,
          attachedFiles: act.attachedFiles?.map(file => ({
            ...file,
            dataUrl: '', // omit the actual base64 content to save space
          }))
        }));
        localStorage.setItem('carp_activities', JSON.stringify(lightActivities));
      } catch (innerError) {
        console.error('Failed to save light activities to localStorage:', innerError);
      }
    }
  }, [activities, isDBLoaded]);

  // Handlers
  const handleOpenPlanningModal = (studentId?: string) => {
    setPreselectedStudentId(studentId);
    setIsPlanningModalOpen(true);
  };

  const handleAddActivity = (newAct: Omit<ActivityPlan, 'id'>) => {
    const actId = 'act-' + (activities.length + 1) + '-' + Date.now();
    const act: ActivityPlan = {
      ...newAct,
      id: actId,
    };
    setActivities([act, ...activities]);

    // Automatically navigate to correct tab & select correct student
    const student = students.find(s => s.id === act.studentId);
    if (student) {
      if (student.contexto === 'Domicilio') {
        setActiveTab('domiciliarios');
        setSelectedDomicilioStudentId(student.id);
      } else if (student.contexto === 'Hospital') {
        setActiveTab('hospitalarios');
        setSelectedHospitalStudentId(student.id);
      } else if (student.contexto === 'Hogar') {
        setActiveTab('hogar');
        setSelectedHogarStudentId(student.id);
      }
    }
  };

  const handleEditActivity = (act: ActivityPlan) => {
    setActivityToEdit(act);
    setIsPlanningModalOpen(true);
  };

  const handleUpdateActivity = (updatedAct: ActivityPlan) => {
    setActivities(prev => prev.map(act => act.id === updatedAct.id ? updatedAct : act));
    setActivityToEdit(undefined);

    // Automatically navigate to correct tab & select correct student
    const student = students.find(s => s.id === updatedAct.studentId);
    if (student) {
      if (student.contexto === 'Domicilio') {
        setActiveTab('domiciliarios');
        setSelectedDomicilioStudentId(student.id);
      } else if (student.contexto === 'Hospital') {
        setActiveTab('hospitalarios');
        setSelectedHospitalStudentId(student.id);
      } else if (student.contexto === 'Hogar') {
        setActiveTab('hogar');
        setSelectedHogarStudentId(student.id);
      }
    }
  };

  const handleDeleteActivity = (id: string) => {
    setActivityToDeleteId(id);
  };

  const confirmDeleteActivity = () => {
    if (activityToDeleteId) {
      setActivities(prev => prev.filter(act => act.id !== activityToDeleteId));
      setActivityToDeleteId(null);
    }
  };

  const handleRestoreHogarActivities = () => {
    const defaultHogarIds = ['act-5', 'act-6'];
    const missingDefaultHogarActivities = INITIAL_ACTIVITIES.filter(
      initAct => defaultHogarIds.includes(initAct.id) && !activities.some(act => act.id === initAct.id)
    );

    if (missingDefaultHogarActivities.length > 0) {
      setActivities(prev => [...prev, ...missingDefaultHogarActivities]);
    }
  };

  const handleAddStudent = (newStudent: Omit<Student, 'id' | 'avatarInitials'>) => {
    const sId = 'student-' + (students.length + 1) + '-' + Date.now();
    const initials = (newStudent.nombre[0] || 'A') + (newStudent.apellido[0] || 'B');
    const student: Student = {
      ...newStudent,
      id: sId,
      avatarInitials: initials.toUpperCase(),
    };
    setStudents([student, ...students]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleDownloadResource = (res: ResourceMaterial) => {
    setSelectedResourceForPreview(res);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const initials = (updatedStudent.nombre[0] || 'A') + (updatedStudent.apellido[0] || 'B');
    const student: Student = {
      ...updatedStudent,
      avatarInitials: initials.toUpperCase(),
    };
    setStudents(students.map(s => s.id === student.id ? student : s));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <InicioView
            students={students}
            resources={resources}
            activities={activities}
            setActiveTab={setActiveTab}
            openPlanningModal={() => handleOpenPlanningModal()}
            onDownloadResource={handleDownloadResource}
            onDownloadSite={handleDownloadSite}
            isExporting={isExporting}
            onDeleteCustomResource={handleDeleteCustomExternalResource}
          />
        );
      case 'domiciliarios':
        return (
          <DomiciliariosView
            students={students}
            activities={activities}
            onOpenPlanningModal={handleOpenPlanningModal}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            selectedStudentId={selectedDomicilioStudentId}
            onSelectStudent={setSelectedDomicilioStudentId}
            onPreviewResource={handleDownloadResource}
          />
        );
      case 'hospitalarios':
        return (
          <HospitalariosView
            students={students}
            activities={activities}
            onOpenPlanningModal={handleOpenPlanningModal}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            selectedStudentId={selectedHospitalStudentId}
            onSelectStudent={setSelectedHospitalStudentId}
            onPreviewResource={handleDownloadResource}
          />
        );
      case 'hogar':
        return (
          <HogarView
            students={students}
            activities={activities}
            onOpenPlanningModal={handleOpenPlanningModal}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            selectedStudentId={selectedHogarStudentId}
            onSelectStudent={setSelectedHogarStudentId}
            onRestoreHogarActivities={handleRestoreHogarActivities}
            onPreviewResource={handleDownloadResource}
          />
        );
      case 'panel':
        return (
          <PanelAlumnosView
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      default:
        return (
          <InicioView
            students={students}
            resources={resources}
            activities={activities}
            setActiveTab={setActiveTab}
            openPlanningModal={() => handleOpenPlanningModal()}
            onDownloadResource={handleDownloadResource}
            onDownloadSite={handleDownloadSite}
            isExporting={isExporting}
            onDeleteCustomResource={handleDeleteCustomExternalResource}
          />
        );
    }
  };

  if (!isDBLoaded) {
    return (
      <div className="bg-background min-h-screen text-on-surface flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-primary">Cargando Carpeta Didáctica</p>
            <p className="text-xs text-on-surface-variant font-medium">Sincronizando planillas y alumnos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-sans transition-colors">
      
      {/* Sidebar - Desktop Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPlanningModal={() => handleOpenPlanningModal()}
        onDownloadSite={handleDownloadSite}
        isExporting={isExporting}
      />

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-inverse-surface border-b border-outline-variant shadow-sm shrink-0 z-40">
        <div className="flex items-center gap-2">
          <img
            alt="Carpeta Didáctica"
            className="h-8 w-8 object-cover rounded-md border border-outline/5 shadow-sm shrink-0"
            src={logoImg}
            referrerPolicy="no-referrer"
          />
          <h2 className="font-headline font-bold text-base text-primary">Carpeta Didáctica</h2>
        </div>
        <img
          alt="Alvarez Liliana"
          className="w-8 h-8 rounded-full border object-cover"
          src={avatarImg}
          referrerPolicy="no-referrer"
        />
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8 max-w-7xl">
        {renderActiveView()}
      </main>

      {/* Bottom Navigation - Mobile Layout */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPlanningModal={() => handleOpenPlanningModal()}
      />

      {/* Global Activity Planning Modal */}
      {isPlanningModalOpen && (
        <PlanningModal
          onClose={() => {
            setIsPlanningModalOpen(false);
            setActivityToEdit(undefined);
            setPreselectedStudentId(undefined);
          }}
          students={students}
          onAddActivity={handleAddActivity}
          activityToEdit={activityToEdit}
          onUpdateActivity={handleUpdateActivity}
          defaultStudentId={preselectedStudentId}
          onPreviewResource={(res) => setSelectedResourceForPreview(res)}
          customExternalResources={customExternalResources}
          onAddCustomExternalResource={handleAddCustomExternalResource}
          onDeleteCustomExternalResource={handleDeleteCustomExternalResource}
        />
      )}

      {/* Custom Confirmation Modal for Deleting Activity */}
      {activityToDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-inverse-surface rounded-2xl max-w-sm w-full p-6 border border-outline-variant shadow-2xl relative space-y-4"
          >
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                ¿Eliminar planificación?
              </h3>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              ¿Estás segura de que deseas eliminar permanentemente esta planificación escolar? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActivityToDeleteId(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteActivity}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Eliminar Planificación
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {selectedResourceForPreview && (
        <ResourceViewerModal
          resource={selectedResourceForPreview}
          onClose={() => setSelectedResourceForPreview(null)}
        />
      )}
    </div>
  );
}
