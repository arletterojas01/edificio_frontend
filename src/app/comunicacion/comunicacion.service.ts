import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// ========== INTERFACES ACTUALIZADAS ==========
export interface Anuncio {
  id: number;
  titulo: string;
  contenido: string;  // ANTES: mensaje
  fecha_creacion: string;
  tipo: 'ANUNCIO' | 'URGENTE' | 'EVENTO';  // ACTUALIZADO
  autor: number;
  autor_nombre: string;
  fecha_expiracion?: string;
  destinatarios?: number[];
  leido_por?: number[];
  destinatarios_count?: number;
}

export interface Mensaje {
  id: number;
  asunto: string;
  contenido: string;  // ANTES: mensaje
  remitente: number;
  remitente_nombre: string;
  destinatario: number;
  destinatario_nombre: string;
  fecha_envio: string;
  leido: boolean;
}

export interface QuejaSugerencia {
  id: number;
  tipo: 'QUEJA' | 'SUGERENCIA';  // ACTUALIZADO
  asunto: string;
  contenido: string;  // ANTES: mensaje
  usuario: number;
  usuario_nombre: string;
  fecha_creacion: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';  // ACTUALIZADO
}

export interface OpcionEncuesta {
  id: number;
  texto: string;
  votos_count?: number;
}

export interface Encuesta {
  id: number;
  titulo: string;
  descripcion: string;
  opciones: OpcionEncuesta[];
  creador: number;
  creador_nombre: string;
  fecha_creacion: string;
  fecha_cierre?: string;
  activa: boolean;
  total_votos?: number;
  opciones_con_votos?: OpcionEncuesta[];
}

export interface ChatMensaje {
  id: number;
  usuario: number;
  usuario_nombre: string;
  mensaje: string;
  fecha_envio: string;
}

// ========== INTERFACES PARA CREACIÓN ==========
export interface CrearAnuncio {
  titulo: string;
  contenido: string;
  tipo: 'ANUNCIO' | 'URGENTE' | 'EVENTO';
  fecha_expiracion?: string;
}

export interface CrearMensaje {
  asunto: string;
  contenido: string;
  destinatario: number;
}

export interface CrearQuejaSugerencia {
  tipo: 'QUEJA' | 'SUGERENCIA';
  asunto: string;
  contenido: string;
}

export interface CrearEncuesta {
  titulo: string;
  descripcion: string;
  activa?: boolean;
  fecha_cierre?: string;
}

export interface CrearChatMensaje {
  mensaje: string;
}

// ========== INTERFACES PARA FILTROS ==========
export interface FiltroAnuncios {
  tipo?: string;
  search?: string;
  excluir_expirados?: boolean;
}

export interface FiltroQuejas {
  tipo?: string;
  estado?: string;
  search?: string;
}

export interface FiltroEncuestas {
  activas?: boolean;
  search?: string;
}

// ========== INTERFACES PARA RESPUESTAS ESPECIALES ==========
export interface EstadisticasAnuncios {
  total_anuncios: number;
  urgentes: number;
  eventos: number;
  expirados: number;
}

export interface ResumenQuejas {
  total: number;
  quejas: number;
  sugerencias: number;
  pendientes: number;
}

