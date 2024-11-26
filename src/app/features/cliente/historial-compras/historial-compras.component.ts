import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';


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

  constructor(private userService: UsersService) {}

  ngOnInit(): void {
    this.userService.getPurchaseHistory().subscribe({
      next: (data) => {
        this.records = data;
        this.filteredRecords = data;
        console.log(data);
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

  generateReceipt(id: number): void {
    // this.userService.generateReceiptPDF(id).subscribe(
    //   (response) => {
    //     const url = window.URL.createObjectURL(response);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = `Recibo_${id}.pdf`;
    //     link.click();
    //   },
    //   (error) => console.error('Error al generar el recibo:', error)
    // );
  }

  generateInvoice(id: number): void {
    // this.userService.generateInvoicePDF(id).subscribe(
    //   (response) => {
    //     const url = window.URL.createObjectURL(response);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = `Factura_${id}.pdf`;
    //     link.click();
    //   },
    //   (error) => console.error('Error al generar la factura:', error)
    // );
  }
}
