import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users/users.service';
import { ReporteComponent } from '../../../../shared/components/reporte/reporte.component';

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
  constructor(private reportesService: UsersService) {}
  generarReporte() {
    this.reportesService.generarReporte(this.reporteSeleccionado, this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (response: ArrayBuffer) => {
          this.pdfData = response;
          console.log('Reporte generado con éxito');
        },
        error: (error) => {
          console.error('Error al generar el reporte:', error);
        }
      });
  }
}
