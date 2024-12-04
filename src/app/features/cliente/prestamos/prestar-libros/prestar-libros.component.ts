import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users/users.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
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

  constructor(private usersService: UsersService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  cambiarEstado(estado: string): void {
    this.estadoReservado = estado === 'reservado';
  }

  consultar(): void {
    if (!this.idUsuario) {
      this.toastr.warning(this.estadoReservado ? 
              'Por favor ingrese un ID de usuario' : 
              'Por favor ingrese un ID de libro','',
              {toastClass:'custom-toast'}
      );
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
          this.toastr.info('No hay reservas para este usuario','',{toastClass:'custom-toast'});
        }
      },
      error: (error) => {
        console.error('Error al consultar reservas:', error);
        this.toastr.error('Error al consultar las reservas del usuario','',{toastClass:'custom-toast'});
        this.reservas = [];
      }
    });
  }

  private consultarLibroDisponible(): void {
    this.usersService.getLibroDisponible(this.idUsuario).subscribe({
      next: (data) => {
        // Asumiendo que el servicio devuelve un libro individual
        if (data) {
          this.reservas = [{
            ID_Ejemplar: data[0].ID,
            ID_Libro: data[0].ID,
            Titulo: data[0].Titulo,
            Autor: data[0].Autor,
            Cantidad: data[0].Cantidad,
            ID_Sucursal: data[0].ID_Sucursal,
            Sucursal: data[0].Sucursal
            // Otros campos necesarios...
          }];
        } else {
          this.toastr.info('El libro no está disponible o no existe','',{toastClass:'custom-toast'});
          this.reservas = [];
        }
      },
      error: (error) => {
        console.error('Error al consultar libro:', error);
        this.toastr.error('Error al consultar la disponibilidad del libro','',{toastClass:'custom-toast'});
        this.reservas = [];
      }
    });
  }
  prestar(reserva: any): void {
    // Validación inicial
    if (!reserva.ID_Libro) {
        this.toastr.error('No se puede identificar el libro','',{toastClass:'custom-toast'});
        return;
    }

    // Para préstamos no reservados, necesitamos verificar la cantidad
    if (!this.estadoReservado) {
        // Verificar que haya cantidad disponible
        if (!reserva.Cantidad || reserva.Cantidad <= 0) {
            this.toastr.error('El libro no está disponible para préstamo','',{toastClass:'custom-toast'});
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
                this.realizarPrestamo(reserva.ID_Ejemplar, parseInt(result.value));
            }
        });
    } else {
        // Para préstamos reservados, usar el ID de usuario actual
        const idUsuarioNum = parseInt(this.idUsuario);
        if (!idUsuarioNum) {
            this.toastr.error('ID de usuario inválido','',{toastClass:'custom-toast'});
            return;
        }
        this.realizarPrestamo(reserva.ID_Ejemplar, idUsuarioNum);
    }
  }

  // Método separado para realizar el préstamo
  private realizarPrestamo(idEjemplar: string, idUsuario: number): void {
    this.usersService.prestarLibro(idEjemplar, idUsuario).subscribe({
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
            this.toastr.error(error.error.message,'',{toastClass:'custom-toast'});
        }
    });
  }
}
