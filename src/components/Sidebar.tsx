import React from 'react';
import avatarImg from '../assets/images/liliana_line_art_avatar_1780774966241.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openPlanningModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openPlanningModal,
}) => {
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 gap-4 bg-white dark:bg-inverse-surface shadow-[4px_0_15px_rgba(67,82,165,0.05)] w-64 z-40 pt-6">
      <div className="px-2 mb-4">
        <div className="flex items-center gap-3">
          <img
            alt="Carpeta Didáctica Logo"
            className="h-10 w-auto object-contain shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwZERkGTNHLFi2jlAE8-jRQUKCW07vkVuKz-Lv9R8jpUVfdY-ylHyBi8-mfy7T5Vb2gD9kauq08cR_fLT8k-aYCdnfO10RU-srYJCjyvQ8tnFJ6cfmc_yvzS4rizRU0ExeTZSDrUMWgcGsYtk064npNbbxG7HxOocNnx08nlJh8hF7tzk71iosUfRBJRsjl6gSDSD_oNNoi4y7cDCKeJA6aqIesvYRsZszRmrra6CdK_TGsGZUt3oyVwMi8-AUpXXW-Jk6L1ZDkxQ"
          />
          <div>
            <h1 className="font-headline-sm text-lg font-bold text-primary leading-tight">
              Carpeta Didáctica
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">
              Gestión Pedagógica
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 mb-4 bg-surface-container-low dark:bg-surface-dim rounded-xl">
        <img
          alt="Alvarez Liliana"
          className="w-10 h-10 rounded-full object-cover border border-outline-variant"
          src={avatarImg}
          referrerPolicy="no-referrer"
        />
        <div className="overflow-hidden">
          <p className="font-label-md text-sm text-on-surface font-bold truncate">
            Alvarez Liliana
          </p>
          <p id="usr-school-name" className="text-[11px] text-on-surface-variant truncate">
            Escuela Especial Domiciliaria N°1
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full active:scale-[0.98] ${
            activeTab === 'inicio'
              ? 'bg-primary-container text-white font-bold shadow-md shadow-primary/20'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="font-label-md text-sm">Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('domiciliarios')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full active:scale-[0.98] ${
            activeTab === 'domiciliarios'
              ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">house</span>
          <span className="font-label-md text-sm">Domiciliarios</span>
        </button>

        <button
          onClick={() => setActiveTab('hospitalarios')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full active:scale-[0.98] ${
            activeTab === 'hospitalarios'
              ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">festival</span>
          <span className="font-label-md text-sm">Hospitalarios</span>
        </button>

        <button
          onClick={() => setActiveTab('hogar')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full active:scale-[0.98] ${
            activeTab === 'hogar'
              ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">child_care</span>
          <span className="font-label-md text-sm">Hogar Juanito</span>
        </button>

        <button
          onClick={() => setActiveTab('panel')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full active:scale-[0.98] ${
            activeTab === 'panel'
              ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">group</span>
          <span className="font-label-md text-sm">Panel de Alumnos</span>
        </button>
      </nav>

      <button
        onClick={openPlanningModal}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        <span className="text-sm">Nueva Planificación</span>
      </button>

      <div className="flex flex-col gap-1 border-t border-outline-variant pt-4">
        <button
          onClick={() => alert('Parámetros de configuración del sistema')}
          className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all text-left w-full"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-label-md text-sm">Configuración</span>
        </button>
        <button
          onClick={() => {
            alert('Sesión cerrada. ¡Hasta pronto!');
          }}
          className="flex items-center gap-3 px-4 py-2 text-error hover:bg-error-container/20 rounded-xl transition-all text-left w-full"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-label-md text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
