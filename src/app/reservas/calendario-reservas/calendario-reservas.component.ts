import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { ReservasService } from '../reservas.service';
import { Reserva } from '../reserva.model';

@Component({
  selector: 'app-calendario-reservas',
  standalone: true,
  imports: [CommonModule, RouterModule, FullCalendarModule],
  templateUrl: './calendario-reservas.component.html',
  styleUrls: ['./calendario-reservas.component.scss']
})
export class CalendarioReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  loading = true;
  error = '';
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    editable: false,
    selectable: true,
    locale: esLocale,
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    allDaySlot: false,
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    height: 'auto'
  };

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    console.log('🎯 CalendarioReservasComponent INICIADO');
    this.cargarReservas();
  }

  cargarReservas(): void {
    console.log('🚀 INICIANDO carga de reservas desde API...');
    this.loading = true;
    this.error = '';
    
    this.reservasService.getMisReservas().subscribe({
      next: (reservas: Reserva[]) =>  {
        console.log('✅✅✅ LLAMADA A API EXITOSA');
        console.log('📊 Número de reservas recibidas:', reservas.length);
        
        if (reservas.length === 0) {
          console.log('⚠️  EL BACKEND RESPONDIÓ CON ARRAY VACÍO');
          console.log('💡 Esto significa que no hay reservas en la base de datos para este usuario');
        } else {
          console.log('🎯 RESERVAS RECIBIDAS DEL BACKEND:');
          reservas.forEach((reserva, index) => {
            console.log(`   Reserva ${index + 1}:`, {
              id: reserva.id,
              fecha_reserva: reserva.fecha_reserva,
              hora_inicio: reserva.hora_inicio,
              hora_fin: reserva.hora_fin,
              area_comun_nombre: reserva.area_comun_nombre,
              estado: reserva.estado
            });
          });

          // Verificar la primera reserva en detalle
          const primera = reservas[0];
          console.log('🔍 DETALLE PRIMERA RESERVA:');
          console.log('   - ID:', primera.id);
          console.log('   - Fecha:', primera.fecha_reserva, '(CRÍTICO)');
          console.log('   - Hora inicio:', primera.hora_inicio);
          console.log('   - Hora fin:', primera.hora_fin);
          console.log('   - Área:', primera.area_comun_nombre);
          console.log('   - Estado:', primera.estado);
          
          // Verificar si la fecha está en el futuro
          const fechaReserva = new Date(primera.fecha_reserva);
          const hoy = new Date();
          console.log('📅 VALIDACIÓN DE FECHA:');
          console.log('   - Fecha reserva:', fechaReserva);
          console.log('   - Hoy:', hoy);
          console.log('   - Es fecha futura?:', fechaReserva > hoy);
        }
        
        this.reservas = reservas;
        this.actualizarCalendario();
        this.loading = false;
        
        console.log('✅ PROCESO COMPLETADO');
      },
      error: (error: any) => {
        console.error('❌❌❌ ERROR EN LLAMADA A API');
        console.error('   - Status:', error.status);
        console.error('   - Status Text:', error.statusText);
        console.error('   - URL:', error.url);
        console.error('   - Mensaje:', error.message);
        
        if (error.status === 0) {
          console.error('   🔥 ERROR DE CONEXIÓN: El backend no está respondiendo');
          this.error = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.';
        } else if (error.status === 404) {
          console.error('   🔥 ERROR 404: URL no encontrada');
          this.error = 'Endpoint no encontrado. Verifica la URL del API.';
        } else if (error.status === 401) {
          console.error('   🔥 ERROR 401: No autorizado');
          this.error = 'No estás autenticado. Inicia sesión nuevamente.';
        } else {
          this.error = `Error ${error.status}: ${error.statusText}`;
        }
        
        this.loading = false;
      }
    });
  }

  actualizarCalendario(): void {
    console.log('🔄 INICIANDO ACTUALIZACIÓN DEL CALENDARIO');
    console.log('📊 Número de reservas a convertir en eventos:', this.reservas.length);

    if (this.reservas.length === 0) {
      console.log('⚠️  NO HAY RESERVAS - Calendario vacío');
      this.calendarOptions.events = [];
      return;
    }

    const eventos = this.reservas.map((reserva, index) => {
      console.log(`📅 CREANDO EVENTO ${index + 1} para reserva ${reserva.id}`);
      
      // Construir las fechas para FullCalendar
      const start = `${reserva.fecha_reserva}T${reserva.hora_inicio}`;
      const end = `${reserva.fecha_reserva}T${reserva.hora_fin}`;
      
      console.log('   - Start:', start);
      console.log('   - End:', end);
      console.log('   - Título:', `${reserva.area_comun_nombre} (${reserva.estado})`);

      const evento = {
        id: reserva.id.toString(),
        title: `${reserva.area_comun_nombre || 'Reserva'} (${reserva.estado})`,
        start: start,
        end: end,
        backgroundColor: this.getColorEstado(reserva.estado),
        borderColor: this.getColorEstado(reserva.estado),
        textColor: '#ffffff',
        extendedProps: { reserva }
      };

      console.log('   ✅ Evento creado:', evento);
      return evento;
    });

    console.log('🎯 TOTAL EVENTOS CREADOS:', eventos.length);
    console.log('📋 EVENTOS QUE SE ENVIARÁN AL CALENDARIO:', eventos);

    // Actualizar el calendario
    this.calendarOptions.events = eventos;
    
    console.log('✅ CALENDARIO ACTUALIZADO con', eventos.length, 'eventos');
    
    // Forzar re-render del calendario
    setTimeout(() => {
      console.log('🔄 Re-render forzado del calendario');
    }, 100);
  }

  getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'confirmada': '#28a745',
      'pendiente': '#ffc107',
      'cancelada': '#dc3545',
      'completada': '#6c757d'
    };
    return colores[estado] || '#007bff';
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const reserva: Reserva = clickInfo.event.extendedProps['reserva'];
    this.mostrarDetallesReserva(reserva);
  }

  handleDateClick(clickInfo: any): void {
    const fechaSeleccionada = clickInfo.dateStr;
    console.log('📅 Fecha clickeada:', fechaSeleccionada);
  }

  mostrarDetallesReserva(reserva: Reserva): void {
    const mensaje = `
📅 Reserva #${reserva.id}

🏢 Área: ${reserva.area_comun_nombre || 'N/A'}
📅 Fecha: ${reserva.fecha_reserva}
⏰ Horario: ${reserva.hora_inicio} - ${reserva.hora_fin}
💰 Monto: $${reserva.monto}
📊 Estado: ${reserva.estado.toUpperCase()}
    `;
    
    alert(mensaje);
  }

  refrescarCalendario(): void {
    console.log('🔃 REFRESCANDO CALENDARIO...');
    this.cargarReservas();
  }
}