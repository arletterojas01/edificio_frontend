import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

// Componentes existentes
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AuditoriaComponent } from './auditoria/auditoria.component';
import { ListaUsuariosComponent } from './gestion-usuarios/lista-usuarios.component';
import { RolesComponent } from './roles/roles.component';

// Componentes de Reservas
import { CalendarioReservasComponent } from './reservas/calendario-reservas/calendario-reservas.component';
import { ListaReservasComponent } from './reservas/lista-reservas/lista-reservas.component';
import { FormularioReservaComponent } from './reservas/formulario-reserva/formulario-reserva.component';
import { QrConfirmacionComponent } from './reservas/qr-confirmacion/qr-confirmacion.component';

// ✅ AÑADE ESTOS IMPORTS DE TICKETS
import { TicketsListComponent } from './tickets/tickets-list/tickets-list.component';
import { TicketCreateComponent } from './tickets/ticket-create/ticket-create.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { TicketsReportesComponent } from './tickets/tickets-reportes/tickets-reportes.component';

export const routes: Routes = [
  // Rutas públicas (solo para usuarios NO autenticados)
  { 
    path: '', 
    component: WelcomeComponent, 
    canActivate: [GuestGuard] 
  },
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [GuestGuard] 
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    canActivate: [GuestGuard] 
  },
  { 
    path: 'verify-email', 
    component: VerifyEmailComponent, 
    canActivate: [GuestGuard] 
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent, 
    canActivate: [GuestGuard] 
  },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent, 
    canActivate: [GuestGuard] 
  },

  // Rutas protegidas (solo para usuarios autenticados)
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'perfil', 
    component: PerfilComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'auditoria', 
    component: AuditoriaComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'gestion-usuarios', 
    component: ListaUsuariosComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'roles', 
    component: RolesComponent, 
    canActivate: [AuthGuard] 
  },

  // ✅ RUTAS DEL SISTEMA DE TICKETS - AÑADE ESTO
  { 
    path: 'tickets', 
    children: [
      { 
        path: '', 
        component: TicketsListComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'create', 
        component: TicketCreateComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: ':id', 
        component: TicketDetailComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'reportes', 
        component: TicketsReportesComponent, 
        canActivate: [AuthGuard] 
      }
    ]
  },

  // ✅ RUTAS DEL SISTEMA DE RESERVAS
  { 
    path: 'reservas', 
    children: [
      // Ruta principal de reservas - va al calendario (todos pueden ver)
      { 
        path: '', 
        component: CalendarioReservasComponent, 
        canActivate: [AuthGuard] 
      },
      // Calendario de reservas (todos pueden ver)
      { 
        path: 'calendario', 
        component: CalendarioReservasComponent, 
        canActivate: [AuthGuard] 
      },
      // Lista de mis reservas (todos pueden ver SUS reservas)
      { 
        path: 'mis-reservas', 
        component: ListaReservasComponent, 
        canActivate: [AuthGuard] 
      },
      // Crear nueva reserva (todos pueden crear)
      { 
        path: 'nueva', 
        component: FormularioReservaComponent, 
        canActivate: [AuthGuard] 
      },
      // Confirmación QR (todos pueden ver SUS QR)
      { 
        path: 'qr/:id', 
        component: QrConfirmacionComponent, 
        canActivate: [AuthGuard] 
      },
      // ✅ SOLO ESTA RUTA ES RESTRINGIDA: Administración de reservas
      { 
        path: 'admin', 
        component: RolesComponent, 
        canActivate: [AuthGuard] // ← Solo admin/junta/personal
      }
    ]
  },

  // Redirección por defecto para rutas no encontradas
  { 
    path: '**', 
    redirectTo: ''
  }
];