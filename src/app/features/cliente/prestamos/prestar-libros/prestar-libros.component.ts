import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users/users.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
@Component({
  selector: 'app-prestar-libros',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './prestar-libros.component.html',
  styleUrl: './prestar-libros.component.css'
})
export class PrestarLibrosComponent {
  estadoReservado: boolean = true;
  idUsuario: string = '';
  reservas: any[] = [];
  error: string = '';

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
  }

  cambiarEstado(estado: string): void {
    this.estadoReservado = estado === 'reservado';
  }

  consultar(): void {
    if (!this.idUsuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: this.estadoReservado ? 
              'Por favor ingrese un ID de usuario' : 
              'Por favor ingrese un ID de libro',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
      this.reservas = [];
      return;
    }

    if (this.estadoReservado) {
      // Consulta por ID de usuario (reservados)
      this.consultarReservasUsuario();
    } else {
      // Consulta por ID de libro (no reservados)
      this.consultarLibroDisponible();
    }
  }
  private consultarReservasUsuario(): void {
    this.usersService.getReservasByID(this.idUsuario).subscribe({
      next: (data) => {
        this.reservas = data;
        this.error = '';
        if (this.reservas.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Información',
            text: 'No hay reservas para este usuario',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      error: (error) => {
        console.error('Error al consultar reservas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al consultar las reservas del usuario',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        });
        this.reservas = [];
      }
    });
  }

  private consultarLibroDisponible(): void {
    this.usersService.getLibroDisponible(this.idUsuario).subscribe({
      next: (data) => {
        console.log(data);
        // Asumiendo que el servicio devuelve un libro individual
        if (data) {
          this.reservas = [{
            ID_Libro: data.ID,
            Titulo: data.Titulo,
            Autor: data.Autor,
            Cantidad: data.Cantidad,
            // Otros campos necesarios...
          }];
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Información',
            text: 'El libro no está disponible o no existe',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
          });
          this.reservas = [];
        }
      },
      error: (error) => {
        console.error('Error al consultar libro:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al consultar la disponibilidad del libro',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        });
        this.reservas = [];
      }
    });
  }
  prestar(reserva: any): void {
    // Validación inicial
    if (!reserva.ID_Libro) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se puede identificar el libro',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Para préstamos no reservados, necesitamos verificar la cantidad
    if (!this.estadoReservado) {
        // Verificar que haya cantidad disponible
        if (!reserva.Cantidad || reserva.Cantidad <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El libro no está disponible para préstamo',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Solicitar ID de usuario para préstamo no reservado
        Swal.fire({
            title: 'Ingrese ID del Usuario',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Prestar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            showLoaderOnConfirm: true,
            preConfirm: (idUsuario) => {
                if (!idUsuario) {
                    Swal.showValidationMessage('Por favor ingrese un ID de usuario');
                    return false;
                }
                return idUsuario;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                this.realizarPrestamo(reserva.ID_Libro, parseInt(result.value));
            }
        });
    } else {
        // Para préstamos reservados, usar el ID de usuario actual
        const idUsuarioNum = parseInt(this.idUsuario);
        if (!idUsuarioNum) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'ID de usuario inválido',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        this.realizarPrestamo(reserva.ID_Libro, idUsuarioNum);
    }
  }

  // Método separado para realizar el préstamo
  private realizarPrestamo(idLibro: string, idUsuario: number): void {
    this.usersService.prestarLibro(idLibro, idUsuario).subscribe({
        next: (response) => {
            Swal.fire({
                icon: 'success' as SweetAlertIcon,
                title: '¡Éxito!',
                text: response.message || 'Libro prestado correctamente 😊',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
        },
        error: (error) => {
            console.error('Error al realizar el préstamo:', error);
            let errorMessage = 'Error al realizar el préstamo';
            
            if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (error.status === 404) {
                errorMessage = 'Usuario no encontrado';
            } else if (error.status === 400) {
                errorMessage = error.error.message || 'El libro no está disponible';
            }
            
            Swal.fire({
                icon: 'error' as SweetAlertIcon,
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Aceptar'
            });
        }
    });
  }
}
