export interface Ticket {
  id_ticket: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  categoria: number;
  categoria_nombre?: string;
  usuario: number;
  usuario_nombre?: string;
  usuario_apellido?: string;
  tecnico_asignado?: number;
  tecnico_nombre?: string;
  tecnico_apellido?: string;
  salario_tecnico?: number;
  fecha_creacion: string;
  fecha_cierre?: string;

  
  // NUEVOS CAMPOS - Agrega estos
  codigo?: string;
  es_urgente?: boolean;
  ubicacion?: string;
  piso?: string;
  departamento?: string;
  fecha_limite?: string;
  fecha_actualizacion?: string;
  tiempo_estimado_reparacion?: number;
  costo_estimado?: number;
  
  imagenes?: ImagenTicket[];
  comentarios?: ComentarioTicket[];
}

export interface ComentarioTicket {
  id_comentario: number;
  ticket: number;
  usuario: number;
  usuario_nombre?: string;
  usuario_apellido?: string;
  contenido: string;
  es_interno: boolean;
  fecha_creacion: string;
  adjunto?: string; // NUEVO CAMPO
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

// ... resto de las interfaces
export interface ComentarioTicket {
  id_comentario: number;
  ticket: number;
  usuario: number;
  usuario_nombre?: string;
  usuario_apellido?: string;
  contenido: string;
  es_interno: boolean;
  fecha_creacion: string;
}

export interface ImagenTicket {
  id_imagen: number;
  ticket: number;
  imagen: string;
  descripcion?: string;
  fecha_creacion: string;
}

export interface TicketsResponse {
  reportados: Ticket[];
  asignados: Ticket[];
}

export interface EstadisticasResponse {
  totales: {
    total: number;
    abiertos: number;
    en_progreso: number;
    cerrados: number;
  };
  por_categoria: any[];
  por_prioridad: any[];
}