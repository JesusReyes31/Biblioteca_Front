import { Component } from '@angular/core';
import { UsersService } from '../../../core/services/users/users.service';
import { SweetalertService } from '../../../core/services/sweetalert/sweetalert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private fb: FormBuilder, 
    private userService:UsersService,
    private sweetalert:SweetalertService,
    private toastr: ToastrService
  ){
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
          this.toastr.info(data.message,'',{toastClass:'custom-toast'});
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
          this.toastr.info(data.message,'',{toastClass:'custom-toast'});
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
    
    // Primero cargamos las sucursales
    await this.cargarSucursales();
    
    // Establecemos el tipo de usuario primero
    this.userForm.patchValue({
      ID: record.ID,
      Nombre_completo: record.Nombre_completo,
      Correo: record.Correo,
      CURP: record.CURP,
      Nombre_Usuario: record.Nombre_Usuario,
      Tipo_Usuario: record.Tipo_Usuario
    });
    
    // Disparamos el cambio de tipo de usuario y actualizamos las sucursales
    this.onTipoUsuarioChange();
    
    // Después de que todo esté listo, establecemos la sucursal
    setTimeout(() => {
      this.userForm.patchValue({
        Sucursal: record.ID_Sucursal
      });
    }, 0);
    
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
          this.toastr.success('Usuario agregado correctamente','',{toastClass:'custom-toast'});
          this.limpieza();
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Error al agregar usuario','',{toastClass:'custom-toast'});
        }
      });
    } else {
      this.toastr.info('Por favor completa todos los campos requeridos','',{toastClass:'custom-toast'});
    }
  }
  deleteUser(){
    const id = this.userForm.get('ID')?.value || this.selectedUser?.ID;
    if (id) {
      this.userService.deleteUser(id).subscribe(
        () => {
          this.toastr.success('Usuario eliminado correctamente','',{toastClass:'custom-toast'});
          this.limpieza();
        },
        (error) => {
          this.toastr.error(error.error.message,'',{toastClass:'custom-toast'});
        }
      );
    } else {
      this.toastr.info('Por favor ingresa un ID de usuario','',{toastClass:'custom-toast'});
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
          this.toastr.success('Usuario actualizado correctamente','',{toastClass:'custom-toast'});
          this.limpieza();
        },
        (error) => {
          this.toastr.error('Error al actualizar usuario','',{toastClass:'custom-toast'});
        }
      );
    } else {
      this.toastr.info('Por favor completa todos los campos','',{toastClass:'custom-toast'});
    }
  }
  limpieza(){
    this.loadUsers();
    this.cargarSucursales();
    this.filteredRecords = [...this.users];
    this.clearForm();
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
      
      // Actualizar el estado de las sucursales manteniendo la referencia original
      this.sucursales = this.sucursales.map(sucursal => ({
        ...sucursal,
        ID: sucursal.ID,
        Nombre: sucursal.Nombre,
        ID_Usuario: sucursal.ID_Usuario,
        disabled: sucursal.ID_Usuario && sucursal.ID !== this.selectedUser?.ID_Sucursal
      }));
    } else {
      this.userForm.get('Sucursal')?.clearValidators();
      this.userForm.get('Sucursal')?.setValue(null);
    }
    this.userForm.get('Sucursal')?.updateValueAndValidity();
  }

  cargarSucursales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getSucursales().subscribe({
        next: (data) => {
          this.sucursales = data.map((sucursal: any) => ({
            ...sucursal,
            disabled: sucursal.ID_Usuario && sucursal.ID !== this.selectedUser?.ID_Sucursal
          })).sort((a: any, b: any) => {
            if (a.ID_Usuario && !b.ID_Usuario) return 1;
            if (!a.ID_Usuario && b.ID_Usuario) return -1;
            return a.Nombre.localeCompare(b.Nombre);
          });
          resolve();
        },
        error: (error) => {
          this.toastr.error('Error al cargar las sucursales','',{toastClass:'custom-toast'});
          reject(error);
        }
      });
    });
  }
}
