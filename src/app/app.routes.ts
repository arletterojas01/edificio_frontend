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

// Componentes de Tickets
import { TicketsListComponent } from './tickets/tickets-list/tickets-list.component';
import { TicketCreateComponent } from './tickets/ticket-create/ticket-create.component';
import { TicketDetailComponent } from './tickets/ticket-detail/ticket-detail.component';
import { TicketsReportesComponent } from './tickets/tickets-reportes/tickets-reportes.component';

// ✅ CORREGIDO: ComunicacionComponent en español
import { ComunicacionComponent } from './comunicacion/comunicacion.component';

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

  // Rutas del Sistema de Tickets
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

  // Rutas del Sistema de Reservas
  { 
    path: 'reservas', 
    children: [
      { 
        path: '', 
        component: CalendarioReservasComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'calendario', 
        component: CalendarioReservasComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'mis-reservas', 
        component: ListaReservasComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'nueva', 
        component: FormularioReservaComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'qr/:id', 
        component: QrConfirmacionComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'admin', 
        component: RolesComponent, 
        canActivate: [AuthGuard]
      }
    ]
  },

  // ✅ CORREGIDO: ComunicacionComponent en español
  { 
    path: 'comunicacion', 
    component: ComunicacionComponent, 
    canActivate: [AuthGuard] 
  },

  // Redirección por defecto para rutas no encontradas
  { 
    path: '**', 
    redirectTo: ''
  }
];