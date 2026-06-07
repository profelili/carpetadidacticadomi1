import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openPlanningModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  openPlanningModal,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-inverse-surface border-t border-outline-variant h-16 flex items-center justify-around z-50 px-2 shadow-lg">
      <button
        onClick={() => setActiveTab('inicio')}
        className={`flex flex-col items-center gap-1 ${
          activeTab === 'inicio' ? 'text-primary' : 'text-on-surface-variant'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]" style={activeTab === 'inicio' ? { fontVariationSettings: "'FILL' 1" } : undefined}>home</span>
        <span className="text-[10px] font-bold">Inicio</span>
      </button>

      <button
        onClick={() => setActiveTab('domiciliarios')}
        className={`flex flex-col items-center gap-1 ${
          activeTab === 'domiciliarios' ? 'text-primary' : 'text-on-surface-variant'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]" style={activeTab === 'domiciliarios' ? { fontVariationSettings: "'FILL' 1" } : undefined}>house</span>
        <span className="text-[10px] font-bold">Dom.</span>
      </button>

      <div className="relative -top-3">
        <button
          onClick={openPlanningModal}
          className="bg-primary text-on-primary h-12 w-14 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>
      </div>

      <button
        onClick={() => setActiveTab('hospitalarios')}
        className={`flex flex-col items-center gap-1 ${
          activeTab === 'hospitalarios' ? 'text-primary' : 'text-on-surface-variant'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]" style={activeTab === 'hospitalarios' ? { fontVariationSettings: "'FILL' 1" } : undefined}>festival</span>
        <span className="text-[10px] font-bold">Hosp.</span>
      </button>

      <button
        onClick={() => setActiveTab('panel')}
        className={`flex flex-col items-center gap-1 ${
          activeTab === 'panel' ? 'text-primary' : 'text-on-surface-variant'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]" style={activeTab === 'panel' ? { fontVariationSettings: "'FILL' 1" } : undefined}>group</span>
        <span className="text-[10px] font-bold">Alumnos</span>
      </button>
    </nav>
  );
};
