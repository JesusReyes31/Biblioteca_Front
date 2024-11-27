import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FooterService } from '../../../core/services/footer/footer.service';

@Component({
  selector: 'app-historial-prestamo',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './historial-prestamo.component.html',
  styleUrl: './historial-prestamo.component.css'
})
export class HistorialPrestamoComponent {
  records: any[] = [];
  filteredRecords: any[] = [];
  searchTerm: string = '';

  constructor(private userService: UsersService,private footer:FooterService) {}

  ngOnInit(): void {
    this.userService.getLoanHistory().subscribe({
      next: (data) => {
        this.records = data;
        this.filteredRecords = data;
      },
      error: (error) => {
        if (error.message === 'No se encontraron prestamos para este usuario.') {
          Swal.fire({
            icon: 'info',
            title: 'Sin Prestamos',
            text: 'No se encontraron prestamos para este usuario.',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al obtener los prestamos. Intenta nuevamente más tarde.',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
  }

  filterRecords(): void {
    this.filteredRecords = this.records.filter((record) =>
      Object.values(record)
        .join(' ')
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase())
    );
  }

}
