import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { 
  ComunicacionService, 
  Anuncio, Mensaje, QuejaSugerencia, Encuesta, ChatMensaje,
  CrearAnuncio, CrearMensaje, CrearQuejaSugerencia, CrearEncuesta, CrearChatMensaje,
  FiltroAnuncios, FiltroQuejas, FiltroEncuestas,
  EstadisticasAnuncios, ResumenQuejas, ResultadosEncuesta
} from './comunicacion.service';

@Component({
  selector: 'app-comunicacion',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './comunicacion.component.html',
  styleUrls: ['./comunicacion.component.scss']
})
export class ComunicacionComponent implements OnInit {
  // ========== CONFIGURACIÓN USUARIO ==========
  @Input() usuarioActual: any;
  
  moduloActivo: string = 'anuncios';
  cargando = false;

  // ========== DATOS PRINCIPALES ==========
  anuncios: Anuncio[] = [];
  mensajes: Mensaje[] = [];
  quejas: QuejaSugerencia[] = [];
  encuestas: Encuesta[] = [];
  mensajesChat: ChatMensaje[] = [];

  // ========== FILTROS ==========
  filtroAnuncios: FiltroAnuncios = { excluir_expirados: true };
  filtroQuejas: FiltroQuejas = {};
  filtroEncuestas: FiltroEncuestas = { activas: true };
  
  anunciosFiltrados: Anuncio[] = [];
  quejasFiltradas: QuejaSugerencia[] = [];
  encuestasFiltradas: Encuesta[] = [];

  // ========== FORMULARIOS ==========
  nuevoAnuncio: CrearAnuncio = { 
    titulo: '', 
    contenido: '', 
    tipo: 'ANUNCIO' 
  };
  
  nuevoMensaje: CrearMensaje = { 
    asunto: '', 
    contenido: '', 
    destinatario: 1 
  };
  
  nuevaQueja: CrearQuejaSugerencia = { 
    tipo: 'QUEJA', 
    asunto: '', 
    contenido: '' 
  };
  
  nuevaEncuesta: CrearEncuesta = { 
    titulo: '', 
    descripcion: '' 
  };
  
  nuevoMensajeChat: CrearChatMensaje = { mensaje: '' };

  // ========== DATOS ADICIONALES ==========
  estadisticasAnuncios?: EstadisticasAnuncios;
  resumenQuejas?: ResumenQuejas;
  resultadosEncuesta?: ResultadosEncuesta;

  // ========== UTILIDADES ==========
  get tiposAnuncio() {
    return this.comunicacionService.getTiposAnuncio();
  }
  get tiposQueja() {
    return this.comunicacionService.getTiposQueja();
  }
  get estadosQueja() {
    return this.comunicacionService.getEstadosQueja();
  }

  constructor(private comunicacionService: ComunicacionService) {}

  ngOnInit() {
    if (!this.usuarioActual) {
      this.usuarioActual = { 
        rol: 'admin', 
        nombre: 'Administrador',
        id: 1
      };
      console.warn('⚠️ Usando usuario demo - Integrar con auth real');
    }
    
    // ✅ DEBUG: Ver usuario actual
    console.log('🔐 USUARIO ACTUAL EN COMUNICACION:', this.usuarioActual);
    console.log('👤 ID Usuario:', this.usuarioActual.id);
    console.log('🎭 Rol Usuario:', this.usuarioActual.rol);
    console.log('📛 Nombre Usuario:', this.usuarioActual.nombre);
    
    this.cargarDatosIniciales();
  }

  // ========== CONTROL DE ACCESO ==========
  puedeCrearAnuncios(): boolean {
    const rolesPermitidos = ['admin', 'junta', 'personal'];
    return rolesPermitidos.includes(this.usuarioActual?.rol);
  }

  puedeGestionarQuejas(): boolean {
    return this.usuarioActual?.rol === 'admin';
  }

