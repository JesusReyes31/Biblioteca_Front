import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users/users.service';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  sucursales: any[] = [];
  filteredRecords: any[] = [];
  searchTerm: string = '';
  sucursalForm: FormGroup;
  selectedSucursal: any = null;
  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;
  paginatedRecords: any[] = [];
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private userService: UsersService,
    private sweetalert: SweetalertService
  ) {
    this.sucursalForm = this.fb.group({
      ID: [''],
      Nombre: ['', Validators.required],
      Estado: ['', Validators.required],
      Municipio: ['', Validators.required],
      Colonia: ['', Validators.required],
      Calle: ['', Validators.required],
      CP: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      Tel_Contacto: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      ID_Usuario: [null]
    });
    this.loadSucursales();
  }

  loadSucursales() {
    this.userService.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.filteredRecords = [...this.sucursales];
        this.updatePaginatedRecords();
      },
      error: (error) => {
        console.error('Error al cargar sucursales:', error);
        this.sweetalert.showNoReload('Error al cargar las sucursales');
      }
    });
  }

  selectRow(record: any): void {
    this.isEditMode = true;
    this.selectedSucursal = record;
    this.sucursalForm.patchValue({
      ID: record.ID,
      Nombre: record.Nombre,
      Estado: record.Estado,
      Municipio: record.Municipio,
      Colonia: record.Colonia,
      Calle: record.Calle,
      CP: record.CP,
      Tel_Contacto: record.Tel_Contacto,
      ID_Usuario: record.ID_Usuario
    });
  }

  addSucursal(): void {
    if (this.sucursalForm.valid && !this.isEditMode) {
      const sucursalData = {
        Nombre: this.sucursalForm.get('Nombre')?.value,
        Estado: this.sucursalForm.get('Estado')?.value,
        Municipio: this.sucursalForm.get('Municipio')?.value,
        Colonia: this.sucursalForm.get('Colonia')?.value,
        Calle: this.sucursalForm.get('Calle')?.value,
        CP: this.sucursalForm.get('CP')?.value,
        Tel_Contacto: this.sucursalForm.get('Tel_Contacto')?.value,
        ID_Usuario: this.sucursalForm.get('ID_Usuario')?.value
      };

      this.userService.addSucursal(sucursalData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Sucursal agregada correctamente',
            confirmButtonText: 'Aceptar'
          });
          this.loadSucursales();
          this.clearForm();
        },
        error: (error) => {
          console.error('Error al agregar sucursal:', error);
          this.sweetalert.showNoReload(error || 'Error al agregar la sucursal');
        }
      });
    } else {
      this.sweetalert.showNoReload('Por favor complete todos los campos requeridos');
    }
  }

  updateSucursal(): void {
    if (this.selectedSucursal && this.sucursalForm.valid) {
      const sucursalData = {
        ...this.sucursalForm.value,
        ID_Usuario: parseInt(this.sucursalForm.get('ID_Usuario')?.value)
      };
      this.userService.updateSucursal(this.selectedSucursal.ID, sucursalData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Sucursal actualizada correctamente',
            confirmButtonText: 'Aceptar'
          });
          this.loadSucursales();
          this.clearForm();
        },
        error: (error) => {
          console.error('Error al actualizar sucursal:', error);
          this.sweetalert.showNoReload(error || 'Error al actualizar la sucursal');
        }
      });
    }
  }

  deleteSucursal(): void {
    if (this.selectedSucursal) {
      this.userService.deleteSucursal(this.selectedSucursal.ID).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Sucursal eliminada correctamente',
            confirmButtonText: 'Aceptar'
          });
          this.loadSucursales();
          this.clearForm();
        },
        error: (error) => {
          console.error('Error al eliminar sucursal:', error);
          this.sweetalert.showNoReload(error || 'Error al eliminar la sucursal');
        }
      });
    }
  }

  clearForm(): void {
    this.sucursalForm.reset();
    this.selectedSucursal = null;
    this.isEditMode = false;
    Object.keys(this.sucursalForm.controls).forEach(key => {
      const control = this.sucursalForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }

  filterRecords(): void {
    if (!this.searchTerm) {
      this.filteredRecords = [...this.sucursales];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRecords = this.sucursales.filter(sucursal => 
        sucursal.Nombre.toLowerCase().includes(term) ||
        sucursal.Estado.toLowerCase().includes(term) ||
        sucursal.Municipio.toLowerCase().includes(term) ||
        sucursal.Colonia.toLowerCase().includes(term) ||
        sucursal.Calle.toLowerCase().includes(term) ||
        sucursal.CP.toString().includes(term) ||
        sucursal.Tel_Contacto.includes(term)
      );
    }
    this.currentPage = 0;
    this.updatePaginatedRecords();
  }

  updatePaginatedRecords(): void {
    this.totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
    this.startIndex = this.currentPage * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredRecords.length);
    this.paginatedRecords = this.filteredRecords.slice(this.startIndex, this.endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRecords();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.updatePaginatedRecords();
  }

  getPages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i);
  }

  get canDelete(): boolean {
    return !!this.sucursalForm.get('ID')?.value;
  }

  get canRegister(): boolean {
    return this.sucursalForm.valid && 
           !this.isEditMode && 
           !this.sucursalForm.get('ID')?.value;
  }

  get canModify(): boolean {
    return this.sucursalForm.valid && this.isEditMode;
  }

  get canClear(): boolean {
    return !this.sucursalForm.pristine || this.isEditMode;
  }
}
