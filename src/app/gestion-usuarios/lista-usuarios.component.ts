import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Usuario } from '../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  isLoading = false;
  searchTerm = '';
  selectedRol = 'todos';
  esAdmin: boolean = false;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.verificarAdmin();
    this.cargarUsuarios();
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  verificarAdmin() {
    // CORRECCIÓN: Usar currentUser$ con take(1) para obtener el valor actual
    this.authService.currentUser$.pipe(take(1)).subscribe(usuarioActual => {
      this.esAdmin = usuarioActual?.rol === 'admin';
      console.log('🔐 Usuario actual:', usuarioActual);
      console.log('👑 ¿Es admin?:', this.esAdmin);
    });
  }

  /**
   * Carga todos los usuarios desde el servidor
   */
  cargarUsuarios() {
    this.isLoading = true;
    
    this.authService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        this.filteredUsuarios = usuarios;
        this.isLoading = false;
        console.log('✅ Usuarios cargados:', usuarios.length);
      },
      error: (error: any) => {
        console.error('❌ Error cargando usuarios:', error);
        this.isLoading = false;
        this.mostrarNotificacion('Error al cargar usuarios', 'error');
      }
    });
  }

  /**
   * Filtra usuarios por término de búsqueda y rol seleccionado
   */
  filtrarUsuarios() {
    this.filteredUsuarios = this.usuarios.filter(usuario => {
      // Filtro de búsqueda (nombre, apellido, username, email, ci)
      const matchesSearch = !this.searchTerm || 
        this.searchInUsuario(usuario, this.searchTerm.toLowerCase());
      
      // Filtro de rol
      const matchesRol = this.selectedRol === 'todos' || usuario.rol === this.selectedRol;
      
      return matchesSearch && matchesRol;
    });
  }

  /**
   * Busca el término en múltiples campos del usuario
   */
  private searchInUsuario(usuario: Usuario, searchTerm: string): boolean {
    return (
      usuario.username?.toLowerCase().includes(searchTerm) ||
      usuario.email?.toLowerCase().includes(searchTerm) ||
      usuario.persona?.nombre?.toLowerCase().includes(searchTerm) ||
      usuario.persona?.apellido?.toLowerCase().includes(searchTerm) ||
      usuario.persona?.ci?.toLowerCase().includes(searchTerm) ||
      `${usuario.persona?.nombre} ${usuario.persona?.apellido}`.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Cambia el rol de un usuario
   */
  cambiarRol(usuario: Usuario, nuevoRol: string) {
    // Evitar cambiar al mismo rol
    if (usuario.rol === nuevoRol) {
      this.mostrarNotificacion('El usuario ya tiene este rol', 'info');
      return;
    }

    // Confirmar acción
    const rolDisplay = this.getRolDisplay(nuevoRol);
    const mensaje = `¿Estás seguro de cambiar el rol de "${usuario.username}" a "${rolDisplay}"?`;
    
    if (!confirm(mensaje)) {
      return;
    }

    // Mostrar loading
    this.isLoading = true;

    this.authService.updateUserRol(usuario.id, nuevoRol).subscribe({
      next: (response: any) => {
        // Actualizar el rol localmente
        usuario.rol = nuevoRol;
        this.filtrarUsuarios();
        this.isLoading = false;
        
        console.log('✅ Rol actualizado:', usuario.username, '→', rolDisplay);
        this.mostrarNotificacion(`Rol actualizado a ${rolDisplay}`, 'success');
      },
      error: (error: any) => {
        console.error('❌ Error actualizando rol:', error);
        this.isLoading = false;
        
        const errorMsg = error?.error?.message || 'Error al actualizar el rol';
        this.mostrarNotificacion(errorMsg, 'error');
      }
    });
  }

  /**
   * Retorna el nombre en español del rol
   */
  getRolDisplay(rol: string): string {
    const roles: { [key: string]: string } = {
      'admin': 'Administrador',
      'junta': 'Junta',
      'personal': 'Personal',
      'residente': 'Residente'
    };
    return roles[rol] || rol.charAt(0).toUpperCase() + rol.slice(1);
  }

  /**
   * Retorna la clase CSS del badge según el rol
   */
  getRolBadgeClass(rol: string): string {
    const classes: { [key: string]: string } = {
      'admin': 'bg-danger',
      'junta': 'bg-warning',
      'personal': 'bg-info',
      'residente': 'bg-success'
    };
    return classes[rol] || 'bg-secondary';
  }

  /**
   * Retorna el icono correspondiente al rol
   */
  getRolIcon(rol: string): string {
    const icons: { [key: string]: string } = {
      'admin': 'bi-shield-fill-check',
      'junta': 'bi-building',
      'personal': 'bi-briefcase',
      'residente': 'bi-house-door'
    };
    return icons[rol] || 'bi-person';
  }

  /**
   * Muestra una notificación al usuario
   * Puedes reemplazar esto con tu sistema de notificaciones preferido
   */
  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'info') {
    // Por ahora usamos alert, pero puedes integrar:
    // - Angular Material Snackbar
    // - NGX-Toastr
    // - SweetAlert2
    // - Tu propio sistema de notificaciones
    
    const iconos = {
      'success': '✅',
      'error': '❌',
      'info': 'ℹ️'
    };
    
    alert(`${iconos[tipo]} ${mensaje}`);
    
    // Ejemplo con console para debugging
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
  }

  /**
   * Exporta la lista de usuarios a CSV (opcional)
   */
  exportarCSV() {
    const headers = ['Username', 'Nombre', 'Apellido', 'Email', 'CI', 'Rol', 'Estado'];
    const rows = this.filteredUsuarios.map(u => [
      u.username,
      u.persona?.nombre || '',
      u.persona?.apellido || '',
      u.email,
      u.persona?.ci || '',
      this.getRolDisplay(u.rol),
      u.is_active ? 'Activo' : 'Inactivo'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.mostrarNotificacion('Lista exportada exitosamente', 'success');
  }

  /**
   * Retorna estadísticas de los usuarios
   */
  getEstadisticas() {
    return {
      total: this.usuarios.length,
      activos: this.usuarios.filter(u => u.is_active).length,
      inactivos: this.usuarios.filter(u => !u.is_active).length,
      porRol: {
        admin: this.usuarios.filter(u => u.rol === 'admin').length,
        junta: this.usuarios.filter(u => u.rol === 'junta').length,
        personal: this.usuarios.filter(u => u.rol === 'personal').length,
        residente: this.usuarios.filter(u => u.rol === 'residente').length
      }
    };
  }

  /**
   * Limpia todos los filtros aplicados
   */
  limpiarFiltros() {
    this.searchTerm = '';
    this.selectedRol = 'todos';
    this.filtrarUsuarios();
  }
}