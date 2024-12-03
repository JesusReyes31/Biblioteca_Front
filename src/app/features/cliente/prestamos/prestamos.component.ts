import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './prestamos.component.html',
  styleUrl: './prestamos.component.css'
})
export class PrestamosComponent {
  typeusers: any[] = [];
  users: any[] = [];
  filteredRecords: any[] = [];
  usuarios: any[] = [];
  searchTerm: string = '';
  userForm: FormGroup;
  selectedUser: any = {};
  pageSize = 10;
  currentPage = 0;
  totalPages = 0;
  startIndex = 0;
  endIndex = 0;
  paginatedRecords: any[] = [];
  isEditMode: boolean = false;
  mostrarSelectSucursal: boolean = false;
  sucursales: any[] = [];
  tiposUsuarioConSucursal: string[] = ['Admin Sucursal'];

  constructor(private fb: FormBuilder, private userService:UsersService,private sweetalert:SweetalertService){
    this.userForm = this.fb.group({
      ID: [{value: '', disabled: false}],
      Nombre_completo: ['', Validators.required],
      Contra: ['', Validators.required],
      Correo: ['', [Validators.required, Validators.email]],
      CURP: ['', Validators.required],
      Nombre_Usuario: ['', Validators.required],
      Tipo_Usuario: ['', Validators.required],
      Sucursal: ['']
    });

    this.cargarSucursales();
  }
  ngOnInit(): void {
    this.userService.getTipoUsuarios().subscribe(
      (data)=>{
        if (data.message) {
          this.sweetalert.showNoReload(data.message);
        } else {
          this.typeusers = [];
          data.forEach((user: any) => {
            this.typeusers.push(user.Tipo_Usuario);
          });
        }
      }
    )
    this.loadUsers();
  }
  loadUsers(){
    this.userService.getUsuarios().subscribe(
      (data)=>{
        if (data.message) {
          this.sweetalert.showNoReload(data.message);
        } else {
          this.users = data;
          this.filteredRecords = [...this.users];
          this.updatePaginatedRecords();
        }
      }
    )
  }
  filterRecords() {
    if (!this.searchTerm) {
      this.filteredRecords = [...this.users];
    } else {
      this.filteredRecords = this.users.filter((record) => {
        return (
          (record.ID && record.ID.toString().toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Nombre_completo && record.Nombre_completo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Correo && record.Correo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.CURP && record.CURP.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (record.Nombre_Usuario && record.Nombre_Usuario.toLowerCase().includes(this.searchTerm.toLowerCase())) || // Corregido
          (record.Tipo_Usuario && record.Tipo_Usuario.toString().toLowerCase().includes(this.searchTerm.toLowerCase()))
        );
      });
    }
    this.currentPage = 0;
    this.updatePaginatedRecords();
  }
  
  updatePaginatedRecords() {
    this.startIndex = this.currentPage * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredRecords.length);
    this.paginatedRecords = this.filteredRecords.slice(this.startIndex, this.endIndex);
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
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

  //Método para seleccionar un registro
  async selectRow(record: any): Promise<void> {
    this.isEditMode = true;
    this.selectedUser = record;
    
    // Primero establecemos el tipo de usuario para que se active el selector de sucursal si es necesario
    this.userForm.patchValue({
      Tipo_Usuario: record.Tipo_Usuario
    });
    
    // Esto disparará onTipoUsuarioChange
    this.onTipoUsuarioChange();
    
    // Una vez que tenemos todos los datos, actualizamos el formulario
    this.userForm.patchValue({
      ID: record.ID,
      Nombre_completo: record.Nombre_completo,
      Correo: record.Correo,
      CURP: record.CURP,
      Nombre_Usuario: record.Nombre_Usuario,
      Tipo_Usuario: record.Tipo_Usuario,
      Sucursal: record.ID_Sucursal // Agregar el ID de la sucursal si existe
    });
    
    // Deshabilitar el campo de contraseña en modo edición
    this.userForm.get('Contra')?.disable();
  }

  addUser() {
    if (this.isFormValidForRegister()) {
      const userData = {
        Nombre_completo: this.userForm.get('Nombre_completo')?.value,
        Contra: this.userForm.get('Contra')?.value,
        Correo: this.userForm.get('Correo')?.value,
        CURP: this.userForm.get('CURP')?.value,
        Nombre_Usuario: this.userForm.get('Nombre_Usuario')?.value,
        Tipo_Usuario: this.userForm.get('Tipo_Usuario')?.value,
        ID_Sucursal: this.userForm.get('Tipo_Usuario')?.value === 'Admin Sucursal' ? 
                     this.userForm.get('Sucursal')?.value : null
      };

      this.userService.addUser(userData).subscribe({
        next: (response) => {
          this.sweetalert.showReload('Usuario agregado correctamente');
          this.loadUsers();
          this.users.push(response);
          this.filteredRecords = [...this.users];
          this.clearForm();
        },
        error: (error) => {
          this.sweetalert.showNoReload(error.error?.message || 'Error al agregar usuario');
        }
      });
    } else {
      this.sweetalert.showNoReload('Por favor completa todos los campos requeridos');
    }
  }
  deleteUser(){
    const id = this.userForm.get('ID')?.value || this.selectedUser?.ID;
    if (id) {
      this.userService.deleteUser(id).subscribe(
        () => {
          this.sweetalert.showReload('Usuario eliminado correctamente')
        },
        (error) => {
          this.sweetalert.showNoReload(error.error.message);
        }
      );
    } else {
      this.sweetalert.showNoReload('Por favor ingresa un ID de usuario');
    }
  }
  updateUser() {
    const id = this.userForm.get('ID')?.value || this.selectedUser?.ID;
    if (id && this.userForm.valid) {
      const userData = {
        ...this.userForm.value,
        ID_Sucursal: this.userForm.get('Tipo_Usuario')?.value === 'Admin Sucursal' ? 
                     this.userForm.get('Sucursal')?.value : null
      };

      this.userService.updateUser(id, userData).subscribe(
        (response) => {
          this.sweetalert.showReload('Usuario actualizado correctamente');
        },
        (error) => {
          this.sweetalert.showNoReload('Error al actualizar usuario');
        }
      );
    } else {
      this.sweetalert.showNoReload('Por favor completa todos los campos');
    }
  }
  clearForm() {
    this.userForm.reset();
    this.userForm.get('Tipo_Usuario')?.setValue('');
    this.userForm.get('Sucursal')?.setValue('');
    this.selectedUser = {};
    this.isEditMode = false;
    this.mostrarSelectSucursal = false;
    
    // Habilitar nuevamente el campo de contraseña
    this.userForm.get('Contra')?.enable();
  }

  // Nuevo método para validar el formulario para registro
  isFormValidForRegister(): boolean {
    const basicFieldsValid = this.userForm.get('Nombre_completo')?.valid &&
           this.userForm.get('Contra')?.valid &&
           this.userForm.get('Correo')?.valid &&
           this.userForm.get('CURP')?.valid &&
           this.userForm.get('Nombre_Usuario')?.valid &&
           this.userForm.get('Tipo_Usuario')?.valid;

    if (!basicFieldsValid) return false;

    if (this.mostrarSelectSucursal) {
      return this.userForm.get('Sucursal')?.valid || false;
    }

    return true;
  }

  onTipoUsuarioChange() {
    const tipoUsuario = this.userForm.get('Tipo_Usuario')?.value;
    this.mostrarSelectSucursal = tipoUsuario === 'Admin Sucursal';
    
    if (this.mostrarSelectSucursal) {
      this.userForm.get('Sucursal')?.setValidators([Validators.required]);
    } else {
      this.userForm.get('Sucursal')?.clearValidators();
      this.userForm.get('Sucursal')?.setValue(null);
    }
    this.userForm.get('Sucursal')?.updateValueAndValidity();
  }

  cargarSucursales() {
    this.userService.getSucursales().subscribe(
      (data) => {
        this.sucursales = data;
      },
      (error) => {
        this.sweetalert.showNoReload('Error al cargar las sucursales');
      }
    );
  }
}
