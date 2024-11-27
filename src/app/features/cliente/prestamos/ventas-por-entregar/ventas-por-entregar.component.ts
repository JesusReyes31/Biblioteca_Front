import { Component } from '@angular/core';
import { UsersService } from '../../../../core/services/users/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetalertService } from '../../../../core/services/sweetalert/sweetalert.service';
import { Router } from '@angular/router';

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
  constructor(private userService: UsersService,private sweetalert:SweetalertService,private router:Router){}
  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.userService.getVentasPorEntregar().subscribe({
      next: (data) => {
        this.ventas = data.data;
        this.ventasFiltradas = data.data;
        console.log(this.ventas);
        if(this.ventas.length == 0){
          this.sweetalert.showNoReload(data.message);
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
}
