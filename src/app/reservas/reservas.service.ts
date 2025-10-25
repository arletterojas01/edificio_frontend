import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Reserva, 
  AreaComun, 
  DisponibilidadCheck, 
  DisponibilidadResponse,
  FiltroReservas,
  EstadisticasReservas 
} from './reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private apiUrl = 'http://localhost:8000/api/reservas';

  constructor(private http: HttpClient) {}

  // ✅ MÉTODO CORREGIDO - Verificar disponibilidad
  verificarDisponibilidad(data: DisponibilidadCheck): Observable<DisponibilidadResponse> {
    const datosFormateados = {
      area_comun: data.area_comun,
      fecha_reserva: data.fecha_reserva,
      hora_inicio: this.formatearHora(data.hora_inicio),
      hora_fin: this.formatearHora(data.hora_fin)
    };

    console.log('📤 Enviando a verificar disponibilidad:', datosFormateados);
    console.log('🌐 URL:', `${this.apiUrl}/verificar-disponibilidad/`);

    return this.http.post<DisponibilidadResponse>(
      `${this.apiUrl}/verificar-disponibilidad/`,
      datosFormateados
    );
  }

  // 🔹 Crear reserva - URL CORREGIDA
  crearReserva(reserva: Partial<Reserva>): Observable<Reserva> {
    const reservaData = {
      area_comun: reserva.area_comun,
      fecha_reserva: reserva.fecha_reserva,
      hora_inicio: this.formatearHora(reserva.hora_inicio),
      hora_fin: this.formatearHora(reserva.hora_fin)
    };

    console.log('🎯🎯🎯 URL PARA CREAR RESERVA:', `${this.apiUrl}/crear-reserva/`);
    console.log('📦 Datos enviados:', reservaData);
    
    return this.http.post<Reserva>(`${this.apiUrl}/crear-reserva/`, reservaData);
  }

  // 🔹 MÉTODO AUXILIAR - Formatear horas (HH:MM:SS)
  private formatearHora(hora: string | undefined): string {
    if (!hora) return '';
    
    if (hora.includes(':') && hora.split(':').length === 3) {
      return hora;
    }
    
    if (hora.includes(':') && hora.split(':').length === 2) {
      return hora + ':00';
    }
    
    return hora;
  }

  // 🔹 MÉTODO PARA ELIMINAR RESERVA
  eliminarReserva(id: number): Observable<any> {
    console.log('🌐 URL eliminar:', `${this.apiUrl}/reservas/${id}/`);
    return this.http.delete<any>(`${this.apiUrl}/reservas/${id}/`);
  }

  // 🔹 ÁREAS COMUNES
  getAreasComunes(): Observable<AreaComun[]> {
    console.log('🌐 URL áreas:', `${this.apiUrl}/areas-comunes/`);
    return this.http.get<AreaComun[]>(`${this.apiUrl}/areas-comunes/`);
  }

  getAreaComun(id: number): Observable<AreaComun> {
    console.log('🌐 URL área:', `${this.apiUrl}/areas-comunes/${id}/`);
    return this.http.get<AreaComun>(`${this.apiUrl}/areas-comunes/${id}/`);
  }

  // 🔹 RESERVAS
  getReservas(filtros?: FiltroReservas): Observable<Reserva[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.fecha_reserva) params = params.set('fecha_reserva', filtros.fecha_reserva);
      if (filtros.area_comun) params = params.set('area_comun', filtros.area_comun.toString());
      if (filtros.usuario) params = params.set('usuario', filtros.usuario.toString());
    }

    console.log('🌐 URL reservas:', `${this.apiUrl}/reservas/`);
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/`, { params });
  }

  getMisReservas(): Observable<Reserva[]> {
    console.log('🌐 URL mis reservas:', `${this.apiUrl}/mis-reservas/`);
    return this.http.get<Reserva[]>(`${this.apiUrl}/mis-reservas/`);
  }

  getReserva(id: number): Observable<Reserva> {
    console.log('🌐 URL reserva:', `${this.apiUrl}/reservas/${id}/`);
    return this.http.get<Reserva>(`${this.apiUrl}/reservas/${id}/`);
  }

  actualizarReserva(id: number, reserva: Partial<Reserva>): Observable<Reserva> {
    const reservaData = {
      ...reserva,
      hora_inicio: reserva.hora_inicio ? this.formatearHora(reserva.hora_inicio) : undefined,
      hora_fin: reserva.hora_fin ? this.formatearHora(reserva.hora_fin) : undefined
    };

    console.log('🌐 URL actualizar:', `${this.apiUrl}/reservas/${id}/`);
    return this.http.patch<Reserva>(`${this.apiUrl}/reservas/${id}/`, reservaData);
  }

  cancelarReserva(id: number): Observable<Reserva> {
    console.log('🌐 URL cancelar:', `${this.apiUrl}/reservas/${id}/cancelar/`);
    return this.http.post<Reserva>(`${this.apiUrl}/reservas/${id}/cancelar/`, {});
  }

  confirmarReserva(id: number): Observable<Reserva> {
    console.log('🌐 URL confirmar:', `${this.apiUrl}/reservas/${id}/confirmar/`);
    return this.http.post<Reserva>(`${this.apiUrl}/reservas/${id}/confirmar/`, {});
  }

  // 🔹 MÉTODO PARA ENVIAR CONFIRMACIÓN POR EMAIL
  enviarConfirmacionEmail(id: number): Observable<any> {
    console.log('🌐 URL email:', `${this.apiUrl}/reservas/${id}/enviar-confirmacion/`);
    return this.http.post<any>(
      `${this.apiUrl}/reservas/${id}/enviar-confirmacion/`,
      {}
    );
  }

  // 🔹 MÉTODOS ADICIONALES
  getReservasPorEstado(estado: string): Observable<Reserva[]> {
    console.log('🌐 URL por estado:', `${this.apiUrl}/reservas/?estado=${estado}`);
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/?estado=${estado}`);
  }

  getReservasPorFecha(fecha: string): Observable<Reserva[]> {
    console.log('🌐 URL por fecha:', `${this.apiUrl}/reservas/?fecha_reserva=${fecha}`);
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/?fecha_reserva=${fecha}`);
  }

  getReservasPorAreaComun(areaComunId: number): Observable<Reserva[]> {
    console.log('🌐 URL por área:', `${this.apiUrl}/reservas/?area_comun=${areaComunId}`);
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/?area_comun=${areaComunId}`);
  }

  generarQRReserva(id: number): Observable<{ qr_code: string }> {
    console.log('🌐 URL QR:', `${this.apiUrl}/reservas/${id}/generar-qr/`);
    return this.http.post<{ qr_code: string }>(
      `${this.apiUrl}/reservas/${id}/generar-qr/`,
      {}
    );
  }

  // 🔹 ESTADÍSTICAS (si existen estos endpoints)
  getEstadisticas(): Observable<EstadisticasReservas> {
    console.log('🌐 URL estadísticas:', `${this.apiUrl}/reservas/estadisticas/`);
    return this.http.get<EstadisticasReservas>(`${this.apiUrl}/reservas/estadisticas/`);
  }

  getEstadisticasUsuario(): Observable<EstadisticasReservas> {
    console.log('🌐 URL mis estadísticas:', `${this.apiUrl}/reservas/mis-estadisticas/`);
    return this.http.get<EstadisticasReservas>(`${this.apiUrl}/reservas/mis-estadisticas/`);
  }

  // 🔹 MÉTODO PARA DEBUG - Ver todas las reservas (sin filtro de usuario)
  getTodasLasReservas(): Observable<Reserva[]> {
    console.log('🌐 URL todas las reservas:', `${this.apiUrl}/reservas/`);
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/`);
  }
}