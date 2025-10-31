import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TicketsService } from '../../services/tickets.service';
import { AuthService } from '../../services/auth.service';
import { Ticket, Categoria} from '../../services/ticket.interfaces'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TicketsListComponent implements OnInit {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  categorias: Categoria[] = [];
  loading = false;
  error = '';
  public Math = Math;
  searchTerm = '';
  statusFilter = '';
  priorityFilter = '';
  
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  statuses = [
    { value: 'abierto', label: '🔓 Abierto' },
    { value: 'en_progreso', label: '🔄 En Progreso' },
    { value: 'pendiente', label: '⏳ Pendiente' },
    { value: 'resuelto', label: '✅ Resuelto' },
    { value: 'cerrado', label: '🔒 Cerrado' }
  ];

  priorities = [
    { value: 'baja', label: '🟢 Baja' },
    { value: 'media', label: '🟡 Media' },
    { value: 'alta', label: '🟠 Alta' },
    { value: 'urgente', label: '🔴 Urgente' }
  ];

  constructor(
    private ticketsService: TicketsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategorias();
    this.loadTickets();
  }

  loadTickets() {
    this.loading = true;
    this.ticketsService.getTickets().subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los tickets';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadCategorias() {
    this.ticketsService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  // Métodos para reemplazar Math en template
  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  mathCeil(value: number): number {
    return Math.ceil(value);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  applyFilters() {
    this.filteredTickets = this.tickets.filter(ticket => {
      const matchesSearch = !this.searchTerm || 
        ticket.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || ticket.estado === this.statusFilter;
      const matchesPriority = !this.priorityFilter || ticket.prioridad === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    this.totalItems = this.filteredTickets.length;
    this.currentPage = 1;
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.priorityFilter = '';
    this.applyFilters();
  }

  viewTicket(ticketId: number) {
    this.router.navigate(['/tickets', ticketId]);
  }

  createTicket() {
    this.router.navigate(['/tickets/create']);
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'abierto': 'bg-primary',
      'en_progreso': 'bg-warning',
      'pendiente': 'bg-info',
      'resuelto': 'bg-success',
      'cerrado': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  getPriorityBadgeClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'baja': 'bg-success',
      'media': 'bg-warning',
      'alta': 'bg-orange',
      'urgente': 'bg-danger'
    };
    return classes[priority] || 'bg-secondary';
  }

  get paginatedTickets() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTickets.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}