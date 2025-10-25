import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: string;
  is_active: boolean;
  persona: any;
  is_email_verified: boolean;
}

export interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  ci: string;
  email: string;
  sexo?: string;
  telefono?: string;
  fecha_nacimiento?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/api/usuarios';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios/`);
  }

  updateRol(userId: number, rol: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${userId}/rol/`, { rol });
  }

  getPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil/`);
  }

  getMiRol(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mi-rol/`);
  }
}