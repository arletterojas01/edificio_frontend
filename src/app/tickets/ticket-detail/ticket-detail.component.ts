import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { Ticket, ComentarioTicket, ImagenTicket } from '../../services/ticket.interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule
  ]
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  loading = false;
  comentarioForm: FormGroup;
  
  addingComment: boolean = false;
  estados: any[] = [
    { value: 'abierto', label: '🟡 Abierto' },
    { value: 'en_progreso', label: '🔵 En Progreso' },
    { value: 'espera_repuestos', label: '🟠 Espera Repuestos' },
    { value: 'cerrado', label: '🟢 Cerrado' },
    { value: 'cancelado', label: '🔴 Cancelado' }
  ];
  
  selectedFiles: File[] = [];

  // VARIABLES PARA REGISTRAR TÉCNICO
  asignandoTecnico: boolean = false;
  mostrarFormularioTecnico: boolean = false;
  formularioTecnico: FormGroup;
  
  // ✅ NUEVA VARIABLE: Guardar el nombre del técnico externo
  tecnicoExternoNombre: string = '';

  // VARIABLES PARA ELIMINAR TICKET
  eliminandoTicket: boolean = false;
  mostrarConfirmacionEliminar: boolean = false;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    public authService: AuthService
  ) {
    this.comentarioForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(5)]],
      es_interno: [false]
    });

    // Formulario para registrar técnico
    this.formularioTecnico = this.fb.group({
      nombre_tecnico: ['', Validators.required],
      salario: ['', [Validators.required, Validators.min(0)]],
      comentario_solucion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.loadTicket();
  }

  loadTicket() {
    this.loading = true;
    const ticketId = this.route.snapshot.params['id'];
    
    this.ticketsService.getTicket(+ticketId).subscribe({
      next: (ticket: Ticket) => {
        this.ticket = ticket;
        this.loading = false;
        
        // ✅ SI EL TICKET TIENE TÉCNICO PERO NO HAY NOMBRE EXTERNO GUARDADO,
        // BUSCAR EN LOS COMENTARIOS EL NOMBRE DEL TÉCNICO EXTERNO
        if (this.ticket?.tecnico_asignado && !this.tecnicoExternoNombre) {
          this.buscarNombreTecnicoEnComentarios();
        }
        
        this.verDatosTicket(); // DEBUG
      },
      error: (error: any) => {
        console.error('Error cargando ticket:', error);
        this.loading = false;
      }
    });
  }

  // ✅ MÉTODO PARA BUSCAR EL NOMBRE DEL TÉCNICO EN LOS COMENTARIOS
  buscarNombreTecnicoEnComentarios() {
    if (!this.ticket?.comentarios) return;
    
    const comentarioTecnico = this.ticket.comentarios.find(comentario => 
      comentario.contenido.includes('INFORMACIÓN DEL TÉCNICO') ||
      comentario.contenido.includes('👨‍🔧')
    );
    
    if (comentarioTecnico) {
      // Extraer el nombre del técnico del comentario
      const regex = /Nombre del técnico:\s*([^\n]+)/i;
      const match = comentarioTecnico.contenido.match(regex);
      
      if (match && match[1]) {
        this.tecnicoExternoNombre = match[1].trim();
        console.log('🔍 Nombre de técnico encontrado en comentarios:', this.tecnicoExternoNombre);
      }
    }
  }

  // MÉTODOS EXISTENTES
  getNombreCompletoUsuario(): string {
    if (!this.ticket) return '';
    return `${this.ticket.usuario_nombre || ''} ${this.ticket.usuario_apellido || ''}`.trim();
  }

  getNombreCompletoTecnico(): string {
    if (!this.ticket) return 'No asignado';
    
    // ✅ PRIMERO: Mostrar el nombre del técnico externo si existe
    if (this.tecnicoExternoNombre) {
      return this.tecnicoExternoNombre;
    }
    
    // ✅ SEGUNDO: Mostrar el nombre del técnico del sistema
    if (this.ticket.tecnico_nombre) {
      if (this.ticket.tecnico_apellido) {
        return `${this.ticket.tecnico_nombre} ${this.ticket.tecnico_apellido}`.trim();
      }
      return this.ticket.tecnico_nombre;
    }
    
    return 'No asignado';
  }

  getImageUrl(imageName: string): string {
    if (!imageName) return '';
    return `http://127.0.0.1:8000${imageName}`;
  }

  getEmailUsuario(): string {
    if (!this.ticket) return '';
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.email || 'No disponible';
  }

  getNombreAutorComentario(comentario: ComentarioTicket): string {
    if (comentario.es_interno) {
      return 'Personal Técnico';
    }
    return this.getNombreCompletoUsuario();
  }

  getNombreArchivo(rutaArchivo: string): string {
    if (!rutaArchivo) return 'archivo';
    return rutaArchivo.split('/').pop() || 'archivo';
  }

  puedeComentarInterno(): boolean {
    return this.authService.isAdmin() || this.authService.isPersonal();
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
  }

  puedeCambiarEstado(): boolean {
    if (!this.ticket) return false;
    return this.authService.isAdmin() || this.authService.isPersonal();
  }

  agregarComentario() {
    if (this.comentarioForm.valid && this.ticket) {
      this.addingComment = true;
      
      const comentarioData = {
        contenido: this.comentarioForm.get('contenido')?.value,
        es_interno: this.comentarioForm.get('es_interno')?.value
      };

      this.ticketsService.agregarComentario(
        this.ticket.id_ticket, 
        comentarioData
      ).subscribe({
        next: () => {
          this.comentarioForm.reset({ contenido: '', es_interno: false });
          this.selectedFiles = [];
          this.addingComment = false;
          this.loadTicket();
        },
        error: (error: any) => {
          console.error('Error agregando comentario:', error);
          this.addingComment = false;
        }
      });
    }
  }

  cambiarEstado(nuevoEstado: string) {
    if (this.ticket) {
      this.ticketsService.cambiarEstado(this.ticket.id_ticket, nuevoEstado).subscribe({
        next: () => {
          this.loadTicket();
        },
        error: (error: any) => {
          console.error('Error cambiando estado:', error);
        }
      });
    }
  }

  onEstadoChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.cambiarEstado(target.value);
    }
  }

  get esAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get esPersonal(): boolean {
    return this.authService.isPersonal();
  }

  getEstadoClass(estado: string): string {
    return this.ticketsService.getEstadoClass(estado);
  }

  getEstadoDisplay(estado: string): string {
    return this.ticketsService.getEstadoDisplay(estado);
  }

  getPrioridadClass(prioridad: string): string {
    return this.ticketsService.getPrioridadClass(prioridad);
  }

  getPrioridadDisplay(prioridad: string): string {
    return this.ticketsService.getPrioridadDisplay(prioridad);
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  downloadFile(adjunto: string): void {
    const link = document.createElement('a');
    link.href = this.getImageUrl(adjunto);
    link.download = adjunto.split('/').pop() || 'archivo';
    link.target = '_blank';
    link.click();
  }

  getTipoArchivo(nombreArchivo: string): string {
    const extension = nombreArchivo.toLowerCase().split('.').pop();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return 'imagen';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'word';
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return 'excel';
    } else {
      return 'archivo';
    }
  }

  // =========================================================================
  // MÉTODOS PARA REGISTRAR TÉCNICO - VERSIÓN CORREGIDA (USANDO ENDPOINT REAL)
  // =========================================================================

  abrirFormularioTecnico() {
    this.mostrarFormularioTecnico = true;
    this.formularioTecnico.reset();
  }

  cancelarAsignacion() {
    this.mostrarFormularioTecnico = false;
    this.formularioTecnico.reset();
  }

  registrarTecnico() {
    if (this.formularioTecnico.valid && this.ticket) {
      this.asignandoTecnico = true;

      const datosTecnico = {
        nombre_tecnico: this.formularioTecnico.get('nombre_tecnico')?.value,
        salario: this.formularioTecnico.get('salario')?.value,
        comentario_solucion: this.formularioTecnico.get('comentario_solucion')?.value
      };

      // ✅ GUARDAR EL NOMBRE DEL TÉCNICO EXTERNO
      this.tecnicoExternoNombre = datosTecnico.nombre_tecnico;

      console.log('📤 Registrando técnico en BD:', datosTecnico);
      console.log('👨‍🔧 Nombre técnico externo guardado:', this.tecnicoExternoNombre);

      // ✅ USAR EL ENDPOINT REAL QUE GUARDA EN LA BD
      this.ticketsService.registrarTecnico(
        this.ticket.id_ticket,
        datosTecnico
      ).subscribe({
        next: (response: any) => {
          console.log('✅ Técnico registrado en BD:', response);
          
          // Cambiar estado a "en_progreso" si está en "abierto"
          if (this.ticket?.estado === 'abierto') {
            this.cambiarEstado('en_progreso');
          }
          
          this.finalizarRegistroTecnico(datosTecnico);
        },
        error: (error: any) => {
          console.error('❌ Error registrando técnico:', error);
          this.asignandoTecnico = false;
          
          const errorMsg = error.error?.error || error.error?.detail || 'Error desconocido';
          alert('❌ Error al registrar técnico: ' + errorMsg);
        }
      });
    } else {
      Object.keys(this.formularioTecnico.controls).forEach(key => {
        const control = this.formularioTecnico.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Finalizar el proceso
  finalizarRegistroTecnico(datos: any) {
    this.asignandoTecnico = false;
    this.mostrarFormularioTecnico = false;
    this.formularioTecnico.reset();
    
    console.log('✅ Proceso completado, recargando ticket...');
    alert('✅ Técnico registrado exitosamente en la base de datos.');
    
    // Recargar el ticket para ver los cambios
    this.loadTicket();
  }

  // =========================================================================
  // MÉTODOS PARA DESASIGNAR TÉCNICO - CORREGIDO
  // =========================================================================

  desasignarTecnico() {
    if (this.ticket && confirm('¿Estás seguro de desasignar al técnico?')) {
      this.asignandoTecnico = true;
      
      // ✅ USAR EL ENDPOINT ESPECÍFICO PARA DESASIGNAR
      this.ticketsService.desasignarTecnico(this.ticket.id_ticket).subscribe({
        next: (response: any) => {
          this.asignandoTecnico = false;
          
          // ✅ LIMPIAR EL NOMBRE DEL TÉCNICO EXTERNO AL DESASIGNAR
          this.tecnicoExternoNombre = '';
          
          this.loadTicket();
          alert('✅ Técnico desasignado exitosamente.');
        },
        error: (error: any) => {
          console.error('Error desasignando técnico:', error);
          this.asignandoTecnico = false;
          alert('❌ Error al desasignar técnico: ' + (error.error?.error || 'Error desconocido'));
        }
      });
    }
  }

  // =========================================================================
  // MÉTODOS PARA ELIMINAR TICKET
  // =========================================================================

  confirmarEliminarTicket() {
    if (this.ticket) {
      this.mostrarConfirmacionEliminar = true;
    }
  }

  cancelarEliminarTicket() {
    this.mostrarConfirmacionEliminar = false;
  }

  eliminarTicket() {
    if (this.ticket) {
      this.eliminandoTicket = true;
      
      this.ticketsService.eliminarTicket(this.ticket.id_ticket).subscribe({
        next: (response: any) => {
          this.eliminandoTicket = false;
          this.mostrarConfirmacionEliminar = false;
          
          alert('✅ Ticket eliminado exitosamente.');
          this.router.navigate(['/tickets']);
        },
        error: (error: any) => {
          console.error('Error eliminando ticket:', error);
          this.eliminandoTicket = false;
          this.mostrarConfirmacionEliminar = false;
          
          const errorMsg = error.error?.error || error.error?.detail || 'Error desconocido';
          alert('❌ Error al eliminar ticket: ' + errorMsg);
        }
      });
    }
  }

  // =========================================================================
  // GETTERS PARA EL TEMPLATE - CORREGIDOS
  // =========================================================================

  get tieneTecnicoAsignado(): boolean {
    if (!this.ticket) return false;
    
    // ✅ SOLUCIÓN: Solo verificar si hay un técnico REAL asignado
    // NO incluir comentarios en la verificación
    return !!(this.ticket.tecnico_asignado || this.ticket.tecnico_nombre);
  }

  get puedeRegistrarTecnico(): boolean {
    return this.esAdmin && this.ticket !== null && !this.tieneTecnicoAsignado;
  }

  get puedeEliminarTicket(): boolean {
    return this.esAdmin && this.ticket !== null;
  }

  get estaCargando(): boolean {
    return this.loading || this.addingComment || this.asignandoTecnico || this.eliminandoTicket;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return fecha;
    }
  }

  limpiarArchivos(): void {
    this.selectedFiles = [];
  }

  // DEBUG
  verDatosTicket() {
    if (!this.ticket) return;
    
    console.log('🔍 Datos actuales del ticket:', {
      id: this.ticket.id_ticket,
      tecnico_asignado: this.ticket.tecnico_asignado,
      tecnico_nombre: this.ticket.tecnico_nombre,
      tecnico_apellido: this.ticket.tecnico_apellido,
      tieneTecnicoAsignado: this.tieneTecnicoAsignado,
      nombreCompletoTecnico: this.getNombreCompletoTecnico(),
      tecnicoExternoNombre: this.tecnicoExternoNombre
    });
  }

  getHistorialTecnicos(): ComentarioTicket[] {
    if (!this.ticket || !this.ticket.comentarios) return [];
    
    return this.ticket.comentarios.filter(comentario => 
      comentario.contenido.includes('TÉCNICO REGISTRADO') ||
      comentario.contenido.includes('👨‍🔧')
    );
  }
}