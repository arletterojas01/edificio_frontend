// tickets.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Importa las interfaces desde el archivo separado
import { 
  Ticket, 
  Categoria, 
  TicketsResponse, 
  EstadisticasResponse,
  ComentarioTicket 
} from './ticket.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private apiUrl = 'http://127.0.0.1:8000/api/tickets';

  constructor(private http: HttpClient) { }

  // ==================== TICKETS ====================
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener tickets:', error);
          return of([]);
        })
      );
  }

  createTicket(ticketData: any): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets/`, ticketData)
      .pipe(
        catchError((error: any) => {
          console.error('Error al crear ticket:', error);
          throw error;
        })
      );
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/tickets/${id}/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener ticket:', error);
          throw error;
        })
      );
  }

  updateTicket(id: number, ticketData: any): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/tickets/${id}/`, ticketData)
      .pipe(
        catchError((error: any) => {
          console.error('Error al actualizar ticket:', error);
          throw error;
        })
      );
  }

  eliminarTicket(ticketId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tickets/${ticketId}/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al eliminar ticket:', error);
          throw error;
        })
      );
  }

  // ==================== MÉTODO GETRECENTTICKETS ====================
  getRecentTickets(limit: number = 5): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener tickets recientes:', error);
          return of([]);
        })
      );
  }

  // ==================== ACCIONES DE TICKETS ====================
  agregarComentario(ticketId: number, comentarioData: { contenido: string, es_interno: boolean }): Observable<ComentarioTicket> {
    return this.http.post<ComentarioTicket>(
      `${this.apiUrl}/tickets/${ticketId}/agregar_comentario/`, 
      comentarioData
    ).pipe(
      catchError((error: any) => {
        console.error('Error al agregar comentario:', error);
        throw error;
      })
    );
  }

  cambiarEstado(ticketId: number, nuevoEstado: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/tickets/${ticketId}/cambiar_estado/`, 
      { estado: nuevoEstado }
    ).pipe(
      catchError((error: any) => {
        console.error('Error al cambiar estado:', error);
        throw error;
      })
    );
  }

  // ==================== MÉTODOS PARA TÉCNICOS ====================
  getTecnicosDisponibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets/tecnicos_disponibles/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener técnicos disponibles:', error);
          return of({ tecnicos: [] });
        })
      );
  }

  asignarTecnicoCompleto(ticketId: number, datosAsignacion: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/tickets/${ticketId}/asignar_tecnico_completo/`, 
      datosAsignacion
    ).pipe(
      catchError((error: any) => {
        console.error('Error al asignar técnico completo:', error);
        throw error;
      })
    );
  }

  registrarTecnico(ticketId: number, datosTecnico: { nombre_tecnico: string, salario: number, comentario_solucion: string }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/tickets/${ticketId}/registrar_tecnico/`, 
      datosTecnico
    ).pipe(
      catchError((error: any) => {
        console.error('Error al registrar técnico:', error);
        throw error;
      })
    );
  }

  desasignarTecnico(ticketId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/tickets/${ticketId}/desasignar_tecnico/`, 
      {}
    ).pipe(
      catchError((error: any) => {
        console.error('Error al desasignar técnico:', error);
        throw error;
      })
    );
  }

  asignarTecnico(ticketId: number, tecnicoId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/tickets/${ticketId}/asignar_tecnico/`, 
      { tecnico_id: tecnicoId }
    ).pipe(
      catchError((error: any) => {
        console.error('Error al asignar técnico:', error);
        throw error;
      })
    );
  }

  agregarImagenes(ticketId: number, imagenes: File[]): Observable<any> {
    const formData = new FormData();
    imagenes.forEach(imagen => {
      formData.append('imagenes', imagen);
    });

    return this.http.post(
      `${this.apiUrl}/tickets/${ticketId}/agregar_imagenes/`, 
      formData
    ).pipe(
      catchError((error: any) => {
        console.error('Error al agregar imágenes:', error);
        throw error;
      })
    );
  }

  // ==================== CATEGORÍAS ====================
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener categorías:', error);
          return of([]);
        })
      );
  }

  // ==================== ENDPOINTS ESPECIALES ====================
  getMisTickets(): Observable<TicketsResponse> {
    return this.http.get<TicketsResponse>(`${this.apiUrl}/tickets/mis_tickets/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener mis tickets:', error);
          return of({ reportados: [], asignados: [] });
        })
      );
  }

  getEstadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(`${this.apiUrl}/tickets/estadisticas/`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener estadísticas:', error);
          return of({ 
            totales: { total: 0, abiertos: 0, en_progreso: 0, cerrados: 0 },
            por_categoria: [],
            por_prioridad: []
          });
        })
      );
  }

  // ==================== MÉTODOS AUXILIARES ====================
  getEstadoDisplay(estado: string): string {
    const estados: { [key: string]: string } = {
      'abierto': '🟡 Abierto',
      'en_progreso': '🔵 En Progreso', 
      'espera_repuestos': '🟠 Espera Repuestos',
      'cerrado': '🟢 Cerrado',
      'cancelado': '🔴 Cancelado'
    };
    return estados[estado] || estado;
  }

  getPrioridadDisplay(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      'baja': '🟢 Baja',
      'media': '🟡 Media',
      'alta': '🟠 Alta', 
      'urgente': '🔴 Urgente'
    };
    return prioridades[prioridad] || prioridad;
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'abierto': 'badge bg-warning',
      'en_progreso': 'badge bg-primary',
      'espera_repuestos': 'badge bg-orange',
      'cerrado': 'badge bg-success',
      'cancelado': 'badge bg-danger'
    };
    return classes[estado] || 'badge bg-secondary';
  }

  getPrioridadClass(prioridad: string): string {
    const classes: { [key: string]: string } = {
      'baja': 'badge bg-success',
      'media': 'badge bg-warning',
      'alta': 'badge bg-orange', 
      'urgente': 'badge bg-danger'
    };
    return classes[prioridad] || 'badge bg-secondary';
  }
}