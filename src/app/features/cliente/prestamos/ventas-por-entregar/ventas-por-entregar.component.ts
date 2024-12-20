import { Component } from '@angular/core';
import { UsersService } from '../../../../core/services/users/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetalertService } from '../../../../core/services/sweetalert/sweetalert.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ventas-por-entregar',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './ventas-por-entregar.component.html',
  styleUrl: './ventas-por-entregar.component.css'
})
export class VentasPorEntregarComponent {
  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  searchTerm: string = '';
  constructor(private userService: UsersService,
    private sweetalert:SweetalertService,
    private router:Router,
    private toastr: ToastrService
  ){}
  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.userService.getVentasPorEntregar().subscribe({
      next: (data) => {
        this.ventas = data.data;
        this.ventasFiltradas = data.data;
        if(this.ventas.length == 0){
          this.toastr.info(data.message,'',{toastClass:'custom-toast'});
        }
      },
      error: (error) => {
        console.error('Error al cargar las ventas:', error);
      }
    });
  }

  filterVentas(): void {
    const term = this.searchTerm.toLowerCase();
    this.ventasFiltradas = this.ventas.filter(venta => 
      venta.Nombre_Usuario.toLowerCase().includes(term) ||
      venta.Pendiente.toLowerCase().includes(term) || 
      venta.Fecha_Venta.toLowerCase().includes(term) ||
      venta.Cantidad.toString().includes(term)
    );
  }
  generarRecibo(id: number): void {
    this.router.navigate(['/recibo', id])
  }
  procesarPago(id: number): void {
    this.router.navigate(['/pago-sucursal', id]);
  }

  async procesarEntrega(venta: any): Promise<void> {
    // Si ya está entregado, no hacer nada
    if (venta.Entregado === 'SI') {
      return;
    }

    // Verificar si está pagado
    if (venta.Pendiente !== 'NO') {
      Swal.fire({
        title: 'Pago pendiente',
        text: 'Esta venta aún no ha sido pagada. ¿Desea proceder con el pago?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ir a pagar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.procesarPago(venta.ID_Venta);
        }
      });
      return;
    }

    // Si está pagado, mostrar resumen y confirmar entrega
    try {
      // Obtener detalles de los libros
      const detalles = await this.userService.getDetalleVenta(venta.ID_Venta).toPromise();
      
      // Crear lista HTML de libros
      const librosHTML = detalles.map((libro: any) => 
        `<li>${libro.Titulo} (${libro.Cantidad} unidades)</li>`
      ).join('');

      const result = await Swal.fire({
        title: 'Confirmar entrega',
        html: `
          <div class="resumen-entrega">
            <h4>Resumen de entrega:</h4>
            <p><strong>Cliente:</strong> ${venta.Nombre_Usuario}</p>
            <p><strong>Fecha de compra:</strong> ${new Date(venta.Fecha_Venta).toLocaleDateString()}</p>
            <p><strong>Libros a entregar:</strong></p>
            <ul>${librosHTML}</ul>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar entrega',
        cancelButtonText: 'Cancelar',
        customClass: {
          container: 'resumen-entrega-container'
        }
      });

      if (result.isConfirmed) {
        // Actualizar estado de entrega
        this.userService.actualizarEntregaVenta(venta).subscribe({
          next: (response) => {
            this.toastr.success('La venta ha sido marcada como entregada exitosamente','',{toastClass:'custom-toast'});
            // Recargar datos
            this.cargarVentas();
          },
          error: (error) => {
            console.error('Error al actualizar entrega:', error);
            this.toastr.error('Error al actualizar el estado de la entrega','',{toastClass:'custom-toast'});
          }
        });
      }
    } catch (error) {
      console.error('Error al procesar la entrega:', error);
      this.toastr.error('Error al procesar la entrega','',{toastClass:'custom-toast'});
    }
  }
}
