import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AreaComun, DisponibilidadResponse } from '../reserva.model';

@Component({
  selector: 'app-formulario-reserva',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './formulario-reserva.component.html',
  styleUrls: ['./formulario-reserva.component.scss']
})
export class FormularioReservaComponent implements OnInit {

  reservaForm: FormGroup;
  
  areasComunes: AreaComun[] = [];

  horariosInicio: string[] = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  horariosFin: string[] = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00','22:00'];

  error: string | null = null;
  mensaje: string | null = null;
  cargando = false;
  verificandoDisponibilidad = false;
  disponible = false;
  disponibilidadVerificada = false;
  cargandoAreas = true;

  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.reservaForm = this.fb.group({
      area_comun: ['', Validators.required],
      fecha_reserva: ['', [Validators.required, this.validarFecha.bind(this)]],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required],
      monto: [{ value: 0, disabled: true }]
    }, { 
      validators: this.validarHorarios.bind(this)
    });
  }

  ngOnInit(): void {
    console.log('🔧 FormularioReservaComponent INICIADO');
    this.cargarAreasComunes();

    this.reservaForm.get('area_comun')?.valueChanges.subscribe(() => {
      this.calcularMonto();
    });

    this.reservaForm.get('hora_inicio')?.valueChanges.subscribe(() => {
      this.calcularMonto();
      this.validarHorariosIndividual();
    });

    this.reservaForm.get('hora_fin')?.valueChanges.subscribe(() => {
      this.calcularMonto();
      this.validarHorariosIndividual();
    });
  }

  // ✅ VALIDADOR GLOBAL PARA HORARIOS
  validarHorarios(control: AbstractControl): ValidationErrors | null {
    const horaInicio = control.get('hora_inicio')?.value;
    const horaFin = control.get('hora_fin')?.value;

    if (!horaInicio || !horaFin) {
      return null;
    }

    const horasInicio = this.convertirHoraAMinutos(horaInicio);
    const horasFin = this.convertirHoraAMinutos(horaFin);

    if (horasInicio >= horasFin) {
      return { horariosInvalidos: true };
    }

    return null;
  }

  // ✅ VALIDACIÓN INDIVIDUAL PARA MOSTRAR ERRORES EN TIEMPO REAL
  validarHorariosIndividual(): void {
    const horaInicio = this.reservaForm.get('hora_inicio')?.value;
    const horaFin = this.reservaForm.get('hora_fin')?.value;

    if (horaInicio && horaFin) {
      const horasInicio = this.convertirHoraAMinutos(horaInicio);
      const horasFin = this.convertirHoraAMinutos(horaFin);

      if (horasInicio >= horasFin) {
        this.reservaForm.get('hora_fin')?.setErrors({ horaFinInvalida: true });
      } else {
        this.reservaForm.get('hora_fin')?.setErrors(null);
      }
    }
  }

  // ✅ CONVERTIR HORA A MINUTOS PARA COMPARACIÓN
  convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  cargarAreasComunes(): void {
    this.cargandoAreas = true;
    this.error = null;

    console.log('🔄 Cargando áreas comunes...');
    
    this.http.get<AreaComun[]>(`${this.apiUrl}/reservas/areas-comunes/`)
      .subscribe({
        next: (areas) => {
          console.log('✅ Áreas cargadas:', areas);
          if (areas && areas.length > 0) {
            this.areasComunes = areas;
            this.mensaje = null;
          } else {
            console.warn('⚠️ No se cargaron áreas, usando datos estáticos');
            this.usarDatosEstaticos();
          }
          this.cargandoAreas = false;
        },
        error: (error) => {
          console.error('❌ Error cargando áreas:', error);
          this.usarDatosEstaticos();
          this.cargandoAreas = false;
          this.mensaje = null;
        }
      });
  }

  usarDatosEstaticos(): void {
    console.log('📋 Usando datos estáticos de áreas');
    this.areasComunes = [
      { 
        id: 1, 
        nombre: 'Salón Principal', 
        tipo: 'salon', 
        tarifa: 100, 
        capacidad: 50, 
        descripcion: 'Salón para eventos sociales', 
        activo: true 
      },
      { 
        id: 2, 
        nombre: 'Gimnasio', 
        tipo: 'gimnasio', 
        tarifa: 50, 
        capacidad: 20, 
        descripcion: 'Área de ejercicios', 
        activo: true 
      },
      { 
        id: 3, 
        nombre: 'Terraza Jardín', 
        tipo: 'terraza', 
        tarifa: 75, 
        capacidad: 30, 
        descripcion: 'Terraza con área verde', 
        activo: true 
      },
      { 
        id: 4, 
        nombre: 'Piscina', 
        tipo: 'piscina', 
        tarifa: 80, 
        capacidad: 15, 
        descripcion: 'Piscina comunitaria', 
        activo: true 
      },
      { 
        id: 5, 
        nombre: 'Sala de Juegos', 
        tipo: 'salon', 
        tarifa: 40, 
        capacidad: 25, 
        descripcion: 'Sala de entretenimiento', 
        activo: true 
      }
    ];
  }

  calcularMonto(): void {
    const areaId = this.reservaForm.get('area_comun')?.value;
    const horaInicio = this.reservaForm.get('hora_inicio')?.value;
    const horaFin = this.reservaForm.get('hora_fin')?.value;

    if (!areaId || !horaInicio || !horaFin) {
      this.reservaForm.patchValue({ monto: 0 });
      return;
    }

    const area = this.areasComunes.find(a => a.id === parseInt(areaId));
    if (!area || !area.tarifa) {
      this.reservaForm.patchValue({ monto: 0 });
      return;
    }

    const horas = this.calcularHoras(horaInicio, horaFin);
    const montoTotal = horas * area.tarifa;

    this.reservaForm.patchValue({ monto: montoTotal });
  }

  calcularHoras(horaInicio: string, horaFin: string): number {
    const [horaIni, minutoIni] = horaInicio.split(':').map(Number);
    const [horaFinNum, minutoFin] = horaFin.split(':').map(Number);
    
    const inicioMinutos = horaIni * 60 + minutoIni;
    const finMinutos = horaFinNum * 60 + minutoFin;
    
    const diferenciaMinutos = finMinutos - inicioMinutos;
    const horas = diferenciaMinutos / 60;
    
    return Math.max(0, horas);
  }

  getFechaMinima(): string {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset() * 60000;
    const localDate = new Date(hoy.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      const date = new Date(fecha + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getFechaDisplay(): string {
    const fecha = this.reservaForm.get('fecha_reserva')?.value;
    if (!fecha) return 'No seleccionada';
    return this.formatearFecha(fecha);
  }

  getAreaDisplayName(areaId: number): string {
    const area = this.areasComunes.find(a => a.id === areaId);
    return area ? area.nombre : 'Área no encontrada';
  }

  validarFecha(control: any) {
    if (!control.value) return null;
    
    try {
      const fechaSeleccionada = new Date(control.value + 'T00:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const fechaSelSinHora = new Date(fechaSeleccionada);
      fechaSelSinHora.setHours(0, 0, 0, 0);
      
      return fechaSelSinHora < hoy ? { fechaInvalida: true } : null;
    } catch (error) {
      return { fechaInvalida: true };
    }
  }

  verificarDisponibilidad(): void {
    this.error = null;
    this.mensaje = null;

    if (this.reservaForm.invalid) {
      this.marcarControlesComoTocados();
      
      if (this.reservaForm.errors?.['horariosInvalidos']) {
        this.error = 'La hora de fin debe ser posterior a la hora de inicio';
      } else {
        this.error = 'Por favor completa todos los campos requeridos';
      }
      return;
    }

    const formValue = this.reservaForm.getRawValue();
    
    const disponibilidadData = {
      area_comun: parseInt(formValue.area_comun),
      fecha_reserva: formValue.fecha_reserva,
      hora_inicio: formValue.hora_inicio + ':00',
      hora_fin: formValue.hora_fin + ':00'
    };

    console.log('🔍 Verificando disponibilidad:', disponibilidadData);
    
    this.verificandoDisponibilidad = true;

    this.http.post<DisponibilidadResponse>(
      `${this.apiUrl}/reservas/verificar-disponibilidad/`, 
      disponibilidadData
    ).subscribe({
      next: (response) => {
        console.log('✅ Respuesta disponibilidad:', response);
        this.verificandoDisponibilidad = false;
        this.disponibilidadVerificada = true;
        this.disponible = response.disponible;
        
        if (this.disponible) {
          this.mensaje = response.mensaje || '¡Horario disponible! Puedes crear tu reserva.';
        } else {
          this.error = response.mensaje || 'El horario seleccionado no está disponible. Por favor elige otro horario.';
        }
      },
      error: (error) => {
        console.error('❌ Error verificando disponibilidad:', error);
        this.verificandoDisponibilidad = false;
        this.disponibilidadVerificada = false;
        
        if (error.error && error.error.error) {
          this.error = `Error: ${error.error.error}`;
        } else if (error.error && error.error.detail) {
          this.error = `Error: ${error.error.detail}`;
        } else {
          this.error = 'Error al verificar disponibilidad. Intenta nuevamente.';
        }
      }
    });
  }

  getDuracionHoras(): number {
    const horaInicio = this.reservaForm.get('hora_inicio')?.value;
    const horaFin = this.reservaForm.get('hora_fin')?.value;
    
    if (!horaInicio || !horaFin) return 0;
    
    return this.calcularHoras(horaInicio, horaFin);
  }

  crearReserva(): void {
  console.log('🚀 INICIANDO creación de reserva...');
  
  this.error = null;
  this.mensaje = null;

  if (this.reservaForm.invalid) {
    console.log('❌ Formulario inválido');
    this.marcarControlesComoTocados();
    
    if (this.reservaForm.errors?.['horariosInvalidos']) {
      this.error = 'La hora de fin debe ser posterior a la hora de inicio';
    } else {
      this.error = 'Por favor completa todos los campos requeridos';
    }
    return;
  }

  if (!this.disponible && this.disponibilidadVerificada) {
    console.log('❌ Disponibilidad no verificada');
    this.error = 'Debes verificar la disponibilidad antes de crear la reserva';
    return;
  }

  const formValue = this.reservaForm.getRawValue();
  
  console.log('📋 DATOS DEL FORMULARIO:', formValue);
  
  const reservaData = {
    area_comun: parseInt(formValue.area_comun),
    fecha_reserva: formValue.fecha_reserva,
    hora_inicio: formValue.hora_inicio + ':00',
    hora_fin: formValue.hora_fin + ':00'
  };

  console.log('📤 ENVIANDO AL BACKEND:', reservaData);
  console.log('🎯 URL CORRECTA: /reservas/crear-reserva/');

  this.cargando = true;

  // ✅✅✅ SOLO CAMBIA ESTA LÍNEA - usa /crear-reserva/ en lugar de /
  this.http.post(`${this.apiUrl}/reservas/crear-reserva/`, reservaData)
    .subscribe({
      next: (response: any) => {
        console.log('✅✅✅ RESERVA CREADA EXITOSAMENTE:', response);
        
        this.enviarConfirmacionEmail(response.id);
        
        this.cargando = false;
        this.mensaje = '✅ Reserva creada exitosamente. Enviando confirmación por email...';
        
        setTimeout(() => {
          this.router.navigate(['/reservas/mis-reservas']);
        }, 3000);
      },
      error: (error) => {
        console.error('❌❌❌ ERROR CREANDO RESERVA:', error);
        this.cargando = false;
        
        if (error.error) {
          console.error('📋 ERROR DETAILS:', error.error);
          if (error.error.error) {
            this.error = `Error: ${error.error.error}`;
          } else if (error.error.non_field_errors) {
            this.error = `Error: ${error.error.non_field_errors[0]}`;
          } else {
            this.error = 'Error al crear la reserva. Verifica los datos.';
          }
        } else {
          this.error = `Error ${error.status}: ${error.statusText || 'Error de conexión'}`;
        }
      }
    });
}

  private enviarConfirmacionEmail(reservaId: number): void {
    this.http.post(`${this.apiUrl}/reservas/${reservaId}/enviar-confirmacion/`, {})
      .subscribe({
        next: (response: any) => {
          console.log('✅ Email de confirmación enviado:', response);
          this.mensaje = '✅ Reserva creada y confirmación enviada por email';
        },
        error: (error) => {
          console.error('❌ Error enviando email:', error);
          console.log('⚠️ Reserva creada pero no se pudo enviar el email de confirmación');
        }
      });
  }

  private marcarControlesComoTocados(): void {
    Object.keys(this.reservaForm.controls).forEach(key => {
      this.reservaForm.get(key)?.markAsTouched();
    });
  }

  get horariosInvalidos(): boolean {
    return this.reservaForm.errors?.['horariosInvalidos'] && 
           this.reservaForm.get('hora_inicio')?.touched && 
           this.reservaForm.get('hora_fin')?.touched;
  }

  get horaFinInvalida(): boolean {
    return this.reservaForm.get('hora_fin')?.errors?.['horaFinInvalida'] && 
           this.reservaForm.get('hora_fin')?.touched;
  }
}