import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pago-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago-carrito.component.html',
  styleUrl: './pago-carrito.component.css'
})
export class PagoCarritoComponent {
  librosCarrito: any[] = [];
  subtotal: number = 0;
  shipping: number = 0;
  total: number = 0;
  tarjetasGuardadas: any[] = [];
  metodoPagoSeleccionado: any;

  constructor(
    private router: Router,
    private userService: UsersService
  ) {
    // Recuperar datos del carrito
    const navigation = this.router.getCurrentNavigation();
    console.log(navigation?.extras.state);
    if (navigation?.extras.state) {
      this.librosCarrito = navigation.extras.state['librosCarrito'];
      this.subtotal = navigation.extras.state['subtotal'];
      this.shipping = navigation.extras.state['shipping'];
      this.total = navigation.extras.state['total'];
    }
  }

  ngOnInit() {
    this.cargarTarjetas();
  }

  cargarTarjetas() {
    this.tarjetasGuardadas = [];
    this.userService.getTarjetas().subscribe({
      next: (tarjetas:any) => {
        tarjetas.forEach((tarjeta:any) => {
          this.tarjetasGuardadas.push({
            ID_Tarjeta: tarjeta.ID,
            Nombre_Titular: tarjeta.Nombre_Titular,
            Fecha_Vencimiento: tarjeta.Fecha_Vencimiento,
            Tipo_Tarjeta: tarjeta.Tipo_Tarjeta,
            Activa: tarjeta.Activa,
            Numero_Tarjeta: tarjeta.Numero_Tarjeta,
            numeroMask: tarjeta.Numero_Tarjeta.slice(-4).padStart(tarjeta.Numero_Tarjeta.length, '*'),
          });
        });
      },
      error: (error) => {
        console.error('Error al cargar tarjetas:', error);
      }
    });
  }

  seleccionarMetodoPago(tipo: string, id?: number) {
    let radioId: string;
    
    // Determinar qué radio button seleccionar basado en el tipo
    switch(tipo) {
      case 'tarjeta':
        radioId = 'tarjeta-' + this.tarjetasGuardadas.find(t => t.ID_Tarjeta === id)?.numeroMask;
        this.metodoPagoSeleccionado = this.tarjetasGuardadas.find(t => t.ID_Tarjeta === id);
        break;
      case 'nueva-debito':
        radioId = 'nueva-debito';
        this.metodoPagoSeleccionado = { tipo:'nueva-debito' };
        break;
      case 'efectivo':
        radioId = 'efectivo';
        this.metodoPagoSeleccionado = { tipo: 'efectivo' };
        break;
      default:
        return;
    }

    // Seleccionar el radio button
    const radioButton = document.getElementById(radioId) as HTMLInputElement;
    if (radioButton) {
      radioButton.checked = true;
    }
  }

  agregarTarjeta() {
    const fechaActual = new Date();
    const fechaMaxima = new Date(fechaActual.getFullYear() + 15, fechaActual.getMonth());

    Swal.fire({
      title: 'Agregar Tarjeta',
      html: `
        <div class="tarjeta-form">
          <div class="form-group">
            <label for="numero">Número de Tarjeta</label>
            <input type="text" 
                   id="numero" 
                   class="swal2-input" 
                   placeholder="**** **** **** ****"
                   maxlength="16">
          </div>
          <div class="form-group">
            <label for="titular">Titular</label>
            <input type="text" 
                   id="titular" 
                   class="swal2-input" 
                   placeholder="Nombre del titular"
                   style="text-transform: uppercase;">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="vencimiento">Fecha de Vencimiento</label>
              <input type="month" 
                     id="vencimiento" 
                     class="swal2-input" 
                     min="${fechaActual.toISOString().slice(0, 7)}"
                     max="${fechaMaxima.toISOString().slice(0, 7)}">
            </div>
            <div class="form-group">
              <label for="tipo">Tipo de Tarjeta</label>
              <select id="tipo" class="swal2-input">
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'tarjeta-modal',
        popup: 'tarjeta-popup',
        title: 'tarjeta-title',
        confirmButton: 'tarjeta-confirm-btn',
        cancelButton: 'tarjeta-cancel-btn'
      },
      preConfirm: () => {
        const numero = (document.getElementById('numero') as HTMLInputElement).value;
        const titular = (document.getElementById('titular') as HTMLInputElement).value;
        const vencimiento = (document.getElementById('vencimiento') as HTMLInputElement).value;
        const tipo = (document.getElementById('tipo') as HTMLSelectElement).value;

        if (!numero || !titular || !vencimiento || !tipo) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }

        return { 
          Numero_Tarjeta: numero,
          Nombre_Titular: titular,
          Fecha_Vencimiento: vencimiento,
          Tipo_Tarjeta: tipo,
          Activa: true
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.agregarTarjeta(result.value).subscribe({
          next: () => {
            this.cargarTarjetas();
          }
        });
      }
    });
  }

  confirmarPago() {
    if (!this.metodoPagoSeleccionado) {
      Swal.fire({
        title: 'Método de pago requerido',
        text: 'Por favor selecciona un método de pago para continuar',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    // Si hay método de pago seleccionado, continuamos con la navegación
    this.router.navigate(['/confirmacion-pago'], {
      state: {
        librosCarrito: this.librosCarrito,
        subtotal: this.subtotal,
        shipping: this.shipping,
        total: this.total,
        metodoPago: this.metodoPagoSeleccionado
      }
    });
  }
}
