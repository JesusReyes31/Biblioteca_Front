import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule,ImageLoadingDirective  ],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  librosCarrito: any[] = [];
  subtotal: number = 0;
  shipping: number = 4;
  total: number = 0;

  constructor(private router: Router, private userService: UsersService) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.userService.getCarrito().subscribe({
      next: (data) => {
        console.log(data);
        this.librosCarrito = data;
        this.calcularSubtotal();
      },
      error: (error) => {
        console.error('Error al cargar el carrito:', error);
      }
    });
  }

  calcularSubtotal() {
    this.subtotal = this.librosCarrito.reduce((total, libro) => {
      return total + (libro.Precio * libro.Cantidad);
    }, 0);
    this.total = this.subtotal + this.shipping;
  }

  actualizarCantidad(libro: any, incrementar: boolean) {
    console.log(libro);
    let nuevaCantidad = libro.Cantidad + (incrementar ? 1 : -1);
    // Validar límites de cantidad
    if (nuevaCantidad < 1 || nuevaCantidad > libro.Cantidad_disponible) {
      return;
    }
    console.log(libro.ID_Libro, nuevaCantidad);
    this.userService.actualizarCantidadCarrito(libro.ID, nuevaCantidad).subscribe({
      next: (response) => {
        libro.Cantidad = nuevaCantidad;
        this.calcularSubtotal();
        // Notificar al servicio que el carrito ha sido actualizado
        // this.userService.notificarActualizacionCarrito();
      },
      error: (error) => {
        console.error('Error al actualizar cantidad:', error);
      }
    });
  }

  eliminarLibro(libroId: number) {
    // this.userService.eliminarDelCarrito(libroId).subscribe({
    //   next: () => {
    //     this.librosCarrito = this.librosCarrito.filter(libro => libro.ID !== libroId);
    //     this.calcularSubtotal();
    //   },
    //   error: (error) => {
    //     console.error('Error al eliminar libro:', error);
    //   }
    // });
  }

  continuarComprando() {
    this.router.navigate(['/catalogo']);
  }

  pagar() {
    // Enviamos la información del carrito a través del router state
    this.router.navigate(['/pago-carrito'], {
      state: {
        librosCarrito: this.librosCarrito,
        subtotal: this.subtotal,
        shipping: this.shipping,
        total: this.total
      }
    });
  }

  pagarConPaypal() {
    // Implementar lógica de pago con PayPal
  }

  pagarConTarjeta() {
    // Implementar lógica de pago con tarjeta
  }
}
