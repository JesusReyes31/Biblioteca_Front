import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterService } from '../../../core/services/footer/footer.service';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';

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
        if (!data.message) {
          this.reservas = data;
          this.footer.adjustFooterPosition();
        }
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
      }
    });
  }
  deshacerReserva(id:string){
    this.userService.deshacerReserva(id).subscribe({
      next: () => {
        // Actualizamos las reservas después de eliminar una
        this.reservas = this.reservas.filter(reserva => reserva.ID_libro !== id);
        this.sweetalert.showReload(`Reserva eliminada con éxito`);
      },
      error: (error) => {
        this.sweetalert.showNoReload(`Error al deshacer la reserva: ${error}`);
        console.error('Error al deshacer la reserva:', error);
      }
    });
  }
}
