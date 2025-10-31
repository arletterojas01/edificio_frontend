import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsService } from '../../services/tickets.service';
import { EstadisticasResponse } from '../../services/ticket.interfaces';

@Component({
  selector: 'app-tickets-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets-reportes.component.html',
  styleUrls: ['./tickets-reportes.component.scss']
})
export class TicketsReportesComponent implements OnInit {
  estadisticas: EstadisticasResponse | null = null;
  loading = false;

  constructor(private ticketsService: TicketsService) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.loading = true;
    this.ticketsService.getEstadisticas().subscribe({
      next: (estadisticas) => {
        this.estadisticas = estadisticas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.loading = false;
      }
    });
  }

  // Métodos auxiliares para mostrar datos
  getPorcentaje(total: number, valor: number): number {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
  }
}