  puedeVerEstadisticas(): boolean {
    const rolesPermitidos = ['admin', 'junta'];
    return rolesPermitidos.includes(this.usuarioActual?.rol);
  }

  puedeEliminarContenido(): boolean {
    return this.usuarioActual?.rol === 'admin';
  }

  // ========== NAVEGACIÓN ==========
  cambiarModulo(modulo: string) {
    this.moduloActivo = modulo;
    this.cargarDatosModulo(modulo);
  }

  esModuloActivo(modulo: string): boolean {
    return this.moduloActivo === modulo;
  }

  cambiarUsuario() {
    this.usuarioActual.rol = this.usuarioActual.rol === 'admin' ? 'residente' : 'admin';
    this.usuarioActual.nombre = this.usuarioActual.rol === 'admin' ? 'Administrador' : 'Juan Residente';
    
    // ✅ DEBUG: Mostrar cambio de usuario
    console.log('🔄 CAMBIO DE USUARIO:', this.usuarioActual);
    
    this.cargarDatosModulo(this.moduloActivo);
  }

  // ========== CARGA DE DATOS PRINCIPAL ==========
  cargarDatosIniciales() {
    this.cargarAnuncios();
    this.cargarEstadisticasAnuncios();
  }

  cargarDatosModulo(modulo: string) {
    switch(modulo) {
      case 'anuncios':
        this.cargarAnuncios();
        this.cargarEstadisticasAnuncios();
        break;
      case 'mensajes':
        this.cargarMensajes();
        break;
      case 'quejas':
        this.cargarQuejas();
        this.cargarResumenQuejas();
        break;
      case 'encuestas':
        this.cargarEncuestas();
        break;
      case 'chat':
        this.cargarChat();
        break;
    }
  }

  // ========== ANUNCIOS ==========
  esExpirado(fechaExpiracion: string): boolean {
    if (!fechaExpiracion) return false;
    return new Date(fechaExpiracion) < new Date();
  }

  marcarAnuncioLeido(anuncioId: number) {
    console.log(`📖 Marcando anuncio ${anuncioId} como leído por usuario:`, this.usuarioActual.nombre);
  }

  editarAnuncio(anuncio: any) {
    this.nuevoAnuncio = { ...anuncio };
    console.log('✏️ Editando anuncio:', anuncio, 'por usuario:', this.usuarioActual.nombre);
  }