export interface ResultadosEncuesta {
  encuesta: string;
  total_votos: number;
  resultados: {
    opcion_id: number;
    texto: string;
    votos: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  private apiUrl = 'http://127.0.0.1:8000/api/comunicacion';

  constructor(private http: HttpClient) { }

  // ========== ADAPTADORES ==========
  private adaptarFecha(fechaString: string): Date {
    return new Date(fechaString);
  }

  private crearParams(filtros: any): HttpParams {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null) {
        params = params.set(key, filtros[key].toString());
      }
    });
    return params;
  }

  // ========== ANUNCIOS ==========
  getAnuncios(filtros?: FiltroAnuncios): Observable<Anuncio[]> {
    const params = filtros ? this.crearParams(filtros) : new HttpParams();
    return this.http.get<Anuncio[]>(`${this.apiUrl}/anuncios/`, { params });
  }

  getAnuncio(id: number): Observable<Anuncio> {
    return this.http.get<Anuncio>(`${this.apiUrl}/anuncios/${id}/`);
  }

  crearAnuncio(anuncio: CrearAnuncio): Observable<Anuncio> {
    return this.http.post<Anuncio>(`${this.apiUrl}/anuncios/`, anuncio);
  }

  actualizarAnuncio(id: number, anuncio: Partial<CrearAnuncio>): Observable<Anuncio> {
    return this.http.put<Anuncio>(`${this.apiUrl}/anuncios/${id}/`, anuncio);
  }

  eliminarAnuncio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/anuncios/${id}/`);
  }

  // ENDPOINTS ESPECIALES DE ANUNCIOS
  getAnunciosActivos(): Observable<Anuncio[]> {
    return this.http.get<Anuncio[]>(`${this.apiUrl}/anuncios/activos/`);
  }

  getEstadisticasAnuncios(): Observable<EstadisticasAnuncios> {
    return this.http.get<EstadisticasAnuncios>(`${this.apiUrl}/anuncios/estadisticas/`);
  }

  marcarAnuncioLeido(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/anuncios/${id}/marcar_leido/`, {});
  }

  // ========== MENSAJES ==========
  getMensajes(filtros?: { search?: string }): Observable<Mensaje[]> {
    const params = filtros ? this.crearParams(filtros) : new HttpParams();
    return this.http.get<Mensaje[]>(`${this.apiUrl}/mensajes/`, { params });
  }

  getMensaje(id: number): Observable<Mensaje> {
    return this.http.get<Mensaje>(`${this.apiUrl}/mensajes/${id}/`);
  }

  enviarMensaje(mensaje: CrearMensaje): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.apiUrl}/mensajes/`, mensaje);
  }

  actualizarMensaje(id: number, mensaje: Partial<CrearMensaje>): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.apiUrl}/mensajes/${id}/`, mensaje);
  }

  eliminarMensaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mensajes/${id}/`);
  }

  // ENDPOINTS ESPECIALES DE MENSAJES
  marcarMensajeLeido(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mensajes/${id}/marcar_leido/`, {});
  }

  getMensajesNoLeidos(): Observable<{ no_leidos: number }> {
    return this.http.get<{ no_leidos: number }>(`${this.apiUrl}/mensajes/no_leidos/`);
  }

  // ========== QUEJAS/SUGERENCIAS ==========
  getQuejas(filtros?: FiltroQuejas): Observable<QuejaSugerencia[]> {
    const params = filtros ? this.crearParams(filtros) : new HttpParams();
    return this.http.get<QuejaSugerencia[]>(`${this.apiUrl}/quejas-sugerencias/`, { params });
  }

  getQueja(id: number): Observable<QuejaSugerencia> {
    return this.http.get<QuejaSugerencia>(`${this.apiUrl}/quejas-sugerencias/${id}/`);
  }

  crearQueja(queja: CrearQuejaSugerencia): Observable<QuejaSugerencia> {
    return this.http.post<QuejaSugerencia>(`${this.apiUrl}/quejas-sugerencias/`, queja);
  }

  actualizarQueja(id: number, queja: Partial<CrearQuejaSugerencia>): Observable<QuejaSugerencia> {
    return this.http.put<QuejaSugerencia>(`${this.apiUrl}/quejas-sugerencias/${id}/`, queja);
  }

  eliminarQueja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/quejas-sugerencias/${id}/`);
  }

  // ENDPOINTS ESPECIALES DE QUEJAS
  cambiarEstadoQueja(id: number, estado: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/quejas-sugerencias/${id}/cambiar_estado/`, { estado });
  }

  getResumenQuejas(): Observable<ResumenQuejas> {
    return this.http.get<ResumenQuejas>(`${this.apiUrl}/quejas-sugerencias/resumen/`);
  }

  // ========== ENCUESTAS ==========
  getEncuestas(filtros?: FiltroEncuestas): Observable<Encuesta[]> {
    const params = filtros ? this.crearParams(filtros) : new HttpParams();
    return this.http.get<Encuesta[]>(`${this.apiUrl}/encuestas/`, { params });
  }

  getEncuesta(id: number): Observable<Encuesta> {
    return this.http.get<Encuesta>(`${this.apiUrl}/encuestas/${id}/`);
  }

  crearEncuesta(encuesta: CrearEncuesta): Observable<Encuesta> {
    return this.http.post<Encuesta>(`${this.apiUrl}/encuestas/`, encuesta);
  }

  actualizarEncuesta(id: number, encuesta: Partial<CrearEncuesta>): Observable<Encuesta> {
    return this.http.put<Encuesta>(`${this.apiUrl}/encuestas/${id}/`, encuesta);
  }

  eliminarEncuesta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/encuestas/${id}/`);
  }

  // ENDPOINTS ESPECIALES DE ENCUESTAS
  votarEncuesta(encuestaId: number, opcionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/encuestas/${encuestaId}/votar/`, { opcion_id: opcionId });
  }

  cerrarEncuesta(encuestaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/encuestas/${encuestaId}/cerrar/`, {});
  }

  getResultadosEncuesta(encuestaId: number): Observable<ResultadosEncuesta> {
    return this.http.get<ResultadosEncuesta>(`${this.apiUrl}/encuestas/${encuestaId}/resultados/`);
  }

  // ========== CHAT COMUNITARIO ==========
  getMensajesChat(): Observable<ChatMensaje[]> {
    return this.http.get<ChatMensaje[]>(`${this.apiUrl}/chat/`);
  }

  getUltimosMensajesChat(): Observable<ChatMensaje[]> {
    return this.http.get<ChatMensaje[]>(`${this.apiUrl}/chat/ultimos/`);
  }

  enviarMensajeChat(mensaje: CrearChatMensaje): Observable<ChatMensaje> {
    return this.http.post<ChatMensaje>(`${this.apiUrl}/chat/`, mensaje);
  }

  eliminarMensajeChat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/chat/${id}/`);
  }

  // ========== MÉTODOS DE UTILIDAD ==========
  getTiposAnuncio(): { value: string, label: string }[] {
    return [
      { value: 'ANUNCIO', label: '📋 Anuncio General' },
      { value: 'URGENTE', label: '🚨 Urgente' },
      { value: 'EVENTO', label: '📅 Evento' }
    ];
  }

  getTiposQueja(): { value: string, label: string }[] {
    return [
      { value: 'QUEJA', label: '⚠️ Queja' },
      { value: 'SUGERENCIA', label: '💡 Sugerencia' }
    ];
  }

  getEstadosQueja(): { value: string, label: string }[] {
    return [
      { value: 'PENDIENTE', label: '⏳ Pendiente' },
      { value: 'EN_PROCESO', label: '🔄 En Proceso' },
      { value: 'RESUELTO', label: '✅ Resuelto' }
    ];
  }
}