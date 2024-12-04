import { Component } from '@angular/core';
import { UsersService } from '../../services/users/users.service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SweetalertService } from '../../services/sweetalert/sweetalert.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';
import { DatosService } from '../../services/users/datos.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-cambiar-informacion',
  standalone: true,
  imports: [FormsModule,CommonModule,ImageLoadingDirective],
  templateUrl: './cambiar-informacion.component.html',
  styleUrl: './cambiar-informacion.component.css'
})
export class CambiarInformacionComponent {
  userData: any = {};
  selectedFile: File | null = null;
  sucursalInfo: any = null;
  userTypes = ['Admin', 'Sucursal', 'Prestamos', 'Inventario'];
  newPasswordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  constructor(private userService:UsersService,
    private fb:FormBuilder,
    private sweetalert:SweetalertService,
    private datos:DatosService,
    private toastr:ToastrService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (data) => {
        this.userData = data;
        if(this.userData.Imagen!==null){
          this.datos.setData({Imagen:this.userData.Imagen})
        }
        // Si el usuario es de alguno de los tipos especificados, obtener info de sucursal
        if (this.userData.Tipo_Usuario==='Admin Sucursal') {
          this.getSucursalInfo();
        }
      },
      error: (error) => {
        console.error('Error al obtener información del usuario:', error);
      }
    });
  }

  //Obtener la sucursal del usuario
  getSucursalInfo(): void {
    this.userService.getSucursal().subscribe({
      next: (data) => {
        this.sucursalInfo = data[0];
      },
      error: (error) => {
        console.error('Error al obtener información de la sucursal:', error);
      }
    });
  }
  
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Guardamos la URL base64 en ImagenURL para que el `src` de la imagen la utilice
        this.selectedFile = e.target.result;
        this.userData.Imagen = e.target.result
      };
      reader.readAsDataURL(this.selectedFile); // Convierte el archivo a Base64
    }
  }

  uploadImage(): void {
    if (this.selectedFile) {
      const formData = this.fb.group({
        Imagen: this.selectedFile,
        Nombre_Usuario: this.userData.Nombre_Usuario
      }).value;
      this.userService.updateUserImage(this.userData.ID, formData).subscribe({
        next: (response) => {
          this.toastr.success('Imagen actualizada exitosamente','',{toastClass:'custom-toast'});
          this.getUserInfo();
        },
        error: (error) => {
          console.error('Error al actualizar la imagen:', error);
          this.toastr.error('Error al actualizar la imagen','',{toastClass:'custom-toast'});
        }
      });
    }
  }

  updateUserInfo(): void {
    this.userService.updateUserInfo(this.userData).subscribe({
      next: (response) => {
        if(response.message==='Información actualizada exitosamente'){
          this.toastr.success(response.message,'',{toastClass:'custom-toast'});
        } 
      },
      error: (error) => {
        console.error('Error al actualizar la información:', error);
        this.toastr.error('Error al actualizar la información','',{toastClass:'custom-toast'});
      }
    });
  }

  updatePassword(): void {
    if (this.userData.newPassword !== this.userData.confirmPassword) {
      this.toastr.error('Las contraseñas no coinciden','',{toastClass:'custom-toast'});
      return;
    }
    this.userService.updatePassword({
      Password: this.userData.newPassword
    }).subscribe({
      next: (response) => {
        if(response.message==='Contraseña actualizada exitosamente'){
          this.toastr.success(response.message,'',{toastClass:'custom-toast'});
          this.userData.newPassword = '';
          this.userData.confirmPassword = '';
        }
      },
      error: (error) => {
        console.error('Error al actualizar la contraseña:', error);
        this.toastr.error('Error al actualizar la contraseña','',{toastClass:'custom-toast'});
      }
    });
  }

  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
