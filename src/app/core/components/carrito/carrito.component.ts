import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users/users.service';
import { CommonModule } from '@angular/common';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { DatosService } from '../../services/users/datos.service';
import { ToastrService } from 'ngx-toastr';

interface LibrosPorSucursal {
  sucursal: string;
  libros: any[];
  subtotal: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, ImageLoadingDirective],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  librosCarrito: any[] = [];
  librosPorSucursal: LibrosPorSucursal[] = [];
  subtotal: number = 0;
  shipping: number = 4;
  total: number = 0;

  constructor(private router: Router, 
    private userService: UsersService,
    private datos:DatosService,
    private toastr: ToastrService
  ) {
    this.subscription = this.userService.carritoActualizado.subscribe(() => {
      this.cargarCarrito();
    });
  }

  ngOnInit() {
    this.cargarCarrito();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarCarrito() {
    this.userService.getCarrito().subscribe({
      next: (data) => {
        this.librosCarrito = data;
        this.agruparPorSucursal();
        this.calcularSubtotal();
      },
      error: (error) => {
        this.toastr.error('No se pudo cargar el carrito','',{toastClass:'custom-toast'});
      }
    });
  }

  agruparPorSucursal() {
    const grupos = this.librosCarrito.reduce((acc: { [key: string]: any[] }, libro) => {
      if (!acc[libro.Sucursal]) {
        acc[libro.Sucursal] = [];
      }
      acc[libro.Sucursal].push(libro);
      return acc;
    }, {});

    this.librosPorSucursal = Object.entries(grupos).map(([sucursal, libros]) => ({
      sucursal,
      libros,
      subtotal: libros.reduce((total, libro) => total + (libro.Precio * libro.Cantidad), 0)
    }));
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
      this.toastr.warning(`Solo hay ${libro.Cantidad_disponible} unidades disponibles`, 'Cantidad no disponible', { toastClass: 'custom-toast' });
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
        this.toastr.error('No se pudo actualizar la cantidad','',{toastClass:'custom-toast'});
      }
    });
  }

  eliminarLibro(Id: string) {
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
        const idUsuario = this.datos.getID_Uss();
        if (!idUsuario) {
          this.toastr.error('Usuario no identificado','',{toastClass:'custom-toast'});
          return;
        }

        this.userService.deleteCarrito(Id).subscribe({
          next: () => {
            this.toastr.success('El libro ha sido eliminado del carrito','',{toastClass:'custom-toast'});
            this.cargarCarrito(); // Recargar el carrito
            this.userService.notificarActualizacionCarrito(); // Actualizar contador en header
          },
          error: (error) => {
            this.toastr.error(error.error?.message || 'No se pudo eliminar el libro del carrito','',{toastClass:'custom-toast'});
          }
        });
      }
    });
  }

  continuarComprando() {
    this.router.navigate(['/catalogo']);
  }

  pagar() {
    sessionStorage.setItem('librosCarrito', JSON.stringify(this.librosCarrito));
    sessionStorage.setItem('subtotal', this.subtotal.toString());
    sessionStorage.setItem('shipping', this.shipping.toString());
    sessionStorage.setItem('total', this.total.toString());
    // Enviamos la información del carrito a través del router state
    this.router.navigate(['/pago-carrito']);
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
      this.toastr.warning(`Solo hay ${libro.Cantidad_disponible} unidades disponibles`, 'Cantidad no disponible', { toastClass: 'custom-toast' });
    }
  }
}
