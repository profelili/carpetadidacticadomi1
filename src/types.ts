/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContextType = 'Domicilio' | 'Hospital' | 'Hogar';

export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
  fechaNac: string;
  escuela: string;
  diagnostico: string;
  contexto: ContextType;
  fechaProxVisita?: string;
  horaProxVisita?: string;
  estado?: string;
  salaDetail?: string; // e.g., "Sala 4 - Pediatría", "Sala 2 - Traumato"
  ultimaClase?: string; // e.g., "15/10/2023"
  avatarInitials: string;
  observaciones?: {
    titulo1: string;
    desc1: string;
    titulo2: string;
    desc2: string;
    ultimaActualizacion: string;
  };
}

export interface AttachedFile {
  name: string;
  type: string;
  dataUrl: string;
}

export interface ActivityPlan {
  id: string;
  studentId: string;
  materia: string;
  tema: string;
  descripcion: string;
  prioridad: 'Baja' | 'Media' | 'Alta';
  estado: 'EN PROGRESO' | 'PENDIENTE' | 'INTEGRADOR';
  tags: string[];
  recursoClave?: string;
  enlaceUrl?: string;
  enlaceTitulo?: string;
  attachedFiles?: AttachedFile[];
}

export interface ResourceMaterial {
  id: string;
  titulo: string;
  descripcion: string;
  materia: string;
  url?: string;
}

export interface VisitaRegistro {
  id: string;
  studentId: string;
  fecha: string;
  hora: string;
  actividadesRealizadas: string;
  observaciones: string;
  estadoAnimo: string;
}
