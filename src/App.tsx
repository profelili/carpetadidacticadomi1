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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('carp_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch (e) {
      console.error('Error parsing carp_students from localStorage', e);
      return INITIAL_STUDENTS;
    }
  });

  const [activities, setActivities] = useState<ActivityPlan[]>(() => {
    try {
      const saved = localStorage.getItem('carp_activities');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch (e) {
      console.error('Error parsing carp_activities from localStorage', e);
      return INITIAL_ACTIVITIES;
    }
  });

  const [resources, setResources] = useState<ResourceMaterial[]>(DEFAULT_RESOURCES);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityPlan | undefined>(undefined);
  const [activityToDeleteId, setActivityToDeleteId] = useState<string | null>(null);
  const [isDBLoaded, setIsDBLoaded] = useState(false);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);

  const [selectedDomicilioStudentId, setSelectedDomicilioStudentId] = useState<string>('');
  const [selectedHospitalStudentId, setSelectedHospitalStudentId] = useState<string>('');
  const [selectedHogarStudentId, setSelectedHogarStudentId] = useState<string>('');
  const [selectedResourceForPreview, setSelectedResourceForPreview] = useState<ResourceMaterial | null>(null);

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
        const dbActivities = await loadActivitiesFromDB();
        if (dbActivities && dbActivities.length > 0) {
          setActivities(dbActivities);
        }
      } catch (err) {
        console.error('Failed to load activities from IndexedDB, falling back to localStorage:', err);
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
            setActiveTab={setActiveTab}
            openPlanningModal={() => handleOpenPlanningModal()}
            onDownloadResource={handleDownloadResource}
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
            setActiveTab={setActiveTab}
            openPlanningModal={() => handleOpenPlanningModal()}
            onDownloadResource={handleDownloadResource}
          />
        );
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-sans transition-colors">
      
      {/* Sidebar - Desktop Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPlanningModal={() => handleOpenPlanningModal()}
      />

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-inverse-surface border-b border-outline-variant shadow-sm shrink-0 z-40">
        <div className="flex items-center gap-2">
          <img
            alt="Carpeta Didáctica"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwZERkGTNHLFi2jlAE8-jRQUKCW07vkVuKz-Lv9R8jpUVfdY-ylHyBi8-mfy7T5Vb2gD9kauq08cR_fLT8k-aYCdnfO10RU-srYJCjyvQ8tnFJ6cfmc_yvzS4rizRU0ExeTZSDrUMWgcGsYtk064npNbbxG7HxOocNnx08nlJh8hF7tzk71iosUfRBJRsjl6gSDSD_oNNoi4y7cDCKeJA6aqIesvYRsZszRmrra6CdK_TGsGZUt3oyVwMi8-AUpXXW-Jk6L1ZDkxQ"
          />
          <h2 className="font-headline font-bold text-base text-primary">Carpeta Didáctica</h2>
        </div>
        <img
          alt="Alvarez Liliana"
          className="w-8 h-8 rounded-full border object-cover"
          src="/src/assets/images/liliana_line_art_avatar_1780774966241.png"
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
