import { Component } from '@angular/core';
import { UsersService } from '../../../../core/services/users/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterService } from '../../../../core/services/footer/footer.service';

@Component({
  selector: 'app-prestamos-generales',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './prestamos-generales.component.html',
  styleUrl: './prestamos-generales.component.css'
})
export class PrestamosGeneralesComponent {
  prestamos: any[] = [];
  filteredPrestamos: any[] = [];
  searchTerm: string = '';
  
  // Paginación
  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;
  paginatedPrestamos: any[] = [];
  
  constructor(private usersService: UsersService,private footerService: FooterService) {}

  ngOnInit() {
    this.loadPrestamos();
  }

  loadPrestamos() {
    this.usersService.getPrestamos().subscribe({
      next: (data) => {
        this.prestamos = data;
        this.filteredPrestamos = [...this.prestamos];
        this.updatePaginatedRecords();
        this.footerService.adjustFooterPosition();
      },
      error: (error) => console.error('Error:', error)
    });
  }

  filterPrestamos() {
    if (!this.searchTerm) {
      this.filteredPrestamos = [...this.prestamos];
    } else {
      this.filteredPrestamos = this.prestamos.filter(prestamo =>
        prestamo.ID_Usuario.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prestamo.ID_Libro.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prestamo.Titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prestamo.Fecha_prestamo.includes(this.searchTerm) ||
        prestamo.Fecha_devolucion_prevista.includes(this.searchTerm) ||
        prestamo.Estado.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prestamo.Nombre_Usuario.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.currentPage = 0;
    this.updatePaginatedRecords();
    this.footerService.adjustFooterPosition();
  }

  updatePaginatedRecords() {
    this.startIndex = this.currentPage * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredPrestamos.length);
    this.paginatedPrestamos = this.filteredPrestamos.slice(this.startIndex, this.endIndex);
    this.footerService.adjustFooterPosition();
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredPrestamos.length / this.pageSize);
    this.totalPages = totalPages;
    
    let pages: number[] = [];
    if (totalPages <= 5) {
      pages = Array(totalPages).fill(0).map((_, i) => i);
    } else {
      if (this.currentPage <= 2) {
        pages = [0, 1, 2, 3, 4];
      } else if (this.currentPage >= totalPages - 3) {
        pages = Array(5).fill(0).map((_, i) => totalPages - 5 + i);
      } else {
        pages = Array(5).fill(0).map((_, i) => this.currentPage - 2 + i);
      }
    }
    return pages;
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRecords();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.updatePaginatedRecords();
  }
}
