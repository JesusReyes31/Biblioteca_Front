import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users/users.service';
import { ReporteComponent } from '../../../../shared/components/reporte/reporte.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReporteComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {
  fechaInicio: string = '';
  fechaFin: string = '';
  reporteSeleccionado: string = 'inventario';
  pdfData: any = null;

  constructor(
    private reportesService: UsersService,
    private toastr: ToastrService
  ) {}

  generarReporte() {
    // Validación para reportes que no son de inventario
    if (this.reporteSeleccionado !== 'inventario') {
      // Verifica si alguna de las fechas está vacía
      if (!this.fechaInicio || !this.fechaFin) {
        this.toastr.warning('Por favor, seleccione ambas fechas para generar el reporte', '', {
          toastClass: 'custom-toast'
        });
        return;
      }

      // Validación adicional: fecha inicio no puede ser mayor a fecha fin
      if (new Date(this.fechaInicio) > new Date(this.fechaFin)) {
        this.toastr.error('La fecha de inicio no puede ser posterior a la fecha fin', '', {
          toastClass: 'custom-toast'
        });
        return;
      }
    }

    // Si pasa las validaciones, genera el reporte
    this.reportesService.generarReporte(this.reporteSeleccionado, this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (response: ArrayBuffer) => {
          this.pdfData = response;
        },
        error: (error) => {
          console.error('Error al generar el reporte:', error);
          this.toastr.error('Error al generar el reporte', '', {
            toastClass: 'custom-toast'
          });
        }
      });
  }
}
