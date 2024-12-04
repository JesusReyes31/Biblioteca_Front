import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users/users.service';
import Swal from 'sweetalert2';
import { VentasService } from '../../../services/ventas/ventas.service';
import html2canvas from 'html2canvas';
import { ImageLoadingDirective } from '../../../../shared/directives/image-loading.directive';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-confirmacion-pago',
  standalone: true,
  imports: [CommonModule,ImageLoadingDirective],
  templateUrl: './confirmacion-pago.component.html',
  styleUrl: './confirmacion-pago.component.css'
})
export class ConfirmacionPagoComponent {
  librosCarrito: any[] = [];
  subtotal: number = 0;
  shipping: number = 0;
  total: number = 0;
  metodoPago: any;
  codigoPago: string = '';
  constructor(
    private router: Router,
    private userService: UsersService,
    private ventasService: VentasService,
    private toastr: ToastrService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.librosCarrito = navigation.extras.state['librosCarrito'];
      this.subtotal = navigation.extras.state['subtotal'];
      this.shipping = navigation.extras.state['shipping'];
      this.total = navigation.extras.state['total'];
      this.metodoPago = navigation.extras.state['metodoPago'];
    }else{
      this.toastr.error('No se encontraron datos del carrito','',{toastClass:'custom-toast'});
      window.location.href = '/carrito';
    }
  }
  ngOnInit(): void {
    this.librosCarrito = sessionStorage.getItem('librosCarrito') ? JSON.parse(sessionStorage.getItem('librosCarrito')!) : [];
    this.subtotal = parseFloat(sessionStorage.getItem('subtotal') || '0');
    this.shipping = parseFloat(sessionStorage.getItem('shipping') || '4');
    this.total = parseFloat(sessionStorage.getItem('total') || '0');
    this.metodoPago = sessionStorage.getItem('metodoPago') ? JSON.parse(sessionStorage.getItem('metodoPago')!) : null;
    sessionStorage.clear();
  }
  @HostListener('window:beforeunload')
  antesRecargar():void{
    sessionStorage.setItem('librosCarrito', JSON.stringify(this.librosCarrito));
    sessionStorage.setItem('subtotal', this.subtotal.toString());
    sessionStorage.setItem('shipping', this.shipping.toString());
    sessionStorage.setItem('total', this.total.toString());
    sessionStorage.setItem('metodoPago', JSON.stringify(this.metodoPago));
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
    this.codigoPago = Math.random().toString(36).substr(2, 9).toUpperCase();

    Swal.fire({
      title: 'Plazo de Pago en Sucursal',
      html: `
        <div class="plazo-info">
          <p>Tienes hasta el <strong>${fechaLimite.toLocaleDateString()}</strong> para realizar tu pago en sucursal.</p>
          <p>Presenta este código en caja:</p>
          <div id="codigo-container" class="codigo-pago">${this.codigoPago}</div>
          <div class="botones-descarga" style="margin-top: 20px;">
            <button onclick="window.descargarImagen()" class="swal2-confirm swal2-styled">Descargar Imagen</button>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        (window as any).descargarImagen = () => this.descargarImagen();
      }
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
        if (this.metodoPago.tipo === 'efectivo') {
          const pagoPendiente = {
            Codigo: this.codigoPago,
            ID_Venta: response.ID_Venta
          };
          
          this.ventasService.registrarPagoPendiente(pagoPendiente).subscribe({
            error: (error:any) => console.error('Error al registrar pago pendiente:', error)
          });
        }
        this.ventasService.registrarDetalleVenta(response.ID_Venta, this.librosCarrito).subscribe({
          next: () => {
            this.userService.deleteAllCarrito().subscribe({
              next: () => {
                Swal.fire({
                  title: '¡Compra Realizada!',
                  text: this.metodoPago.tipo ? 
                        'Recuerda que tienes 4 días para realizar tu pago en sucursal' : 
                        'Tu compra se ha procesado correctamente, pasa con el recibo para recoger tus libros',
                  icon: 'success',
                  confirmButtonText: 'Aceptar'
                }).then(() => {
                  this.router.navigate(['/catalogo']);
                });
              },
              error: (error) => {
                console.error('Error al eliminar el carrito:', error);
                Swal.fire({
                  title: '¡Compra Realizada!',
                  text: this.metodoPago.tipo ? 
                        'Recuerda que tienes 4 días para realizar tu pago en sucursal' : 
                        'Tu compra se ha procesado correctamente, pasa con el recibo para recoger tus libros',
                  icon: 'success',
                  confirmButtonText: 'Aceptar'
                }).then(() => {
                  this.router.navigate(['/catalogo']);
                });
              }
            });
          },
          error: (error) => {
            console.error('Error al registrar detalle de venta:', error);
            this.toastr.error('Hubo un problema al procesar tu compra, inténtalo de nuevo más tarde','',{toastClass:'custom-toast'});
            this.router.navigate(['/carrito']);
          }
        });
      },
      error: (error) => {
        this.toastr.error('Hubo un problema al procesar tu compra','',{toastClass:'custom-toast'});
        this.router.navigate(['/carrito']);
      }
    });
  }

  descargarImagen() {
    // Crear un contenedor temporal
    const contenedorTemp = document.createElement('div');
    contenedorTemp.style.padding = '20px';
    contenedorTemp.style.backgroundColor = 'white';
    contenedorTemp.style.width = '400px';
    contenedorTemp.style.textAlign = 'center';
    
    // Agregar el mensaje
    const mensaje = document.createElement('p');
    mensaje.style.marginBottom = '15px';
    mensaje.style.fontSize = '14px';
    mensaje.style.color = '#333';
    mensaje.innerText = 'Presente este código en caja para realizar el pago y recoger sus libros';
    contenedorTemp.appendChild(mensaje);
    
    // Agregar el código
    const codigoElement = document.createElement('div');
    codigoElement.style.fontSize = '28px';
    codigoElement.style.fontWeight = 'bold';
    codigoElement.style.padding = '15px';
    codigoElement.style.backgroundColor = '#f8f9fa';
    codigoElement.style.border = '2px solid #dee2e6';
    codigoElement.style.borderRadius = '8px';
    codigoElement.style.marginTop = '10px';
    codigoElement.innerText = this.codigoPago;
    contenedorTemp.appendChild(codigoElement);
    
    // Agregar temporalmente al DOM
    document.body.appendChild(contenedorTemp);
    
    // Convertir a imagen y descargar
    html2canvas(contenedorTemp).then(canvas => {
      const link = document.createElement('a');
      link.download = 'codigo-pago.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Eliminar el contenedor temporal
      document.body.removeChild(contenedorTemp);
    });
  }
  volver(){
    this.router.navigate(['/pago-carrito'], {
      state: {
        librosCarrito: this.librosCarrito,
        subtotal: this.subtotal,
        shipping: this.shipping,
        total: this.total,
        metodoPago: this.metodoPago
      }
    });
  }
}
