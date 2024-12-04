import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../core/services/users/users.service';
import { SweetalertService } from '../../../../core/services/sweetalert/sweetalert.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pago-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago-sucursal.component.html',
  styleUrls: ['./pago-sucursal.component.css']
})
export class PagoSucursalComponent implements OnInit {
  idVenta: number = 0;
  detalleVenta: any = null;
  venta: any = null;
  pagoForm: FormGroup;
  cambio: number = 0;
  pagar: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersService,
    private sweetalert: SweetalertService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.pagoForm = this.fb.group({
      cantidadRecibida: ['', [Validators.required, Validators.min(0)]],
      codigoPago: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.idVenta = params['id'];
      this.cargarDetalleVenta();
    });
  }

  cargarDetalleVenta() {
    this.userService.getVentasByID(this.idVenta).subscribe({
      next: (data) => {
        this.venta = data;
        this.pagar = this.venta?.Total;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los detalles de la venta','',{toastClass:'custom-toast'});
        this.router.navigate(['/ventas-por-entregar']);
      }
    });
    this.userService.getDetalleVenta(this.idVenta).subscribe({
      next: (data) => {
        this.detalleVenta = data;
      },
      error: (error) => {
        this.toastr.error('Error al cargar los detalles de la venta','',{toastClass:'custom-toast'});
        this.router.navigate(['/ventas-por-entregar']);
      }
    });
  }

  calcularCambio(): number {
    const recibido = this.pagoForm.get('cantidadRecibida')?.value || 0;
    this.cambio = recibido - this.venta?.Total;
    return this.cambio;
  }

  procesarPago() {
    if (this.pagoForm.valid) {
      const cambio = this.calcularCambio();
      if (cambio < 0) {
        this.toastr.info('La cantidad recibida es menor al total','',{toastClass:'custom-toast'});
        return;
      }

      this.userService.eliminarPagoPendiente(this.idVenta,this.pagoForm.get('codigoPago')?.value).subscribe({
        next: () => {
          this.toastr.success('Pago procesado correctamente','',{toastClass:'custom-toast'});
          this.router.navigate(['/ventas-por-entregar']);
        },
        error: (error) => {
          this.toastr.error('Error al eliminar el pago pendiente','',{toastClass:'custom-toast'});
        } 
      });
    }
  }

  volver() {
    this.router.navigate(['/ventas-por-entregar']);
  }
}
