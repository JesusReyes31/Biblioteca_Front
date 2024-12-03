import { Component, HostListener } from '@angular/core';
import { FooterService } from '../../services/footer/footer.service';
import { UsersService } from '../../services/users/users.service';
import { SweetalertService } from '../../services/sweetalert/sweetalert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import { Location } from '@angular/common';
import { DatosService } from '../../services/users/datos.service';

@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [CommonModule,FormsModule,ImageLoadingDirective],
  templateUrl: './informacion.component.html',
  styleUrl: './informacion.component.css'
})
export class InformacionComponent {
  libro: any = null;
  resenas: any[] = [];
  USS:string = '';
  Nombre:string = '';
  ID:number = 0;
  puedeResenar: boolean = false;
  resenaExistente: boolean = false;
  calificacion: number = 0;
  hoverCalificacion: number = 0;
  nuevaResena = {
    descripcion: '',
    calificacion: 0,
    ID_Resena:0,
    ID_Usuario:0
  };
  mostrarFormulario: boolean = false;
  dragStartX: number = 0;
  sucursalSeleccionada: number = 0;
  ejemplarSeleccionado: any = null;
  cantidadCarrito: number = 1;
  constructor(
    private footer:FooterService,
    private userService:UsersService,
    private sweetalert:SweetalertService,
    private location: Location,
    private datos:DatosService
  ){}
  ngOnInit(): void {
    this.USS = this.datos.getTipoUss() || ''
    this.Nombre = this.datos.getNombre() || ''
    // Recuperamos el objeto libro desde sessionStorage
    const libroData = sessionStorage.getItem('selectedLibro');
    sessionStorage.removeItem('selectedLibro');
    if (libroData) {
      this.libro = JSON.parse(libroData); // Convertimos la cadena JSON de nuevo a un objeto
      this.obtenerResenas();
      this.verificarPermisosResena();
      this.footer.adjustFooterPosition()
    }
  }
  ngAfterViewInit(): void {
    this.footer.adjustFooterPosition();
  }
  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    // Guardar datos antes de destruir el componente
    if (this.libro) {
      sessionStorage.setItem('selectedLibro', JSON.stringify(this.libro));
    }
  }
  getCurrentUserId(): number {
    return parseInt(this.datos.getID_Uss() || '0');
  }
  verificarPermisosResena(): void {
    const idUsuario = this.datos.getID_Uss();
    if (!idUsuario) return;

    // Verificar si el usuario ha devuelto este libro
    this.userService.verificarPrestamoDevuelto(idUsuario, this.libro.Ejemplares[0].ID).subscribe(
      (response) => {
        if(response.length > 0){
          this.puedeResenar = true;
        }
        if (this.puedeResenar) {
          this.verificarResenaExistente(idUsuario);
        }
      },
      (error) => {
        // console.error('Error al verificar permisos de reseña', error);
      }
    );
  }
  verificarResenaExistente(idUsuario: string): void {
    this.userService.obtenerResenaUsuario(idUsuario, this.libro.ID).subscribe(
      (resena) => {
        if (resena) {
          this.resenaExistente = true;
          this.nuevaResena.descripcion = resena.Descripcion;
          this.nuevaResena.calificacion = resena.Calificacion;
          this.nuevaResena.ID_Resena = resena.ID_Resena;
          this.nuevaResena.ID_Usuario = resena.ID_Usuario;
        }
      },
      (error) => {
        console.error('Error al verificar reseña existente', error);
      }
    );
  }
  setCalificacion(valor: number): void {
    // Si no es un número válido, establecer a 0
    if (isNaN(valor)) {
      valor = 0;
    }
    
    this.calificacion = valor;
    this.nuevaResena.calificacion = valor;
  }
  ajustarCalificacion(): void {
    // Ajustar valores fuera de rango cuando el input pierde el foco
    if (this.calificacion > 5) {
      this.calificacion = 5;
    } else if (this.calificacion < 0) {
      this.calificacion = 0;
    }
    
    // Asegurarse de que sea un número entero
    this.calificacion = Math.round(this.calificacion);
    this.nuevaResena.calificacion = this.calificacion;
  }

  guardarResena(): void {
    const idUsuario = this.datos.getID_Uss();
    if (!idUsuario) return;
  
    // Construimos el objeto con todos los datos necesarios
    const resenaData = {
      ID_Usuario: parseInt(idUsuario),
      ID_Libro: this.libro.ID,
      Calificacion: this.calificacion,
      Descripcion: this.nuevaResena.descripcion,
      ID_Resena: this.nuevaResena.ID_Resena
    };
  
    // Si es una actualización
    if (this.resenaExistente) {
      this.userService.actualizarResena(resenaData).subscribe({
        next: (response) => {
          // Actualizamos el estado local con los datos enviados, no con la respuesta
          this.nuevaResena = {
            ...this.nuevaResena,
            calificacion: this.calificacion,
            descripcion: this.nuevaResena.descripcion,
            ID_Usuario: parseInt(idUsuario)
          };
  
          Swal.fire({
            title: '¡Actualizada!',
            text: 'La reseña se actualizó correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
  
          this.obtenerResenas();
          this.mostrarFormulario = false;
        },
        error: (error) => {
          console.error('Error al actualizar reseña:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la reseña',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    } else {
      // Si es una nueva reseña
      this.userService.crearResena(resenaData).subscribe({
        next: (response) => {
          if (response.ID_Resena) {
            this.nuevaResena.ID_Resena = response.ID_Resena;
            this.resenaExistente = true;
          }
  
          Swal.fire({
            title: '¡Publicada!',
            text: 'La reseña se publicó correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
  
          this.obtenerResenas();
          this.mostrarFormulario = false;
        },
        error: (error) => {
          console.error('Error al crear reseña:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear la reseña',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    }
  }

  eliminarResena(): void {
    if (!this.nuevaResena.ID_Resena) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.eliminarResena(this.nuevaResena.ID_Resena).subscribe(
          () => {
            Swal.fire({
              title: '¡Eliminada!',
              text: 'La reseña ha sido eliminada exitosamente',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            
            // Resetear el estado
            this.resenaExistente = false;
            this.nuevaResena = { 
              descripcion: '', 
              calificacion: 0, 
              ID_Resena: 0,
              ID_Usuario: 0
            };
            this.calificacion = 0;
            this.obtenerResenas();
          },
          (error) => {
            console.error('Error al eliminar reseña', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la reseña',
              icon: 'error',
              timer: 1500,
              showConfirmButton: false
            });
          }
        );
      }
    });
  }

  obtenerResenas(): void {  
    // Llamamos al servicio para obtener las reseñas asociadas al libro
    if (this.libro.Ejemplares[0].ID) {
      this.userService.getResenasLibro(this.libro.Ejemplares[0].ID).subscribe({
        next: (resenas) => {
          // Obtenemos el ID del usuario actual
          const idUsuarioActual = this.getCurrentUserId();
          
          // Ordenamos las reseñas: primero la del usuario actual, luego el resto
          this.resenas = resenas.sort((a, b) => {
            if (a.ID_Usuario === idUsuarioActual) return -1;
            if (b.ID_Usuario === idUsuarioActual) return 1;
            
            // Si ninguna es del usuario actual, ordenamos por fecha (más reciente primero)
            return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
          });
        },
        error: (error) => {
          console.error('Error al obtener reseñas:', error);
        }
      });
    }
  }
  reservarLibro(idLibro: string): void {
    if (!this.sucursalSeleccionada || !this.ejemplarSeleccionado) {
      this.sweetalert.showNoReload('Por favor, selecciona una sucursal');
      return;
    }

    const idUsuario = this.datos.getID_Uss();
    
    if (!idUsuario || !idLibro) {
      this.sweetalert.showNoReload('ID de usuario o libro inválido.');
      return;
    }

    // Verificar disponibilidad
    if (!this.ejemplarSeleccionado || this.ejemplarSeleccionado.Cantidad <= 0) {
      this.sweetalert.showNoReload('No hay ejemplares disponibles en esta sucursal.');
      return;
    }

    // Mostrar confirmación con información del plazo
    Swal.fire({
      title: '¿Deseas reservar este libro?',
      html: `
        <p>Al reservar este libro, tienes <strong>24 horas</strong> para recogerlo en la sucursal ${this.ejemplarSeleccionado.Sucursales.Nombre}.</p>
        <p>Después de este plazo, la reserva será cancelada automáticamente.</p>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí, reservar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.reservarLibro(this.ejemplarSeleccionado.ID, parseInt(idUsuario))
          .subscribe({
            next: (response) => {
              this.sweetalert.showReload('Libro reservado exitosamente. Recuerda recogerlo en las próximas 24 horas.');
              this.ejemplarSeleccionado.Cantidad--;
            },
            error: (error) => {
              let mensaje = 'Error al reservar el libro';
              if (error.error?.message) {
                mensaje = error.error.message;
              }
              this.sweetalert.showNoReload(mensaje);
            }
          });
      }
    });
  }
  getStarArray(calificacion: number): number[] {
    const fullStars = Math.floor(calificacion); // Número de estrellas completas
    const fractionalStar = calificacion % 1;    // Parte decimal de la calificación
    const emptyStars = 5 - Math.ceil(calificacion); // Estrellas vacías restantes
  
    // Construir el array de estrellas
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(1); // Estrella completa
    }
    if (fractionalStar > 0) {
      stars.push(fractionalStar); // Estrella parcial
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(0); // Estrella vacía
    }
    return stars;
  }
  mostrarFormularioEdicion(resena: any): void {
    this.mostrarFormulario = true;
    this.resenaExistente = true;
    this.nuevaResena = {
      descripcion: resena.Descripcion,
      calificacion: resena.Calificacion,
      ID_Resena: resena.ID_Resena,
      ID_Usuario: resena.ID_Usuario
    };
    this.calificacion = resena.Calificacion;
    
    // Scroll hacia el formulario
    setTimeout(() => {
      const formElement = document.querySelector('.resena-form');
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  // Funciones para el arrastre de estrellas
  dragStart(event: DragEvent): void {
    if (event.screenX) {
      this.dragStartX = event.screenX;
    }
  }
  
  drag(event: DragEvent): void {
    if (event.screenX) {
      const diff = event.screenX - this.dragStartX;
      const starWidth = 100; // Aumentamos el ancho para reducir sensibilidad
      const starsMove = Math.floor(diff / starWidth); // Usamos floor en lugar de round
      // Cambiamos la lógica para que sea más intuitiva y menos sensible
      let newRating = Math.max(1, Math.min(5, Math.round(starsMove + this.calificacion)));
      
      if (newRating !== this.calificacion && Math.abs(diff) >= starWidth) {
        this.setCalificacion(newRating);
      }
    }
  }
  
  dragEnd(event: DragEvent): void {
    if (event.screenX) {
      const diff = event.screenX - this.dragStartX;
      const starWidth = 40;
      const starsMove = Math.floor(diff / starWidth);
      let finalRating = Math.max(1, Math.min(5, Math.round(starsMove + this.calificacion)));
      this.setCalificacion(finalRating);
    }
  }
  mostrarFormularioNuevo(): void {
    this.mostrarFormulario = true;
    this.resenaExistente = false;
    // Reiniciamos los valores del formulario
    this.nuevaResena = {
      descripcion: '',
      calificacion: 0,
      ID_Resena: 0,
      ID_Usuario: parseInt(this.datos.getID_Uss() || '0')
    };
    this.calificacion = 0;
    
    // Scroll hacia el formulario
    setTimeout(() => {
      const formElement = document.querySelector('.resena-form');
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  async agregarcarrito(): Promise<void> {
    if (!this.sucursalSeleccionada || !this.ejemplarSeleccionado) {
      this.sweetalert.showNoReload('Por favor, selecciona una sucursal');
      return;
    }

    const idUsuario = this.datos.getID_Uss();
    
    if (!idUsuario) {
      this.sweetalert.showNoReload('Usuario no válido');
      return;
    }

    // Verificar disponibilidad
    if (!this.ejemplarSeleccionado || this.ejemplarSeleccionado.Cantidad <= 0) {
      this.sweetalert.showNoReload('No hay ejemplares disponibles en esta sucursal.');
      return;
    }

    // Obtener el carrito actual del usuario
    this.userService.getCarrito().subscribe({
      next: async (carrito) => {
        const libroEnCarrito = carrito.find((item: any) => 
          item.ID_Ejemplar === this.ejemplarSeleccionado.ID
        );
        const cantidadDisponible = this.ejemplarSeleccionado.Cantidad;
        
        let mensajeHTML = `
          <p>Cantidad disponible en ${this.ejemplarSeleccionado.Sucursales.Nombre}: ${cantidadDisponible}</p>
        `;
        
        if (libroEnCarrito) {
          mensajeHTML += `<p>Cantidad actual en carrito: ${libroEnCarrito.Cantidad}</p>`;
        }
        mensajeHTML += `<p>¿Cuántos ejemplares deseas agregar?</p>`;

        const { value: cantidadAgregar } = await Swal.fire({
          title: 'Agregar al carrito',
          html: mensajeHTML,
          input: 'number',
          inputAttributes: {
            min: '1',
            max: cantidadDisponible.toString(),
            step: '1',
            onkeydown: 'return event.keyCode !== 190 && event.keyCode !== 110',
            onkeypress: 'return event.charCode >= 48 && event.charCode <= 57',
            pattern: '[0-9]*'
          },
          inputValue: 1,
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Agregar',
          inputValidator: (value) => {
            const num = parseInt(value);
            if (!value || !Number.isInteger(num)) {
              return 'Debes ingresar un número entero';
            }
            if (num < 1) {
              return 'La cantidad mínima es 1';
            }
            if (num > cantidadDisponible) {
              return `Solo hay ${cantidadDisponible} ejemplares disponibles`;
            }
            return null;
          }
        });

        if (cantidadAgregar) {
          this.userService.agregarAlCarrito(
            parseInt(idUsuario),
            this.ejemplarSeleccionado.ID,
            cantidadAgregar
          ).subscribe({
            next: (response) => {
              this.sweetalert.showNoReload('Libro(s) agregado(s) al carrito exitosamente');
              this.userService.notificarActualizacionCarrito();
            },
            error: (error) => {
              let mensaje = 'Error al agregar al carrito';
              if (error.error?.message) {
                mensaje = error.error.message;
              }
              this.sweetalert.showNoReload(mensaje);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener el carrito:', error);
        this.sweetalert.showNoReload('Error al verificar el carrito');
      }
    });
  }

  regresar(): void {
    this.location.back();
  }

  onSucursalChange() {
    this.ejemplarSeleccionado = this.libro?.Ejemplares.find(
      (e: any) => e.ID_Sucursal === Number(this.sucursalSeleccionada)
    );
  }
}
