import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout, catchError, of, map, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface LoginResponse {
  msg: string;
  username: string;
  access?: string;
  refresh?: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: string;
  is_active: boolean;
  persona: any;
  is_email_verified: boolean;
  first_name?: string;
  last_name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isBrowser: boolean;
  private apiUrl = 'http://localhost:8000/api/usuarios';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Cache para permisos y datos de usuario
  private permisosCache = new Map<string, boolean>();
  private userDataCache: Usuario | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeAuth();
  }

  // === INITIALIZATION ===
  private initializeAuth(): void {
    if (this.isBrowser) {
      this.loadCurrentUser();
      this.setupAutoRefresh();
    }
  }

  private setupAutoRefresh(): void {
    // Auto-refresh token antes de que expire
    setInterval(() => {
      if (this.isLoggedIn() && this.isTokenExpiringSoon()) {
        this.refreshTokenSilently().subscribe();
      }
    }, 300000); // Check cada 5 minutos
  }

  // === TOKEN MANAGEMENT ===
  private getFromStorage(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private setInStorage(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  private removeFromStorage(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  clearTokens(): void {
    this.removeFromStorage('access');
    this.removeFromStorage('refresh');
    this.permisosCache.clear();
    this.userDataCache = null;
  }

  private getTokenExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp;
    } catch {
      return null;
    }
  }

  private isTokenExpiringSoon(): boolean {
    const token = this.getFromStorage('access');
    if (!token) return false;

    const expiration = this.getTokenExpiration(token);
    if (!expiration) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return (expiration - currentTime) < 300; // 5 minutos
  }

  private refreshTokenSilently(): Observable<any> {
    const refresh = this.getFromStorage('refresh');
    if (!refresh) return of(null);

    return this.http.post(`${this.apiUrl}/token/refresh/`, { refresh }).pipe(
      tap((response: any) => {
        if (response.access) {
          this.setInStorage('access', response.access);
          console.log('✅ Token refrescado automáticamente');
        }
      }),
      catchError(error => {
        console.warn('Error refrescando token:', error);
        this.logout().subscribe();
        return of(null);
      })
    );
  }

  // === USER MANAGEMENT ===
  private loadCurrentUser(): void {
    if (this.isBrowser) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          this.userDataCache = user;
        } catch (error) {
          console.error('Error parsing currentUser:', error);
          this.clearCurrentUser();
        }
      }
    }
  }

  setCurrentUser(user: Usuario): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      this.userDataCache = user;
      this.permisosCache.clear(); // Clear cache on user change
    }
  }

  clearCurrentUser(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.userDataCache = null;
      this.permisosCache.clear();
    }
  }

  getCurrentUser(): Usuario | null {
    // Usar cache para mejor performance
    if (this.userDataCache) {
      return this.userDataCache;
    }
    return this.currentUserSubject.value;
  }

  // === ROLE METHODS ===
  isAdmin(): boolean {
    return this.getCurrentUser()?.rol === 'admin';
  }

  isJunta(): boolean {
    return this.getCurrentUser()?.rol === 'junta';
  }

  isPersonal(): boolean {
    return this.getCurrentUser()?.rol === 'personal';
  }

  isResidente(): boolean {
    return this.getCurrentUser()?.rol === 'residente';
  }

  // === PERMISSION SYSTEM ===
  hasPermission(permiso: string): boolean {
    // Verificar cache primero
    if (this.permisosCache.has(permiso)) {
      return this.permisosCache.get(permiso)!;
    }

    const user = this.getCurrentUser();
    if (!user) {
      this.permisosCache.set(permiso, false);
      return false;
    }

    const permisosPorRol = this.getPermisosPorRol();
    const tienePermiso = permisosPorRol[user.rol]?.[permiso] || false;
    
    // Cachear resultado
    this.permisosCache.set(permiso, tienePermiso);
    return tienePermiso;
  }

  private getPermisosPorRol(): { [key: string]: { [key: string]: boolean } } {
    return {
      'admin': {
        'gestion_usuarios': true,
        'gestion_roles': true,
        'ver_auditoria': true,
        'gestion_edificio': true,
        'gestion_pagos': true,
        'gestion_residentes': true,
        'gestion_visitantes': true,
        'gestion_personal': true,
        'acceso_total': true,
        'crear_comunicaciones': true,
        'editar_comunicaciones': true,
        'eliminar_comunicaciones': true,
        'responder_quejas': true,
        'ver_estadisticas': true,
      },
      'junta': {
        'gestion_usuarios': false,
        'gestion_roles': false,
        'ver_auditoria': true,
        'gestion_edificio': true,
        'gestion_pagos': true,
        'gestion_residentes': true,
        'gestion_visitantes': true,
        'gestion_personal': false,
        'acceso_total': false,
        'crear_comunicaciones': true,
        'editar_comunicaciones': true,
        'eliminar_comunicaciones': true,
        'responder_quejas': true,
        'ver_estadisticas': true,
      },
      'personal': {
        'gestion_usuarios': false,
        'gestion_roles': false,
        'ver_auditoria': false,
        'gestion_edificio': false,
        'gestion_pagos': false,
        'gestion_residentes': false,
        'gestion_visitantes': true,
        'gestion_personal': false,
        'acceso_total': false,
        'crear_comunicaciones': true,
        'editar_comunicaciones': true,
        'eliminar_comunicaciones': true,
        'responder_quejas': false,
        'ver_estadisticas': false,
      },
      'residente': {
        'gestion_usuarios': false,
        'gestion_roles': false,
        'ver_auditoria': false,
        'gestion_edificio': false,
        'gestion_pagos': false,
        'gestion_residentes': false,
        'gestion_visitantes': false,
        'gestion_personal': false,
        'acceso_total': false,
        'crear_comunicaciones': false,
        'editar_comunicaciones': false,
        'eliminar_comunicaciones': false,
        'responder_quejas': false,
        'ver_estadisticas': false,
      }
    };
  }

  // === USER MANAGEMENT METHODS ===
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios/`).pipe(
      catchError(error => {
        console.error('Error obteniendo usuarios:', error);
        return of([]);
      })
    );
  }

  getPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil/`).pipe(
      tap(usuario => {
        this.setCurrentUser(usuario);
        console.log('✅ Perfil cargado y cacheado:', usuario);
      }),
      catchError(error => {
        console.error('Error obteniendo perfil:', error);
        this.clearCurrentUser();
        throw error;
      })
    );
  }

  getMiRol(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mi-rol/`).pipe(
      catchError(error => {
        console.error('Error obteniendo rol:', error);
        return of({ rol: 'invitado' });
      })
    );
  }

  updateUserRol(userId: number, rol: string): Observable<any> {
    console.log('=== ACTUALIZANDO ROL ===');
    console.log('Usuario ID:', userId);
    console.log('Nuevo Rol:', rol);

    return this.http.put(
      `${this.apiUrl}/usuarios/${userId}/rol/`, 
      { rol }
    ).pipe(
      tap(response => {
        console.log('✅ Rol actualizado exitosamente:', response);
        // Invalidar cache si el usuario actualizó su propio rol
        if (this.getCurrentUser()?.id === userId) {
          this.actualizarPerfilUsuario().subscribe();
        }
      }),
      catchError(error => {
        console.error('❌ Error actualizando rol:', error);
        throw error;
      })
    );
  }

  getPermisos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permisos/`).pipe(
      catchError(error => {
        console.error('Error obteniendo permisos:', error);
        return of({});
      })
    );
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/stats/`).pipe(
      catchError(error => {
        console.error('Error obteniendo stats:', error);
        return of({});
      })
    );
  }

  actualizarPerfilUsuario(): Observable<Usuario> {
    return this.getPerfil().pipe(
      tap(usuario => {
        console.log('✅ Perfil actualizado y cacheado:', usuario);
        this.permisosCache.clear(); // Clear permission cache
      })
    );
  }

  // === AUTH METHODS ===
  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(response => {
        if (response.access) {
          this.setInStorage('access', response.access);
          this.setInStorage('refresh', response.refresh!);
          console.log('✅ Login exitoso, tokens guardados');
        }
      })
    );
  }

  loginWithUserPass(username: string, password: string): Observable<LoginResponse> {
    return this.login({ username, password });
  }

  loginWithUserPassAdvanced(username: string, password: string, totpCode?: string): Observable<LoginResponse> {
    const body: any = { username, password };
    if (totpCode) body.totp_code = totpCode;
    
    console.log('=== LOGIN AVANZADO ===');
    console.log('Usuario:', username);
    console.log('Con 2FA:', !!totpCode);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, body).pipe(
      tap(response => {
        if (response.access) {
          this.setInStorage('access', response.access);
          this.setInStorage('refresh', response.refresh!);
        }
      })
    );
  }

  logout(): Observable<any> {
    console.log('=== LOGOUT OPTIMIZADO ===');
    
    const refresh = this.getFromStorage('refresh');
    
    // 1. Limpieza local inmediata
    this.clearTokens();
    this.clearCurrentUser();
    console.log('✅ Logout local completado');
    
    // 2. Notificación al backend si existe refresh token
    if (!refresh) {
      console.log('ℹ️ Sin refresh token - Logout local completado');
      return of({ 
        msg: 'Logout exitoso',
        status: 'success',
        method: 'local_only'
      });
    }
    
    console.log('🔔 Notificando backend...');
    
    return this.http.post(`${this.apiUrl}/logout/`, { refresh }).pipe(
      timeout(5000),
      tap((response: any) => {
        console.log('✅ Backend notificado:', response);
      }),
      catchError((error) => {
        console.warn('⚠️ Error notificando backend (logout ya completado):', error.message);
        return of({ 
          msg: 'Logout exitoso',
          status: 'success', 
          method: 'local_with_backend_error',
          backend_error: error.message
        });
      })
    );
  }

  // === SECURITY METHODS ===
  isStrongPassword(password: string, username?: string, email?: string): boolean {
    if (!password || password.length < 8) return false;
    if (username && password.toLowerCase().includes(username.toLowerCase())) return false;
    if (email && password.toLowerCase().includes(email.split('@')[0].toLowerCase())) return false;
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    return hasUpper && hasLower && hasNumber && hasSpecial;
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;

    const token = this.getFromStorage('access');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp < currentTime) {
        this.clearTokens();
        this.clearCurrentUser();
        return false;
      }
      return true;
    } catch (error) {
      this.clearTokens();
      this.clearCurrentUser();
      return false;
    }
  }

  getUserFromToken(): any {
    const token = this.getFromStorage('access');
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }

  // === PASSWORD & EMAIL METHODS ===
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password/`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/`, { token, new_password: newPassword });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email/${token}/`);
  }

  verificarEmail(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-email/`, { email, codigo });
  }

  reenviarVerificacion(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reenviar-verificacion/`, { email });
  }

  // === 2FA METHODS ===
  activate2FA(): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/activate/`, {});
  }

  verify2FA(totpCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/verify/`, { totp_code: totpCode });
  }

  validateCodigo2FA(payload: { username: string; code: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/2fa/verify/`, payload);
  }

  // === AUDIT & DEBUG METHODS ===
  getAuditLog(): Observable<any> {
    return this.http.get(`${this.apiUrl}/audit/`);
  }

  getRawQuery(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/raw/?username=${encodeURIComponent(username)}`);
  }

  checkAccountStatus(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/account-status/?username=${encodeURIComponent(username)}`);
  }

  validateToken(username: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-login-token/`, { username, token }).pipe(
      tap((resp: any) => {
        if (resp.access) {
          this.setInStorage('access', resp.access);
          this.setInStorage('refresh', resp.refresh);
        }
      })
    );
  }

  validateTokenCorreo(username: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-login-token/`, { username, token });
  }

  // === UTILITY METHODS ===
  getFullName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Usuario';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    return user.username;
  }

  getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return 'U';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    
    return user.username[0].toUpperCase();
  }

  canAccess(route: string): boolean {
    const routePermissions: { [key: string]: string } = {
      '/admin': 'acceso_total',
      '/usuarios': 'gestion_usuarios',
      '/auditoria': 'ver_auditoria',
      '/comunicacion': 'crear_comunicaciones',
      '/quejas': 'responder_quejas',
      '/pagos': 'gestion_pagos',
      '/visitantes': 'gestion_visitantes'
    };
    
    const requiredPermission = routePermissions[route];
    return !requiredPermission || this.hasPermission(requiredPermission);
  }
}