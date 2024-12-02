import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterService } from '../../../core/services/footer/footer.service';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-libros-reservados',
  standalone: true,
  imports: [FormsModule,CommonModule,ImageLoadingDirective],
  templateUrl: './libros-reservados.component.html',
  styleUrl: './libros-reservados.component.css'
})
export class LibrosReservadosComponent {
  reservas: any[] = [];
  constructor(private userService:UsersService,private footer:FooterService,private sweetalert:SweetalertService){}
  ngOnInit(): void {
    this.cargarReservas();
  }
  cargarReservas(): void {
    this.userService.getReservas().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.reservas = data.map(reserva => ({
            ...reserva,
            fecha1: this.formatearFecha(reserva.fecha1),
            fecha2: this.formatearFecha(reserva.fecha2)
          }));
          this.footer.adjustFooterPosition();
        }
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        this.sweetalert.showNoReload('Error al cargar las reservas');
      }
    });
  }
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }
  deshacerReserva(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar reserva',
      cancelButtonText: 'No, mantener reserva'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.userService.deshacerReserva(id).subscribe({
          next: () => {
            this.cargarReservas(); // Recargar todas las reservas
            this.sweetalert.showNoReload('Reserva cancelada con éxito');
          },
          error: (error) => {
            console.error('Error al deshacer la reserva:', error);
            this.sweetalert.showNoReload('Error al cancelar la reserva');
          }
        });
      }
    });
  }
}
