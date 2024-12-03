import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import { Router } from '@angular/router';


@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [FormsModule,CommonModule,ImageLoadingDirective],
  templateUrl: './historial-compras.component.html',
  styleUrl: './historial-compras.component.css'
})
export class HistorialComprasComponent {
  records: any[] = [];
  filteredRecords: any[] = [];
  searchTerm: string = '';

  constructor(private userService: UsersService,private router: Router) {}

  ngOnInit(): void {
    this.userService.getPurchaseHistory().subscribe({
      next: (data) => {
        console.log(data)
        this.records = data;
        this.filteredRecords = data;
      },
      error: (error) => {
        if (error.message === 'No se encontraron ventas para este usuario.') {
          Swal.fire({
            icon: 'info',
            title: 'Sin Compras',
            text: 'No se encontraron compras para este usuario.',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al obtener las compras. Intenta nuevamente más tarde.',
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

  generarRecibo(id: number): void {
    this.router.navigate(['/recibo', id]);
  }

  generarFactura(id: number): void {
    this.router.navigate(['/factura', id], {
      skipLocationChange: false,
      replaceUrl: false
    });
  }
}