  cargarAnuncios() {
    this.cargando = true;
    console.log('📥 Cargando anuncios para usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.getAnuncios(this.filtroAnuncios).subscribe({
      next: (anuncios) => {
        this.anuncios = anuncios;
        this.anunciosFiltrados = [...this.anuncios];
        this.cargando = false;
        
        // ✅ DEBUG: Mostrar anuncios cargados
        console.log('✅ Anuncios cargados:', anuncios.length);
        anuncios.forEach(anuncio => {
          console.log(`   - "${anuncio.titulo}" por ${anuncio.autor_nombre} (ID: ${anuncio.autor})`);
        });
      },
      error: (error) => {
        console.error('❌ Error cargando anuncios:', error);
        this.cargando = false;
        alert('❌ Error al cargar anuncios');
      }
    });
  }

  cargarEstadisticasAnuncios() {
    console.log('📊 Cargando estadísticas para usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.getEstadisticasAnuncios().subscribe({
      next: (estadisticas) => {
        this.estadisticasAnuncios = estadisticas;
        console.log('✅ Estadísticas cargadas:', estadisticas);
      },
      error: (error) => {
        console.error('❌ Error cargando estadísticas:', error);
      }
    });
  }

  crearAnuncio() {
    // ✅ DEBUG: Mostrar creación de anuncio
    console.log('🆕 Creando anuncio:', this.nuevoAnuncio);
    console.log('👤 Usuario creador:', this.usuarioActual);
    
    if (!this.nuevoAnuncio.titulo || !this.nuevoAnuncio.contenido) {
      alert('❌ Título y contenido son obligatorios');
      return;
    }

    this.comunicacionService.crearAnuncio(this.nuevoAnuncio).subscribe({
      next: (nuevoAnuncio) => {
        this.anuncios.unshift(nuevoAnuncio);
        this.anunciosFiltrados.unshift(nuevoAnuncio);
        this.nuevoAnuncio = { titulo: '', contenido: '', tipo: 'ANUNCIO' };
        this.cargarEstadisticasAnuncios();
        
        // ✅ DEBUG: Confirmar creación
        console.log('✅ Anuncio creado exitosamente:', nuevoAnuncio);
        console.log('📝 Autor asignado:', nuevoAnuncio.autor_nombre, '(ID:', nuevoAnuncio.autor + ')');
        
        alert('✅ Anuncio publicado exitosamente');
      },
      error: (error) => {
        console.error('❌ Error creando anuncio:', error);
        alert('❌ Error al publicar el anuncio');
      }
    });
  }

  actualizarAnuncio(anuncio: Anuncio) {
    console.log('🔄 Actualizando anuncio:', anuncio.id, 'por usuario:', this.usuarioActual.nombre);
    
    const { id, ...datosActualizar } = anuncio;
    this.comunicacionService.actualizarAnuncio(id, datosActualizar).subscribe({
      next: (anuncioActualizado) => {
        const index = this.anuncios.findIndex(a => a.id === id);
        if (index !== -1) {
          this.anuncios[index] = anuncioActualizado;
          this.anunciosFiltrados = [...this.anuncios];
        }
        console.log('✅ Anuncio actualizado:', anuncioActualizado);
        alert('✅ Anuncio actualizado');
      },
      error: (error) => {
        console.error('❌ Error actualizando anuncio:', error);
        alert('❌ Error al actualizar el anuncio');
      }
    });
  }

  eliminarAnuncio(id: number) {
    console.log('🗑️ Eliminando anuncio:', id, 'por usuario:', this.usuarioActual.nombre);
    
    if (confirm('¿Estás seguro de eliminar este anuncio?')) {
      this.comunicacionService.eliminarAnuncio(id).subscribe({
        next: () => {
          this.anuncios = this.anuncios.filter(a => a.id !== id);
          this.anunciosFiltrados = this.anunciosFiltrados.filter(a => a.id !== id);
          this.cargarEstadisticasAnuncios();
          console.log('✅ Anuncio eliminado:', id);
          alert('✅ Anuncio eliminado');
        },
        error: (error) => {
          console.error('❌ Error eliminando anuncio:', error);
          alert('❌ Error al eliminar el anuncio');
        }
      });
    }
  }

  aplicarFiltrosAnuncios() {
    console.log('🔍 Aplicando filtros:', this.filtroAnuncios);
    this.cargarAnuncios();
  }

  limpiarFiltrosAnuncios() {
    this.filtroAnuncios = { excluir_expirados: true };
    console.log('🧹 Limpiando filtros');
    this.cargarAnuncios();
  }

  contarAnunciosPorTipo(tipo: string): number {
    return this.anuncios.filter(a => a.tipo === tipo).length;
  }

  // ========== MENSAJES ==========
  cargarMensajes() {
    console.log('📨 Cargando mensajes para usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.getMensajes(this.filtroQuejas).subscribe({
      next: (mensajes) => {
        this.mensajes = mensajes;
        console.log('✅ Mensajes cargados:', mensajes.length);
      },
      error: (error) => {
        console.error('❌ Error cargando mensajes:', error);
        alert('❌ Error al cargar mensajes');
      }
    });
  }

  enviarMensaje() {
    console.log('📤 Enviando mensaje:', this.nuevoMensaje, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.enviarMensaje(this.nuevoMensaje).subscribe({
      next: (nuevoMensaje) => {
        this.mensajes.unshift(nuevoMensaje);
        this.nuevoMensaje = { asunto: '', contenido: '', destinatario: 1 };
        console.log('✅ Mensaje enviado:', nuevoMensaje);
        alert('✅ Mensaje enviado exitosamente');
      },
      error: (error) => {
        console.error('❌ Error enviando mensaje:', error);
        alert('❌ Error al enviar el mensaje');
      }
    });
  }

  marcarMensajeLeido(id: number) {
    console.log('📖 Marcando mensaje como leído:', id, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.marcarMensajeLeido(id).subscribe({
      next: () => {
        const mensaje = this.mensajes.find(m => m.id === id);
        if (mensaje) {
          mensaje.leido = true;
        }
        console.log('✅ Mensaje marcado como leído:', id);
      },
      error: (error) => {
        console.error('❌ Error marcando mensaje como leído:', error);
      }
    });
  }

  // ========== QUEJAS/SUGERENCIAS ==========
  cargarQuejas() {
    console.log('📝 Cargando quejas/sugerencias para usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.getQuejas(this.filtroQuejas).subscribe({
      next: (quejas) => {
        this.quejas = quejas;
        this.quejasFiltradas = [...this.quejas];
        console.log('✅ Quejas cargadas:', quejas.length);
      },
      error: (error) => {
        console.error('❌ Error cargando quejas:', error);
        alert('❌ Error al cargar quejas y sugerencias');
      }
    });
  }

  cargarResumenQuejas() {
    this.comunicacionService.getResumenQuejas().subscribe({
      next: (resumen) => {
        this.resumenQuejas = resumen;
        console.log('✅ Resumen quejas cargado:', resumen);
      },
      error: (error) => {
        console.error('❌ Error cargando resumen de quejas:', error);
      }
    });
  }

  crearQueja() {
    console.log('🆕 Creando queja/sugerencia:', this.nuevaQueja, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.crearQueja(this.nuevaQueja).subscribe({
      next: (nuevaQueja) => {
        this.quejas.unshift(nuevaQueja);
        this.quejasFiltradas.unshift(nuevaQueja);
        this.nuevaQueja = { tipo: 'QUEJA', asunto: '', contenido: '' };
        this.cargarResumenQuejas();
        console.log('✅ Queja creada:', nuevaQueja);
        alert('✅ ' + (this.nuevaQueja.tipo === 'QUEJA' ? 'Queja' : 'Sugerencia') + ' enviada exitosamente');
      },
      error: (error) => {
        console.error('❌ Error enviando queja/sugerencia:', error);
        alert('❌ Error al enviar');
      }
    });
  }

  cambiarEstadoQueja(id: number, estado: string) {
    console.log('🔄 Cambiando estado queja:', id, 'a', estado, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.cambiarEstadoQueja(id, estado).subscribe({
      next: () => {
        const queja = this.quejas.find(q => q.id === id);
        if (queja) {
          queja.estado = estado as any;
        }
        console.log('✅ Estado actualizado:', estado);
        alert('✅ Estado actualizado');
      },
      error: (error) => {
        console.error('❌ Error cambiando estado:', error);
        alert('❌ Error al cambiar estado');
      }
    });
  }

  aplicarFiltrosQuejas() {
    console.log('🔍 Aplicando filtros quejas:', this.filtroQuejas);
    this.cargarQuejas();
  }

  // ========== ENCUESTAS ==========
  cargarEncuestas() {
    console.log('📊 Cargando encuestas para usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.getEncuestas(this.filtroEncuestas).subscribe({
      next: (encuestas) => {
        this.encuestas = encuestas;
        this.encuestasFiltradas = [...this.encuestas];
        console.log('✅ Encuestas cargadas:', encuestas.length);
      },
      error: (error) => {
        console.error('❌ Error cargando encuestas:', error);
        alert('❌ Error al cargar encuestas');
      }
    });
  }

  crearEncuesta() {
    console.log('🆕 Creando encuesta:', this.nuevaEncuesta, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.crearEncuesta(this.nuevaEncuesta).subscribe({
      next: (nuevaEncuesta) => {
        this.encuestas.unshift(nuevaEncuesta);
        this.encuestasFiltradas.unshift(nuevaEncuesta);
        this.nuevaEncuesta = { titulo: '', descripcion: '' };
        console.log('✅ Encuesta creada:', nuevaEncuesta);
        alert('✅ Encuesta creada exitosamente');
      },
      error: (error) => {
        console.error('❌ Error creando encuesta:', error);
        alert('❌ Error al crear la encuesta');
      }
    });
  }

  votarEncuesta(encuestaId: number, opcionId: number) {
    console.log('🗳️ Votando encuesta:', encuestaId, 'opción:', opcionId, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.votarEncuesta(encuestaId, opcionId).subscribe({
      next: () => {
        console.log('✅ Voto registrado');
        alert('✅ Voto registrado');
        this.cargarEncuestas();
      },
      error: (error) => {
        console.error('❌ Error votando:', error);
        alert('❌ Error al votar');
      }
    });
  }

  cerrarEncuesta(encuestaId: number) {
    console.log('🔒 Cerrando encuesta:', encuestaId, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.cerrarEncuesta(encuestaId).subscribe({
      next: () => {
        console.log('✅ Encuesta cerrada');
        alert('✅ Encuesta cerrada');
        this.cargarEncuestas();
      },
      error: (error) => {
        console.error('❌ Error cerrando encuesta:', error);
        alert('❌ Error al cerrar encuesta');
      }
    });
  }

  verResultadosEncuesta(encuestaId: number) {
    console.log('📈 Viendo resultados encuesta:', encuestaId, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.getResultadosEncuesta(encuestaId).subscribe({
      next: (resultados) => {
        this.resultadosEncuesta = resultados;
        console.log('✅ Resultados cargados:', resultados);
      },
      error: (error) => {
        console.error('❌ Error cargando resultados:', error);
        alert('❌ Error al cargar resultados');
      }
    });
  }

  // ========== CHAT COMUNITARIO ==========
  cargarChat() {
    console.log('💬 Cargando chat para usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.getMensajesChat().subscribe({
      next: (mensajes) => {
        this.mensajesChat = mensajes;
        console.log('✅ Mensajes chat cargados:', mensajes.length);
      },
      error: (error) => {
        console.error('❌ Error cargando chat:', error);
        alert('❌ Error al cargar mensajes del chat');
      }
    });
  }

  enviarMensajeChat() {
    if (!this.nuevoMensajeChat.mensaje.trim()) {
      alert('❌ El mensaje no puede estar vacío');
      return;
    }

    console.log('💬 Enviando mensaje chat:', this.nuevoMensajeChat, 'por usuario:', this.usuarioActual.nombre);
    
    this.comunicacionService.enviarMensajeChat(this.nuevoMensajeChat).subscribe({
      next: (nuevoMensaje) => {
        this.mensajesChat.push(nuevoMensaje);
        this.nuevoMensajeChat = { mensaje: '' };
        console.log('✅ Mensaje chat enviado:', nuevoMensaje);
      },
      error: (error) => {
        console.error('❌ Error enviando mensaje al chat:', error);
        alert('❌ Error al enviar mensaje');
      }
    });
  }

  // ========== UTILIDADES ==========
  formatearFecha(fechaString: string): string {
    return new Date(fechaString).toLocaleString('es-ES');
  }

  obtenerLabelTipo(tipo: string): string {
    const tipoEncontrado = this.tiposAnuncio.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  }

  obtenerLabelEstado(estado: string): string {
    const estadoEncontrado = this.estadosQueja.find(e => e.value === estado);
    return estadoEncontrado ? estadoEncontrado.label : estado;
  }
}