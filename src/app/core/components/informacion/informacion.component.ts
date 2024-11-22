import { Component } from '@angular/core';
import { FooterService } from '../../services/footer.service';
import { UsersService } from '../../services/users.service';
import { SweetalertService } from '../../services/sweetalert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [CommonModule,FormsModule],
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
  onInputChange($event:any){
    console.log(this.nuevaResena)
  }
  constructor(private footer:FooterService,private userService:UsersService,private sweetalert:SweetalertService){}
  ngOnInit(): void {
    this.USS = sessionStorage.getItem('tipoUss') || ''
    this.Nombre = sessionStorage.getItem('Nombre') || ''
    // Recuperamos el objeto libro desde sessionStorage
    const libroData = sessionStorage.getItem('selectedLibro');
    sessionStorage.removeItem('selectedLibroId');
    if (libroData) {
      this.libro = JSON.parse(libroData); // Convertimos la cadena JSON de nuevo a un objeto
      // console.log('Libro seleccionado:', this.libro);
      this.obtenerResenas();
      this.verificarPermisosResena();
      this.footer.adjustFooterPosition()
    } else {
      console.log('No se ha seleccionado un libro.');
    }
  }
  ngAfterViewInit(): void {
    this.footer.adjustFooterPosition();
  }
  getCurrentUserId(): number {
    // console.log(sessionStorage.getItem('ID_Uss'))
    return parseInt(sessionStorage.getItem('ID_Uss') || '0');
  }
  verificarPermisosResena(): void {
    const idUsuario = sessionStorage.getItem('ID_Uss');
    if (!idUsuario) return;

    // Verificar si el usuario ha devuelto este libro
    this.userService.verificarPrestamoDevuelto(idUsuario, this.libro.ID).subscribe(
      (response) => {
        // console.log('Respuesta:',response)
        if(response.length > 0){
          this.puedeResenar = true;
        }
        if (this.puedeResenar) {
          this.verificarResenaExistente(idUsuario);
        }
      },
      (error) => {
        console.error('Error al verificar permisos de reseña', error);
      }
    );
  }
  verificarResenaExistente(idUsuario: string): void {
    this.userService.obtenerResenaUsuario(idUsuario, this.libro.ID).subscribe(
      (resena) => {
        if (resena) {
          console.log(resena)
          this.resenaExistente = true;
          this.nuevaResena.descripcion = resena.Descripcion;
          this.nuevaResena.calificacion = resena.Calificacion;
          this.nuevaResena.ID_Resena = resena.ID_Resena;
          this.nuevaResena.ID_Usuario = resena.ID_Usuario;
          console.log(this.nuevaResena)
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
    const idUsuario = sessionStorage.getItem('ID_Uss');
    if (!idUsuario) return;
  
    // Construimos el objeto con todos los datos necesarios
    const resenaData = {
      ID_Usuario: parseInt(idUsuario),
      ID_Libro: this.libro.ID,
      Calificacion: this.calificacion,
      Descripcion: this.nuevaResena.descripcion,
      ID_Resena: this.nuevaResena.ID_Resena
    };
  
    console.log('Datos a enviar:', resenaData);
  
    // Si es una actualización
    if (this.resenaExistente) {
      this.userService.actualizarResena(resenaData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
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
    if (this.libro?.ID) {
      this.userService.getResenasLibro(this.libro.ID).subscribe({
        next: (resenas) => {
          // Obtenemos el ID del usuario actual
          const idUsuarioActual = this.getCurrentUserId();
          
          // Ordenamos las reseñas: primero la del usuario actual, luego el resto
          this.resenas = resenas.sort((a, b) => {
            console.log('ASldsa ',a,b);
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
    const idUsuario = sessionStorage.getItem('ID_Uss');
    
    if (!idUsuario || !idLibro) {
      this.sweetalert.showNoReload('ID de usuario o libro inválido.');
      return;
    }
  
    // Verificar si el usuario ya tiene libros apartados
    this.userService.getReservas().subscribe(
      (data) => {
        if (data.length >= 3) {
          this.sweetalert.showNoReload('Ya tienes la cantidad máxima de libros reservados.');
          return;
        }
  
        // Si todo está bien, procedemos a realizar la reserva
        this.userService.reservarLibro(idUsuario, idLibro).subscribe(
          (data) => {
            if (data.message == "exito") {
              if (data.reserva) {
                this.sweetalert.showNoReload(`Reserva realizada con éxito 😊
                  <span style="font-size: 16px;">Fecha límite para recoger libro:</span>
                  <span style="font-size: 16px;">${data.reserva.Fecha_recoger}.</span>
                  <span style="font-size: 16px;">Para más información, vaya al apartado de libros reservados.</span>
                `);
              }
            }
          },
          (error) => {
            console.error('Error al realizar la reserva', error);
            this.sweetalert.showNoReload('Error al enviar la solicitud al servidor');
          }
        );
      },
      (error) => {
        console.error('Error al verificar los libros apartados', error);
        this.sweetalert.showNoReload('Error al verificar los libros apartados');
      }
    );
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
      ID_Usuario: parseInt(sessionStorage.getItem('ID_Uss') || '0')
    };
    this.calificacion = 0;
    
    // Scroll hacia el formulario
    setTimeout(() => {
      const formElement = document.querySelector('.resena-form');
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  carrito():void{
    
  }
}
