import { Component } from '@angular/core';
import { UsersService } from '../../../../core/services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetalertService } from '../../../../core/services/sweetalert.service';

interface Venta {
  id: number;
  nombreCliente: string;
  cantidadLibros: number;
  fechaCompra: Date;
  entregado: boolean;
}

@Component({
  selector: 'app-ventas-por-entregar',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './ventas-por-entregar.component.html',
  styleUrl: './ventas-por-entregar.component.css'
})
export class VentasPorEntregarComponent {
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  searchTerm: string = '';
  constructor(private userService: UsersService,private sweetalert:SweetalertService){}
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
      venta.nombreCliente.toLowerCase().includes(term)
    );
  }
  generarRecibo(ventaId: number): void {
    console.log(ventaId)
  }
}
