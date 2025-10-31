import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { Categoria } from '../../services/ticket.interfaces'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TicketCreateComponent implements OnInit {
  ticketForm: FormGroup;
  categorias: Categoria[] = [];
  loading = false;
  submitted = false;
  error = '';
  selectedFiles: File[] = [];

  prioridades = [
    { value: 'baja', label: '🟢 Baja' },
    { value: 'media', label: '🟡 Media' },
    { value: 'alta', label: '🟠 Alta' },
    { value: 'urgente', label: '🔴 Urgente' }
  ];

  constructor(
    private fb: FormBuilder,
    private ticketsService: TicketsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.ticketForm = this.createForm();
  }

  ngOnInit() {
    this.loadCategorias();
  }

  createForm(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['', Validators.required],
      prioridad: ['media', Validators.required],
      ubicacion: [''],
      piso: [''],
      departamento: [''],
      area: [''],
      es_urgente: [false] // ✅ AÑADIR ESTE CAMPO
    });
  }

  loadCategorias() {
    this.ticketsService.getCategorias().subscribe({
      next: (data: any) => {
        this.categorias = data;
        console.log('✅ Categorías cargadas:', this.categorias);
      },
      error: (error: any) => {
        console.error('❌ Error al cargar categorías:', error);
        this.error = 'Error al cargar las categorías';
      }
    });
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.selectedFiles = Array.from(files);
    }
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  removeFile(index: number) {
    if (this.selectedFiles[index]) {
      URL.revokeObjectURL(this.getImagePreview(this.selectedFiles[index]));
    }
    this.selectedFiles.splice(index, 1);
  }

  // ✅ MÉTODO CORREGIDO - CON DEBUGGING
  onSubmit() {
    this.submitted = true;
    
    if (this.ticketForm.invalid) {
      console.log('❌ Formulario inválido');
      this.marcarCamposInvalidos();
      return;
    }

    this.loading = true;
    this.error = '';

    // ✅ PREPARAR DATOS CORRECTAMENTE
    const formData = {
      ...this.ticketForm.value,
      categoria: parseInt(this.ticketForm.value.categoria), // ✅ Convertir a número
      // El campo 'usuario' se asignará automáticamente en el backend
    };

    console.log('📤 Enviando datos del ticket:', formData);
    console.log('🔍 Tipo de categoría:', typeof formData.categoria);

    this.ticketsService.createTicket(formData).subscribe({
      next: (ticket: any) => {
        console.log('✅ Ticket creado exitosamente:', ticket);
        
        // Subir imágenes si hay
        if (this.selectedFiles.length > 0) {
          this.ticketsService.agregarImagenes(ticket.id_ticket, this.selectedFiles).subscribe({
            next: () => {
              console.log('✅ Imágenes subidas exitosamente');
              this.loading = false;
              this.router.navigate(['/tickets', ticket.id_ticket]);
            },
            error: (error: any) => {
              console.error('❌ Error subiendo imágenes:', error);
              this.loading = false;
              // Redirigir igual aunque falle la subida de imágenes
              this.router.navigate(['/tickets', ticket.id_ticket]);
            }
          });
        } else {
          this.loading = false;
          this.router.navigate(['/tickets', ticket.id_ticket]);
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('❌ Error creando ticket:', error);
        console.log('🔍 Error response:', error.error);
        
        // Mostrar error específico
        if (error.error && typeof error.error === 'object') {
          this.error = this.obtenerMensajeError(error.error);
        } else {
          this.error = 'Error al crear el ticket. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  // ✅ MÉTODO PARA OBTENER MENSAJES DE ERROR
  obtenerMensajeError(error: any): string {
    if (error.detail) {
      return error.detail;
    }
    if (error.non_field_errors) {
      return error.non_field_errors.join(', ');
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Error desconocido al crear el ticket';
  }

  // ✅ MÉTODO PARA DEBUGGEAR CAMPOS INVÁLIDOS
  marcarCamposInvalidos() {
    Object.keys(this.ticketForm.controls).forEach(key => {
      const control = this.ticketForm.get(key);
      if (control?.invalid) {
        console.log(`❌ Campo ${key} es inválido:`, control.errors);
      }
    });
  }

  get f() { return this.ticketForm.controls; }

  cancel() {
    this.router.navigate(['/tickets']);
  }
}