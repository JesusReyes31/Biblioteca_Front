import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import Swal from 'sweetalert2';
import { VentasService } from '../../../services/ventas.service';

@Component({
  selector: 'app-confirmacion-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmacion-pago.component.html',
  styleUrl: './confirmacion-pago.component.css'
})
export class ConfirmacionPagoComponent {
  librosCarrito: any[] = [];
  subtotal: number = 0;
  shipping: number = 0;
  total: number = 0;
  metodoPago: any;

  constructor(
    private router: Router,
    private userService: UsersService,
    private ventasService: VentasService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.librosCarrito = navigation.extras.state['librosCarrito'];
      this.subtotal = navigation.extras.state['subtotal'];
      this.shipping = navigation.extras.state['shipping'];
      this.total = navigation.extras.state['total'];
      this.metodoPago = navigation.extras.state['metodoPago'];
    }
    console.log(this.librosCarrito);
  }

  confirmarPago() {
    if (this.metodoPago.tipo === 'efectivo') {
      this.mostrarPlazoSucursal();
    } else {
      this.pedirCVV();
    }
  }

  mostrarPlazoSucursal() {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 4);

    Swal.fire({
      title: 'Plazo de Pago en Sucursal',
      html: `
        <div class="plazo-info">
          <p>Tienes hasta el <strong>${fechaLimite.toLocaleDateString()}</strong> para realizar tu pago en sucursal.</p>
          <p>Presenta este código en caja:</p>
          <div class="codigo-pago">${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido'
    }).then(() => {
      this.registrarVenta('pendiente');
    });
  }

  pedirCVV() {
    Swal.fire({
      title: 'Ingresa el CVV',
      html: `
        <div class="cvv-form">
          <p>Por favor, ingresa el código de seguridad de tu tarjeta terminada en ${this.metodoPago.numeroMask.slice(-4)}</p>
          <input type="password" 
                 id="cvv" 
                 class="swal2-input" 
                 maxlength="4" 
                 placeholder="CVV"
                 style="width: 100px !important">
        </div>
      `,
      confirmButtonText: 'Confirmar Pago',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const cvv = (document.getElementById('cvv') as HTMLInputElement).value;
        if (!cvv || cvv.length < 3) {
          Swal.showValidationMessage('CVV inválido');
          return false;
        }
        return cvv;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.registrarVenta('completada');
      }
    });
  }

  registrarVenta(estado: string) {
    let cantidad = 0;
    this.librosCarrito.map(libro => cantidad += libro.Cantidad);
    
    const venta = {
      Cantidad: cantidad,
      Total: this.total,
      ID_Metodo_Pago: this.metodoPago.tipo ? null : this.metodoPago.ID_Tarjeta
    }

    this.ventasService.registrarVenta(venta).subscribe({
      next: (response) => {
        //registrar detalles de venta
        this.ventasService.registrarDetalleVenta(response.ID_Venta, this.librosCarrito).subscribe({
          next: () => {
            console.log('Detalle registrado');
            Swal.fire({
              title: '¡Compra Realizada!',
              text: this.metodoPago.tipo ? 
                    'Recuerda que tienes 4 días para realizar tu pago en sucursal' : 
                    'Tu compra se ha procesado correctamente, pasa con el recibo para recoger tus libros',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            }).then(() => {
              this.router.navigate(['/catalogo']); //para que siga buscando y comprando libros
            });
          },
          error: (error) => {
            console.error('Error al registrar detalle de venta:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al procesar tu compra, inténtalo de nuevo más tarde',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            }).then(() => {
              this.router.navigate(['/carrito']);
            });
          }
        });
      },
      error: (error) => {
        console.error('Error al registrar venta:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al procesar tu compra',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/carrito']);
        });
      }
    });
  }
}
