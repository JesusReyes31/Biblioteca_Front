import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users/users.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  selector: 'app-recibo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recibo.component.html',
  styleUrls: ['./recibo.component.css']
})
export class ReciboComponent implements OnInit {
  pdfUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;
  idVenta: number | null = null;
  returnUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsersService,
    private sanitizer: DomSanitizer,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    this.idVenta = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idVenta) {
      this.cargarPDF();
    } else {
      this.volver();
    }
  }

  cargarPDF() {
    if (!this.idVenta) return;
    
    this.userService.getReciboCompra(this.idVenta).subscribe({
      next: (response: Blob) => {
        this.pdfBlob = response;
        const pdfUrl = URL.createObjectURL(response);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      },
      error: (error:any) => {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el recibo',
          confirmButtonText: 'Aceptar'
        });
        this.volver();
      }
    });
  }

  descargarPDF() {
    if (this.pdfBlob) {
      const url = window.URL.createObjectURL(this.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_${this.idVenta}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  volver() {
    this.location.back();
  }
}
