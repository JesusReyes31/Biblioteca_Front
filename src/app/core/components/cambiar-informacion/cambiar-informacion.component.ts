import { Component } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SweetalertService } from '../../services/sweetalert.service';


@Component({
  selector: 'app-cambiar-informacion',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './cambiar-informacion.component.html',
  styleUrl: './cambiar-informacion.component.css'
})
export class CambiarInformacionComponent {
  userData: any = {};
  selectedFile: File | null = null;
  sucursalInfo: any = null;
  userTypes = ['Admin', 'Sucursal', 'Prestamos', 'Inventario'];
  constructor(private userService:UsersService,private fb:FormBuilder,private sweetalert:SweetalertService) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (data) => {
        this.userData = data;
        // Si el usuario es de alguno de los tipos especificados, obtener info de sucursal
        if (this.userTypes.includes(this.userData.Tipo_Usuario)) {
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
        this.sucursalInfo = data;
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
    console.log(this.selectedFile)
  }

  uploadImage(): void {
    if (this.selectedFile) {
      const formData = this.fb.group({
        Imagen: this.selectedFile,
        Nombre_Usuario: this.userData.Nombre_Usuario
      }).value;

      // console.log('Datos de imagen:', formData);

      this.userService.updateUserImage(this.userData.ID, formData).subscribe({
        next: (response) => {
          this.sweetalert.showNoReload('Imagen actualizada exitosamente');
          this.getUserInfo();
        },
        error: (error) => {
          console.error('Error al actualizar la imagen:', error);
        }
      });
    }
  }

  updateUserInfo(): void {
    this.userService.updateUserInfo(this.userData).subscribe({
      next: (response) => {
        console.log('Información actualizada exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar la información:', error);
      }
    });
  }

  updatePassword(): void {
    if (this.userData.newPassword !== this.userData.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }

    this.userService.updatePassword({
      newPassword: this.userData.newPassword
    }).subscribe({
      next: (response) => {
        console.log('Contraseña actualizada exitosamente');
        this.userData.newPassword = '';
        this.userData.confirmPassword = '';
      },
      error: (error) => {
        console.error('Error al actualizar la contraseña:', error);
      }
    });
  }
}
