import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, ImageLoadingDirective],
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

  actualizarCantidadDirecta(event: any, libro: any) {
    let nuevaCantidad = parseInt(event.target.value);
    
    // Validar que sea un número válido
    if (isNaN(nuevaCantidad)) {
      nuevaCantidad = 1;
      event.target.value = 1;
    }

    // Validar límites
    if (nuevaCantidad < 1) {
      nuevaCantidad = 1;
      event.target.value = 1;
    }
    if (nuevaCantidad > libro.Cantidad_disponible) {
      nuevaCantidad = libro.Cantidad_disponible;
      event.target.value = libro.Cantidad_disponible;
      Swal.fire({
        title: 'Cantidad no disponible',
        text: `Solo hay ${libro.Cantidad_disponible} unidades disponibles`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }

    this.actualizarCantidad(libro, nuevaCantidad);
  }

  actualizarCantidad(libro: any, nuevaCantidad: number) {
    this.userService.actualizarCantidadCarrito(libro.ID, nuevaCantidad).subscribe({
      next: () => {
        libro.Cantidad = nuevaCantidad;
        this.calcularSubtotal();
      },
      error: (error) => {
        console.error('Error al actualizar cantidad:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar la cantidad',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  eliminarLibro(libroId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas eliminar este libro del carrito?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteCarrito(libroId).subscribe({
          next: () => {
            this.librosCarrito = this.librosCarrito.filter(libro => libro.ID_Libro !== libroId);
            this.calcularSubtotal();
            Swal.fire(
              '¡Eliminado!',
              'El libro ha sido eliminado del carrito',
              'success'
            );
          },
          error: (error) => {
            console.error('Error al eliminar libro:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el libro del carrito',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
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

  decrementarCantidad(libro: any) {
    const nuevaCantidad = libro.Cantidad - 1;
    if (nuevaCantidad >= 1) {
      this.actualizarCantidad(libro, nuevaCantidad);
    }
  }

  incrementarCantidad(libro: any) {
    const nuevaCantidad = libro.Cantidad + 1;
    if (nuevaCantidad <= libro.Cantidad_disponible) {
      this.actualizarCantidad(libro, nuevaCantidad);
    } else {
      Swal.fire({
        title: 'Cantidad no disponible',
        text: `Solo hay ${libro.Cantidad_disponible} unidades disponibles`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }
  }
}
