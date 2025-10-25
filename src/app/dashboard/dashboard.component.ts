import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userRole: string = '';
  esAdmin: boolean = false;
  esJunta: boolean = false;
  esPersonal: boolean = false;
  esResidente: boolean = false;
  rolDisplay: string = '';
  rolBadgeColor: string = '#6C757D';
  usuarioActual: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('🔍 Iniciando dashboard...');
    this.cargarPerfilYVerificarRol();
  }

  // MÉTODO PRINCIPAL - Cargar perfil y verificar rol
  cargarPerfilYVerificarRol() {
    console.log('🔄 Cargando perfil del usuario...');
    
    this.auth.getPerfil().subscribe({
      next: (usuario: any) => {
        console.log('✅ Perfil cargado:', usuario);
        this.usuarioActual = usuario;
        this.userRole = usuario.rol;
        console.log('🎯 Rol detectado:', this.userRole);
        
        this.actualizarEstadoRoles();
      },
      error: (error) => {
        console.error('❌ Error cargando perfil:', error);
        this.verificarRolConFallback();
      }
    });
  }

  // Fallback si falla la carga del perfil
  verificarRolConFallback() {
    const usuarioStorage = this.auth.getCurrentUser();
    if (usuarioStorage) {
      this.usuarioActual = usuarioStorage;
      this.userRole = usuarioStorage.rol;
      console.log('🔄 Usando datos de localStorage, rol:', this.userRole);
    } else {
      console.warn('⚠️ No se pudo obtener el perfil del usuario');
      this.userRole = 'residente';
    }
    
    this.actualizarEstadoRoles();
  }

  actualizarEstadoRoles() {
    this.esAdmin = this.userRole === 'admin';
    this.esJunta = this.userRole === 'junta';
    this.esPersonal = this.userRole === 'personal';
    this.esResidente = this.userRole === 'residente';

    console.log('🔐 Estado de roles:');
    console.log('  - Admin:', this.esAdmin);
    console.log('  - Junta:', this.esJunta);
    console.log('  - Personal:', this.esPersonal);
    console.log('  - Residente:', this.esResidente);

    const rolesDisplay: {[key: string]: string} = {
      'admin': '👑 Administrador',
      'junta': '⚖️ Junta Directiva', 
      'personal': '👨‍💼 Personal',
      'residente': '👤 Residente'
    };
    this.rolDisplay = rolesDisplay[this.userRole] || 'Usuario';

    const colores: {[key: string]: string} = {
      'admin': '#dc3545',
      'junta': '#fd7e14',
      'personal': '#3A86FF',
      'residente': '#4CAF50'
    };
    this.rolBadgeColor = colores[this.userRole] || '#6C757D';
  }

  // ✅ NUEVO MÉTODO: IR A RESERVAS
  goToReservas() {
    console.log('📅 Navegando a Reservas...');
    this.router.navigate(['/reservas']).then(success => {
      if (success) {
        console.log('✅ Navegación exitosa a reservas');
      } else {
        console.error('❌ Error navegando a reservas');
        alert('La página de reservas no está disponible');
      }
    });
  }

  goToPerfil() {
    console.log('📍 Navegando a Mi Perfil...');
    this.router.navigate(['/perfil']).then(success => {
      if (success) {
        console.log('✅ Navegación exitosa a perfil');
      } else {
        console.error('❌ Error navegando a perfil');
        alert('La página de perfil no está disponible');
      }
    });
  }

  goToRoles() {
    console.log('🎭 Navegando a Gestión de Roles...');
    
    // Verificar permisos
    if (!this.esAdmin) {
      alert('❌ Solo los administradores pueden acceder a la gestión de roles');
      return;
    }
    
    this.router.navigate(['/roles']).then(success => {
      if (success) {
        console.log('✅ Navegación exitosa a gestión de roles');
      } else {
        console.error('❌ Error navegando a gestión de roles');
        alert('La página de gestión de roles no está disponible');
      }
    });
  }

  goToAuditoria() {
    console.log('📊 Navegando a Auditoría...');
    this.router.navigate(['/auditoria']).then(success => {
      if (success) {
        console.log('✅ Navegación exitosa a auditoría');
      } else {
        console.error('❌ Error navegando a auditoría');
        alert('La página de auditoría no está disponible');
      }
    });
  }

  logout() {
    console.log('🚪 Cerrando sesión...');
    this.auth.logout().subscribe({
      next: () => {
        console.log('✅ Logout exitoso');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('❌ Error en logout:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  // DEBUG TEMPORAL
  debugInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('Usuario actual:', this.usuarioActual);
    console.log('Rol:', this.userRole);
    console.log('Es admin:', this.esAdmin);
    console.log('LocalStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('Token access:', localStorage.getItem('access') ? 'EXISTE' : 'NO EXISTE');
  }

  // Método para forzar actualización
  actualizarPerfil() {
    console.log('🔄 Forzando actualización de perfil...');
    this.cargarPerfilYVerificarRol();
  }
}