import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent {
  esAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.esAdmin = this.authService.isAdmin();
  }

  goToGestionRoles() {
    this.router.navigate(['/gestion-usuarios']);
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }

  rolesInfo = [
    {
      rol: 'admin',
      icon: '👑',
      title: 'Administrador',
      description: 'Acceso completo al sistema',
      permisos: ['Gestión de usuarios', 'Gestión de roles', 'Auditoría completa']
    },
    {
      rol: 'junta', 
      icon: '⚖️',
      title: 'Junta Directiva',
      description: 'Acceso a gestión del edificio',
      permisos: ['Gestión del edificio', 'Reportes ejecutivos']
    },
    {
      rol: 'personal',
      icon: '👨‍💼', 
      title: 'Personal',
      description: 'Acceso a funcionalidades operativas',
      permisos: ['Gestión de visitantes', 'Reportes básicos']
    },
    {
      rol: 'residente',
      icon: '👤',
      title: 'Residente', 
      description: 'Acceso para consultar información personal',
      permisos: ['Mi perfil', 'Mis datos']
    }
  ];
}