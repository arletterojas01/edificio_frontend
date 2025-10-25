export interface Reserva {
  id: number;
  usuario: number;
  area_comun: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  monto: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  
  area_comun_nombre?: string;
  area_comun_obj?: AreaComun;
  usuario_nombre?: string;
  pago_confirmado?: boolean;
  codigo_qr?: string;
  codigo_qr_url?: string;
  metodo_pago?: string;
  fecha_creacion?: string;

  fecha?: string;
}

export interface AreaComun {
  id: number;
  nombre: string;
  descripcion?: string;
  capacidad?: number;
  tarifa?: number;
  imagen?: string;
  
  activo?: boolean;
  tipo?: string;
  horario_apertura?: string;
  horario_cierre?: string;
  normas?: string;
}

export interface DisponibilidadCheck {
  area_comun: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  reserva_id?: number;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  mensaje?: string;
}

export interface FiltroReservas {
  estado?: string;
  fecha_reserva?: string;
  area_comun?: number;
  usuario?: number;
}

export interface EstadisticasReservas {
  total_reservas: number;
  reservas_pendientes: number;
  reservas_confirmadas: number;
  reservas_canceladas: number;
  ingresos_totales: number;
  area_mas_popular?: string;
}
// 🔹 INTERFAZ PARA FILTROS
export interface FiltroReservas {
  estado?: string;
  fecha_reserva?: string;
  area_comun?: number;
  usuario?: number;
}

// 🔹 INTERFAZ PARA ESTADÍSTICAS
export interface EstadisticasReservas {
  total_reservas: number;
  reservas_pendientes: number;
  reservas_confirmadas: number;
  reservas_canceladas: number;
  ingresos_totales: number;
  area_mas_popular?: string;
}