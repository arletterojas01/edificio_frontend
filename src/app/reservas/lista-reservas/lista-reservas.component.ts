// lista-reservas.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReservasService } from '../reservas.service';
import { Reserva } from '../reserva.model';

@Component({
  selector: 'app-lista-reservas',
  templateUrl: './lista-reservas.component.html',
  styleUrls: ['./lista-reservas.component.scss'],
  imports: [RouterModule] // Solo RouterModule ya que usamos control flow integrado
})
export class ListaReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  reservasCargando: boolean = false;
  mensaje: string = '';

  constructor(private reservasService: ReservasService) {}

  ngOnInit() {
    this.cargarMisReservas();
  }

  // 🔹 CARGAR RESERVAS DEL USUARIO
  cargarMisReservas() {
    this.reservasCargando = true;
    this.reservasService.getMisReservas().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.reservasCargando = false;
      },
      error: (error) => {
        console.error('Error cargando reservas:', error);
        this.reservasCargando = false;
        this.mostrarMensaje('Error al cargar las reservas');
      }
    });
  }

  // 🔹 CANCELAR RESERVA
  cancelarReserva(reserva: Reserva) {
    const fechaMostrar = reserva.fecha || 'fecha no disponible';
    if (confirm(`¿Estás seguro de cancelar la reserva del ${fechaMostrar}?`)) {
      if (reserva.id) {
        this.reservasService.cancelarReserva(reserva.id).subscribe({
          next: () => {
            this.mostrarMensaje('Reserva cancelada exitosamente');
            this.cargarMisReservas();
          },
          error: (error) => {
            console.error('Error cancelando reserva:', error);
            this.mostrarMensaje('Error al cancelar la reserva');
          }
        });
      }
    }
  }

  // 🔹 ELIMINAR RESERVA (PERMANENTE)
  eliminarReserva(reserva: Reserva) {
    if (confirm(`¿Estás seguro de ELIMINAR permanentemente esta reserva? Esta acción no se puede deshacer.`)) {
      if (reserva.id) {
        this.reservasService.eliminarReserva(reserva.id).subscribe({
          next: () => {
            this.mostrarMensaje('Reserva eliminada exitosamente');
            this.cargarMisReservas();
          },
          error: (error) => {
            console.error('Error eliminando reserva:', error);
            this.mostrarMensaje('Error al eliminar la reserva');
          }
        });
      }
    }
  }

  // 🔹 CONFIRMAR RESERVA
  confirmarReserva(reserva: Reserva) {
    if (reserva.id) {
      this.reservasService.confirmarReserva(reserva.id).subscribe({
        next: () => {
          this.mostrarMensaje('Reserva confirmada exitosamente');
          this.cargarMisReservas();
        },
        error: (error) => {
          console.error('Error confirmando reserva:', error);
          this.mostrarMensaje('Error al confirmar la reserva');
        }
      });
    }
  }

  // 🔹 MOSTRAR MENSAJES TEMPORALES
  private mostrarMensaje(mensaje: string) {
    this.mensaje = mensaje;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  // 🔹 VERIFICAR SI UNA RESERVA PUEDE SER CANCELADA
  puedeCancelar(reserva: Reserva): boolean {
    return reserva.estado === 'pendiente' || reserva.estado === 'confirmada';
  }

  // 🔹 VERIFICAR SI UNA RESERVA PUEDE SER ELIMINADA
  puedeEliminar(reserva: Reserva): boolean {
    return reserva.estado === 'cancelada' || reserva.estado === 'completada';
  }

  // 🔹 OBTENER CLASE CSS SEGÚN ESTADO
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'estado-confirmada';
      case 'cancelada': return 'estado-cancelada';
      case 'pendiente': return 'estado-pendiente';
      case 'completada': return 'estado-completada';
      default: return 'estado-default';
    }
  }
}