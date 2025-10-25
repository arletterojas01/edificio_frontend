import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Reserva } from '../reserva.model';

@Component({
  selector: 'app-qr-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './qr-confirmacion.component.html',
  styleUrls: ['./qr-confirmacion.component.scss']
})
export class QrConfirmacionComponent implements OnInit {
  reserva: Reserva | null = null;
  loading = true;
  error: string | null = null;
  private apiUrl = 'http://localhost:8000/api/reservas';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log('🔧 QrConfirmacionComponent INICIADO');
    
    const reservaId = this.route.snapshot.paramMap.get('id');
    console.log('📋 ID de reserva desde URL:', reservaId);

    if (reservaId) {
      this.cargarReserva(parseInt(reservaId));
    } else {
      this.error = 'No se proporcionó ID de reserva';
      this.loading = false;
    }
  }

  cargarReserva(id: number): void {
    console.log('🔄 Cargando reserva con ID:', id);
    console.log('🌐 URL:', `${this.apiUrl}/reservas/${id}/`);
    
    this.http.get<Reserva>(`${this.apiUrl}/reservas/${id}/`)
      .subscribe({
        next: (reserva) => {
          console.log('✅ Reserva cargada exitosamente:', reserva);
          this.reserva = reserva;
          this.loading = false;
          
          // Verificar si el QR existe
          if (!reserva.codigo_qr) {
            console.log('⚠️ La reserva no tiene código QR');
          }
        },
        error: (error) => {
          console.error('❌ Error cargando reserva:', error);
          console.error('📋 Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error
          });
          
          this.loading = false;
          
          if (error.status === 404) {
            this.error = 'Reserva no encontrada. Verifica el número de reserva.';
          } else if (error.status === 403) {
            this.error = 'No tienes permisos para ver esta reserva.';
          } else if (error.status === 401) {
            this.error = 'Debes iniciar sesión para ver esta reserva.';
          } else if (error.status === 0) {
            this.error = 'Error de conexión. Verifica que el servidor esté funcionando.';
          } else {
            this.error = 'Error al cargar la información de la reserva. Intenta nuevamente.';
          }
        }
      });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'bg-success';
      case 'pendiente':
        return 'bg-warning';
      case 'cancelada':
        return 'bg-danger';
      case 'completada':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  descargarQR(): void {
    if (!this.reserva?.codigo_qr) {
      console.warn('⚠️ No hay código QR para descargar');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = this.reserva.codigo_qr;
      link.download = `qr_reserva_${this.reserva.id}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ QR descargado exitosamente');
    } catch (error) {
      console.error('❌ Error descargando QR:', error);
      // Si falla la descarga, abrir en nueva pestaña
      window.open(this.reserva.codigo_qr, '_blank');
    }
  }

  // Método para regenerar QR si es necesario
  regenerarQR(): void {
    if (!this.reserva) return;

    console.log('🔄 Regenerando QR para reserva:', this.reserva.id);
    
    this.http.post<{ qr_code: string }>(`${this.apiUrl}/reservas/${this.reserva.id}/generar-qr/`, {})
      .subscribe({
        next: (response) => {
          console.log('✅ QR regenerado:', response);
          if (this.reserva) {
            this.reserva.codigo_qr = response.qr_code;
          }
        },
        error: (error) => {
          console.error('❌ Error regenerando QR:', error);
          this.error = 'No se pudo generar el código QR. Intenta más tarde.';
        }
      });
  }

  // Manejar error de carga de imagen QR
  onImageError(event: any): void {
    console.error('❌ Error cargando imagen QR:', event);
    this.error = 'Error al cargar el código QR. La imagen puede estar dañada.';
  }
}