import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UsersService } from '../../../core/services/users/users.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-factura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factura.component.html',
  styleUrl: './factura.component.css'
})
export class FacturaComponent implements OnInit {
  pdfUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  idVenta: number | null = null;
  returnUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersService,
    private sanitizer: DomSanitizer,
    private location: Location,
    private toastr: ToastrService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.pdfUrl = null;
    this.pdfBlob = null;

    this.route.params.subscribe(params => {
      const newIdVenta = Number(params['id']);
      if (newIdVenta && newIdVenta !== this.idVenta) {
        this.idVenta = newIdVenta;
        this.cargarPDF();
      } else if (!newIdVenta) {
        this.volver();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  cargarPDF() {
    if (!this.idVenta) return;
    
    this.userService.generarFactura(this.idVenta).subscribe({
      next: (response: Blob) => {
        this.pdfBlob = new Blob([response], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(this.pdfBlob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      },
      error: (error:any) => {
        this.toastr.error('No se pudo cargar la factura','',{toastClass:'custom-toast'});
        this.volver();
      }
    });
  }

  descargarPDF() {
    if (this.pdfBlob) {
      const url = window.URL.createObjectURL(this.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Factura${this.idVenta}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  volver() {
    this.location.back();
  }

  enviarPorCorreo() {
    if (!this.idVenta) return;

    Swal.fire({
      title: 'Enviando factura...',
      didOpen: () => {
        Swal.showLoading();
        if (this.idVenta) {
          this.userService.enviarFacturaPorCorreo(this.idVenta.toString()).subscribe({
            next: () => {
              this.toastr.success('La factura ha sido enviada a tu correo electrónico','',{toastClass:'custom-toast'});
            },
            error: (error) => {
              this.toastr.error('No se pudo enviar la factura por correo','',{toastClass:'custom-toast'});
            }
          });
        }
      }
    });
  }
}
