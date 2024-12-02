import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte.component.html',
  styleUrl: './reporte.component.css'
})
export class ReporteComponent implements OnChanges {
  @Input() pdfData: any;
  pdfUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pdfData'] && this.pdfData) {
      // Crear un blob URL para el PDF
      const blob = new Blob([this.pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  ngOnDestroy() {
    // Limpiar el blob URL cuando el componente se destruye
    if (this.pdfUrl) {
      window.URL.revokeObjectURL(this.pdfUrl as string);
    }
  }
}
