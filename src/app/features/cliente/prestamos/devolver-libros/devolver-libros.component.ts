import { Component } from '@angular/core';
import { UsersService } from '../../../../core/services/users/users.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-devolver-libros',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './devolver-libros.component.html',
  styleUrl: './devolver-libros.component.css'
})
export class DevolverLibrosComponent {
  idLibro: string = '';
  
  constructor(private userService: UsersService,
    private toastr: ToastrService
  ) {}

  onDevolver(): void {
    if (!this.idLibro) {
      this.toastr.warning('Por favor ingrese el ID del libro','',{toastClass:'custom-toast'});
      return;
    }

    Swal.fire({
      title: 'Ingrese el ID del usuario',
      input: 'number',
      inputLabel: 'ID del usuario que solicitó el préstamo',
      inputPlaceholder: 'Ingrese el ID del usuario',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        const numValue = Number(value);
        if (!value || numValue <= 0) {
          return 'Por favor ingrese un ID de usuario válido';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const idUsuario = parseInt(result.value);
        
        Swal.fire({
          title: '¿Estás seguro?',
          text: '¿Deseas devolver este libro?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, devolver',
          cancelButtonText: 'Cancelar'
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            this.userService.devolverLibro(this.idLibro, idUsuario).subscribe({
              next: (response) => {
                this.toastr.success('Libro devuelto exitosamente','',{toastClass:'custom-toast'});
                this.idLibro = '';
              },
              error: (error) => {
                this.toastr.error(error.error.message || 'Error al devolver el libro','',{toastClass:'custom-toast'});
              }
            });
          }
        });
      }
    });
  }
}
